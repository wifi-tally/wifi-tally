import { Configuration } from "../interfaces";

class TestConfiguration extends Configuration {
    getPort() {
        return (typeof process.env.TEST_MIXER_PORT === "string" && parseInt(process.env.TEST_MIXER_PORT, 10)) || 3030
    }

    fromJson(data: object): void {
        // empty. Has no settings, so nothing to load
    }
    toJson(): object {
        return {}
    }
    clone(): TestConfiguration {
        const clone = new TestConfiguration()
        clone.fromJson(this.toJson())
        return clone
    }

}

export default TestConfiguration
