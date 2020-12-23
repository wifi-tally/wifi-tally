import { Configuration } from "../interfaces";

class NullConfiguration extends Configuration {
    fromJson(data: object): void {
        // empty. Has no settings, so nothing to load
    }
    toJson(): object {
        return {}
    }
    clone(): NullConfiguration {
        const clone = new NullConfiguration()
        clone.fromJson(this.toJson())
        return clone
    }

}

export default NullConfiguration
