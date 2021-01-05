import { ColorSchemeId, DefaultColorScheme } from "./ColorScheme"

export type TallyConfigurationObjectType = {
  stBrightness?: number
  opBrightness?: number
  stColor?: ColorSchemeId
  opColor?: ColorSchemeId
}

/**
 * representation of the default values if an individual tally does not override them
 */
export class DefaultTallyConfiguration {
  private _stageLightBrightness: number = DefaultTallyConfiguration.defaultBrightness
  private _stageColorScheme: ColorSchemeId = DefaultTallyConfiguration.defaultColorScheme
  private _operatorLightBrightness?: number = DefaultTallyConfiguration.defaultBrightness
  private _operatorColorScheme: ColorSchemeId = DefaultTallyConfiguration.defaultColorScheme

  static readonly defaultColorScheme : ColorSchemeId = DefaultColorScheme.id
  static readonly minOperatorLightBrightness = 20
  static readonly defaultBrightness = 100

  getStageLightBrightness() { return this._stageLightBrightness }
  setStageLightBrightness(value: number) { 
    if (value === null || value === undefined) {
      value = DefaultTallyConfiguration.defaultBrightness
    }
    this._stageLightBrightness = Math.min(Math.max(value, 0), 100)
  }

  getStageColorScheme() : ColorSchemeId { return this._stageColorScheme }
  setStageColorScheme(scheme: ColorSchemeId) { this._stageColorScheme = scheme }

  getOperatorLightBrightness() { return this._operatorLightBrightness }
  setOperatorLightBrightness(value: number) {
    const minValue = DefaultTallyConfiguration.minOperatorLightBrightness
    if (value === null || value === undefined) {
      value = DefaultTallyConfiguration.defaultBrightness
    } else if (value < minValue) {
      console.warn(`Operator Light Brightness can not be below ${minValue} to prevent a tally light that stays dark because of configuration, but got ${value}. Using ${minValue} instead.`)
      value = minValue
    }
    this._operatorLightBrightness = Math.min(value, 100)
  }

  getOperatorColorScheme() : ColorSchemeId { return this._operatorColorScheme }
  setOperatorColorScheme(scheme: ColorSchemeId) { this._operatorColorScheme = scheme }

  toJson() : TallyConfigurationObjectType {
    return {
      stBrightness: this._stageLightBrightness,
      opBrightness: this._operatorLightBrightness,
      stColor: this._stageColorScheme,
      opColor: this._operatorColorScheme,
    }
  }
  fromJson(valueObject: TallyConfigurationObjectType) {
    valueObject.opBrightness !== undefined && this.setOperatorLightBrightness(valueObject.opBrightness)
    valueObject.stBrightness !== undefined && this.setStageLightBrightness(valueObject.stBrightness)
    valueObject.stColor !== undefined && this.setStageColorScheme(valueObject.stColor)
    valueObject.opColor !== undefined && this.setOperatorColorScheme(valueObject.opColor)
  }

  clone(): DefaultTallyConfiguration {
    const clone = new DefaultTallyConfiguration()
    clone.fromJson(this.toJson())
    return clone
  }
}

/**
 * representation of an individual tally that could override DefaultTallyConfiguration
 */
export class TallyConfiguration {
  private _stageLightBrightness: number = undefined
  private _operatorLightBrightness?: number = undefined
  private _stageColorScheme: ColorSchemeId = undefined
  private _operatorColorScheme: ColorSchemeId = undefined

  getStageLightBrightness() { return this._stageLightBrightness }
  setStageLightBrightness(value: number) { 
    if (value === null || value === undefined) {
      this._stageLightBrightness = undefined
      return
    }
    this._stageLightBrightness = Math.min(Math.max(value, 0), 100)
  }

  getStageColorScheme() : ColorSchemeId { return this._stageColorScheme }
  setStageColorScheme(scheme: ColorSchemeId) { this._stageColorScheme = scheme }

  getOperatorLightBrightness() { return this._operatorLightBrightness }
  setOperatorLightBrightness(value: number) {
    const minValue = DefaultTallyConfiguration.minOperatorLightBrightness
    if (value === null || value === undefined) {
      this._operatorLightBrightness = undefined
      return
    } else if (value < minValue) {
      console.warn(`Operator Light Brightness can not be below ${minValue} to prevent a tally light that stays dark because of configuration, but got ${value}. Using ${minValue} instead.`)
      value = minValue
    }
    this._operatorLightBrightness = Math.min(value, 100)
  }

  getOperatorColorScheme() : ColorSchemeId { return this._operatorColorScheme }
  setOperatorColorScheme(scheme: ColorSchemeId) { this._operatorColorScheme = scheme }

  toJson() : TallyConfigurationObjectType {
    return {
      stBrightness: this._stageLightBrightness,
      opBrightness: this._operatorLightBrightness,
      stColor: this._stageColorScheme,
      opColor: this._operatorColorScheme,
    }
  }
  fromJson(valueObject: TallyConfigurationObjectType) {
    this.setOperatorLightBrightness(valueObject.opBrightness)
    this.setStageLightBrightness(valueObject.stBrightness)
    this.setStageColorScheme(valueObject.stColor)
    this.setOperatorColorScheme(valueObject.opColor)
  }
}

