import { Configuration } from "../interfaces";

class NullConfiguration extends Configuration {
    fromSave(data: object): void {
        // empty. Has no settings, so nothing to load
    }
    toSave(): object {
        return {}
    }
    clone(): NullConfiguration {
        const clone = new NullConfiguration()
        clone.fromSave(this.toSave())
        return clone
    }

}

export default NullConfiguration
