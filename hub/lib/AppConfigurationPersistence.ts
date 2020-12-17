import { AppConfiguration } from "./AppConfiguration";
import fs from 'fs'
import os from 'os'
import ServerEventEmitter from "./ServerEventEmitter";

class AppConfigurationPersistence {
    configuration: AppConfiguration
    fileName: string
    emitter: ServerEventEmitter
    saveTimeout?: NodeJS.Timeout

    constructor(configuration: AppConfiguration, emitter: ServerEventEmitter, fileName?: string) {
        this.configuration = configuration
        this.emitter = emitter
        this.fileName = fileName || process.env.CONFIG_FILE || (os.homedir() + "/.wifi-tally.json")
        this.load()
        this.emitter.on("config.changed", config => {
            if (config === this.configuration) {
                this.scheduleSave()
            }
        })
    }

    getConfiguration() : AppConfiguration {
        return this.configuration
    }

    private load() {
        if(fs.existsSync(this.fileName)) {
            const rawdata = fs.readFileSync(this.fileName)
            let config: unknown
            try {
                config = JSON.parse(rawdata.toString())
            } catch (e) {
                if (e instanceof SyntaxError && rawdata.byteLength === 0) {
                    console.warn(`Could not parse ${this.fileName}, because file is empty. Using defaults.`)
                    return
                } else { 
                    console.error(`Error when parsing ${this.fileName}: ${e}`)
                    throw e 
                }
            }
            if (typeof config !== "object" || config === null) {
                throw new Error(`Expected ${this.fileName} to contain a JSON object, but got ${typeof config}`)
            }
            this.configuration.fromJson(config)
        } else {
            console.warn(`Configuration File ${this.fileName} does not exist. Using defaults.`)
            
            return
        }
    }

    /* don't save instantly, but wait a bit to prevent too many writes in short succession */
    private scheduleSave() {
        if (this.saveTimeout) { return }
        this.saveTimeout = setTimeout(this.save.bind(this), AppConfigurationPersistence.saveDelay)
    }

    async save() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout)
            this.saveTimeout = undefined
        }

        return new Promise((resolve, reject) => {
            const data: object = this.configuration.toJson()
            const dataToWrite = Object.assign({
                _warning: "This file was automatically generated.",
                _warning2: "Do not edit it while the hub is running. Your changes will be lost."
            }, data)
            
            fs.writeFile(this.fileName, JSON.stringify(dataToWrite, null, '\t'), err => {
                if(err) {
                    console.error(`error when saving file ${this.fileName}: ${err}`)
                    reject(err)
                } else {
                    resolve(null)
                }
            })
        })
    }

    private static readonly saveDelay = 500 //ms
}

export default AppConfigurationPersistence
