import nodemcuLib from 'nodemcu-tool'
import TallyDevice from './TallyDevice'
import TallySettingsIni from './TallySettingsIni'
import tmp from 'tmp-promise'
import { promises as fs } from 'fs'

const baudRate = 115200
const fileName = "tally-settings.ini"

let mutex = false

const tryToAquireMutex = () => {
  if (!mutex) {
    mutex = true
    return true
  } else {
    return false
  }
}

export interface TallySettingsIniProgressType {
  tallyName: string
  inititalizeDone: boolean
  connectionDone: boolean
  uploadDone: boolean
  rebootDone: boolean
  allDone: boolean
  error: boolean
}

export interface TallyProgramProgressType {
  inititalizeDone: boolean
  connectionDone: boolean
  filesUploaded: number
  filesTotal: number
  rebootDone: boolean
  allDone: boolean
  error: boolean
}

class NodeMcuConnector {
  nodemcu: any

  withMutex<T> (fn: () => T): Promise<T> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const mutexAquired = tryToAquireMutex()
        if (mutexAquired) {
          clearInterval(interval)
          if (this.nodemcu.isConnected()) {
            console.warn("Serial terminal was not closed by previous process.")
            this.nodemcu.disconnect()
          }
          resolve(true)
        }
      }, 100)
    })
    .then(() => {
      return fn()
    })
    .finally(() => {
      mutex = false
    })
  }

  // injectable for easier testing
  constructor(nodemcu: any = nodemcuLib) {
    this.nodemcu = nodemcu
    this.nodemcu.onError((error:any) => {
      console.error(error)
    })
  }

  private static async getLocalFiles() {
    const dirName = __dirname + "/../../../tally/out" // @TODO: location is different on prod
    const files = await fs.readdir(dirName)
    const filteredFiles = files.filter(file => file.endsWith(".lc") || file.endsWith(".lua"))
    return Promise.all(filteredFiles.map(async file => {
      const stats = await fs.stat(dirName + "/" + file)
      return {
        fileName: file,
        filePath: `${dirName}/${file}`,
        fileSize: stats.size,
      }
    }))
  }

  private static async doFilesNeedUpdate(filesOnNodemcu: {name: string, size: number}[]) : Promise<boolean> {
    const localFiles = await NodeMcuConnector.getLocalFiles()
    return localFiles.some(localFile => {  
      return filesOnNodemcu.every(nodeMcuFile => nodeMcuFile.name !== localFile.fileName || nodeMcuFile.size !== localFile.fileSize)
    })
  }

  private sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  // gracefull connection that retries a few times
  private async connect(path: string) {
    await this.nodemcu.connect(path, baudRate, false)

    // check connection does not always work the first time, so we try it multiple times if necessary
    let retries = 3
    while (true) {
      try {
        return await this.nodemcu.checkConnection()
      } catch (e){
        if (retries === 0) {
          throw e
        }
        await this.sleep(100)
      }
      retries--
    }
  }

  private async execute(idempotentCommand: string) {
    let retries = 3
    while (true) {
      try {
        const foo = await this.nodemcu.execute(`${idempotentCommand}; print("ok")`)
        if (foo === null || !foo.response) {
          throw new Error("Did not get a response for executing the command.")
        }
        if (foo.response.toString().includes("error")) {
          throw new Error(foo.response.toString())
        }
        if (!foo.response.toString().includes("ok")) {
          throw new Error(`response did not include an "ok": ${foo.response.toString()}`)
        }
        return foo
      } catch (e){
        if (retries === 0) {
          throw e
        }
        await this.sleep(100)
      }
      retries--
    }
    
  }

  async getDevice(): Promise<TallyDevice> {
    const tallyDevice = new TallyDevice()
    const localFiles = await NodeMcuConnector.getLocalFiles()
    const updatePossible = localFiles.length > 0
    if (!updatePossible) {
      tallyDevice.update = "not-available"
    }

    try {
      return await this.withMutex(async () => {
        const list = await this.nodemcu.listDevices()
        const device = list[0]
        if (device) {
          
          tallyDevice.path = device.path
          tallyDevice.vendorId = device.vendorId
          tallyDevice.productId = device.productId

          await this.connect(device.path)
          const deviceInfo = await this.nodemcu.deviceInfo()

          tallyDevice.chipId = deviceInfo.chipID
          tallyDevice.flashId = deviceInfo.flashID
          tallyDevice.nodeMcuVersion = deviceInfo.version
          tallyDevice.nodeMcuModules = deviceInfo.modules

          const fsinfo = await this.nodemcu.fsinfo()
          if (updatePossible) {
            tallyDevice.update = await NodeMcuConnector.doFilesNeedUpdate(fsinfo.files) ? "updateable" : "up-to-date"
          }

          const settingsFileExists = fsinfo.files.some(file => file.name === fileName)

          if (settingsFileExists) {
            const res = await this.nodemcu.download(fileName)
            tallyDevice.tallySettings = new TallySettingsIni(res.toString())
          }
        }
        return tallyDevice
      })
    }
    catch (e) {
      tallyDevice.errorMessage = e
      return tallyDevice
    }
    finally {
      if(this.nodemcu && this.nodemcu.isConnected()) { await this.nodemcu.disconnect() }
    }
  }

  async program(path: string, onProgress: (state: TallyProgramProgressType) => void) {
    const files = await NodeMcuConnector.getLocalFiles()
    const progress: TallyProgramProgressType = {
      inititalizeDone: false,
      connectionDone: false,
      filesUploaded: 0,
      filesTotal: files.length,
      rebootDone: false,
      allDone: false,
      error: false,
    }
    onProgress(progress)

    try {
      await this.withMutex(async () => {
        progress.inititalizeDone = true
        onProgress(progress)

        await this.connect(path)

        progress.connectionDone = true
        onProgress(progress)

        for(const file of files) {
          await this.saveFileUpload(file.fileName, file.filePath)
          progress.filesUploaded = progress.filesUploaded + 1
          onProgress(progress)
        }

        await this.hardReset(path)

        progress.rebootDone = true
        onProgress(progress)

        progress.allDone = true
        onProgress(progress)
      })
    }
    catch (e) {
      console.error(`programming failed because of: ${e}`)

      progress.error = true
      onProgress(progress)
      return false
    }
    finally {
      if(this.nodemcu && this.nodemcu.isConnected()) { this.nodemcu.disconnect() }
    }
  }

  async writeTallySettingsIni(path: string, settingsIniString: string, onProgress: (state: TallySettingsIniProgressType) => void) {
    const settingsIni = new TallySettingsIni(settingsIniString)
    const progress: TallySettingsIniProgressType = {
      tallyName: settingsIni.getTallyName(),
      inititalizeDone: false,
      connectionDone: false,
      uploadDone: false,
      rebootDone: false,
      allDone: false,
      error: false,
    }
    onProgress(progress)

    try {
      if (!settingsIni.getTallyName()) {
        throw new Error(`Exeptected ${fileName} to contain a tally.name, but it was empty.`)
      }
      if (!settingsIni.getStationSsid()) {
        throw new Error(`Exeptected ${fileName} to contain a station ssid, but it was empty.`)
      }
      if (!settingsIni.getHubIp()) {
        throw new Error(`Exeptected ${fileName} to contain a hub.ip name, but it was empty.`)
      }

      await this.withMutex(async () => {
        progress.inititalizeDone = true
        onProgress(progress)

        await this.connect(path)

        progress.connectionDone = true
        onProgress(progress)

        try {
          await this.saveContentUpload(fileName, settingsIniString)
        } catch (e) {
          console.error(e)
        }

        progress.uploadDone = true
        onProgress(progress)
        
        await this.hardReset(path)

        progress.rebootDone = true
        onProgress(progress)

        progress.allDone = true
        onProgress(progress)
      })
      return true
    }
    catch (e) {
      console.error(`${fileName} upload failed because of: ${e}`)

      progress.error = true
      onProgress(progress)
      return false
    }
    finally {
      if(this.nodemcu && this.nodemcu.isConnected()) { this.nodemcu.disconnect() }
    }
  }

  private async hardReset(path: string) {
    await this.nodemcu.hardreset()
    await this.nodemcu.disconnect()
    await this.connect(path)

    await new Promise(resolve => { setTimeout(resolve, 3000) }) // sleep

    const failTimeout = setTimeout(() => {
      throw new Error("Could not connect to NodeMCU after hardreset.")
    }, 10000)

    let rebootSuccess = false
    while(!rebootSuccess) {
      try {
        await this.nodemcu.checkConnection()
        rebootSuccess = true
      } catch (e) {
        rebootSuccess = false
      }
    }
    clearTimeout(failTimeout)
  }

  /**
   * uploads content via nodemcu-tool
   * 
   * @param filePath the file path on nodemcu
   * @param content the file content
   */
  private async saveContentUpload(filePath: string, content: string) {
    const { path: tmpPath, cleanup: tmpCleanup } = await tmp.file({})
    try {
      await fs.writeFile(tmpPath, content)
      this.saveFileUpload(filePath, tmpPath)
    }
    finally {
      tmpCleanup()
    }
  }

  /**
   * uploads a file via nodemcu-tool and does some verification
   * 
   * @param remoteFilePath the file path on nodemcu
   * @param localFilePath the local file path
   */
  private async saveFileUpload(remoteFilePath: string, localFilePath: string) {
    if (!this.nodemcu.isConnected())  {
      throw new Error("Expected to have an already established connection to NodeMCU, but did not.")
    }

    const copyFileName = remoteFilePath + ".swp"

    try {
      await this.nodemcu.upload(localFilePath, copyFileName, {}, () => {})
      await this.sleep(1000)
      const gotContent = await this.nodemcu.download(copyFileName)
      const localContent = await fs.readFile(localFilePath).then(buffer => buffer.toString())

      if (gotContent.toString() !== localContent) {
        throw new Error(`Uploaded file does not match downloaded file. Expected file size of ${localContent.length}, but got ${gotContent.length}`)
      }

      // rename file
      await this.removeFileIfExists(remoteFilePath)
      await this.execute(`file.rename("${copyFileName}", "${remoteFilePath}")`)
    }
    finally {
      await this.removeFileIfExists(copyFileName)
    }
  }
  private async removeFileIfExists(filePath: string) {
    return this.execute(`if file.exists("${filePath}") then file.remove("${filePath}") end`)
  }
}

export default NodeMcuConnector