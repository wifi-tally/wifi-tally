export type TallyConfigurationObjectType = {
  stBrightness?: number
  opBrightness?: number
}

/**
 * representation of the default values if an individual tally does not override them
 */
export class DefaultTallyConfiguration {
  private _stageLightBrightness: number = DefaultTallyConfiguration.defaultBrightness
  private _operatorLightBrightness?: number = DefaultTallyConfiguration.defaultBrightness

  static readonly minOperatorLightBrightness = 20
  static readonly defaultBrightness = 100

  getStageLightBrightness() { return this._stageLightBrightness }
  setStageLightBrightness(value: number) { 
    if (value === null || value === undefined) {
      value = DefaultTallyConfiguration.defaultBrightness
    }
    this._stageLightBrightness = Math.min(Math.max(value, 0), 100)
  }

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

  toJson() : TallyConfigurationObjectType {
    return {
      stBrightness: this._stageLightBrightness,
      opBrightness: this._operatorLightBrightness,
    }
  }
  fromJson(valueObject: TallyConfigurationObjectType) {
    valueObject.opBrightness !== undefined && this.setOperatorLightBrightness(valueObject.opBrightness)
    valueObject.stBrightness !== undefined && this.setStageLightBrightness(valueObject.stBrightness)
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

  getStageLightBrightness() { return this._stageLightBrightness }
  setStageLightBrightness(value: number) { 
    if (value === null || value === undefined) {
      this._stageLightBrightness = undefined
      return
    }
    this._stageLightBrightness = Math.min(Math.max(value, 0), 100)
  }

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

  toJson() : TallyConfigurationObjectType {
    return {
      stBrightness: this._stageLightBrightness,
      opBrightness: this._operatorLightBrightness,
    }
  }
  fromJson(valueObject: TallyConfigurationObjectType) {
    this.setOperatorLightBrightness(valueObject.opBrightness)
    this.setStageLightBrightness(valueObject.stBrightness)
  }
}

