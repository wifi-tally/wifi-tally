import TallySettingsIni from "./TallySettingsIni"

export type UpdateType = "not-available" | "up-to-date" | "updateable"

export interface TallyDeviceObjectType {
  vendorId: string
  productId: string
  chipId: string
  flashId: string
  nodeMcuModules: string
  nodeMcuVersion: string
  path: string
  tallySettings?: string
  errorMessage?: string
  update?: UpdateType
}

class TallyDevice{
  vendorId: string
  productId: string
  chipId: string
  flashId: string
  nodeMcuModules: string
  nodeMcuVersion: string
  path: string
  update?: UpdateType
  tallySettings?: TallySettingsIni
  errorMessage?: string

  toJson(): TallyDeviceObjectType {
    return {
      vendorId: this.vendorId,
      productId: this.productId,
      chipId: this.chipId,
      flashId: this.flashId,
      nodeMcuModules: this.nodeMcuModules,
      nodeMcuVersion: this.nodeMcuVersion,
      path: this.path,
      tallySettings: this.tallySettings ? this.tallySettings.toString() : undefined,
      errorMessage: this.errorMessage,
      update: this.update,
    }
  }

  public static fromJson(data:TallyDeviceObjectType): TallyDevice {
    const device = new TallyDevice()
    device.vendorId = data.vendorId
    device.productId = data.productId
    device.chipId = data.chipId
    device.flashId = data.flashId
    device.nodeMcuModules = data.nodeMcuModules
    device.nodeMcuVersion = data.nodeMcuVersion
    device.path = data.path
    device.tallySettings = data.tallySettings ? new TallySettingsIni(data.tallySettings) : undefined
    device.errorMessage = data.errorMessage
    device.update = data.update

    return device
  }
}

export default TallyDevice