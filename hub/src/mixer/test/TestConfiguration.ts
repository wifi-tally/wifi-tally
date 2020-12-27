import { ChannelList } from "../../lib/MixerCommunicator";
import { Configuration } from "../interfaces";


export type TestConfigurationSaveType = {
    programs: ChannelList
    previews: ChannelList
}

class TestConfiguration extends Configuration {
    programs: ChannelList = null
    previews: ChannelList = null

    getPort() {
        return (typeof process.env.TEST_MIXER_PORT === "string" && parseInt(process.env.TEST_MIXER_PORT, 10)) || 3030
    }

    setPrograms(programs: ChannelList) {
        this.programs = programs
    }
    getPrograms() {
        return this.programs
    }

    setPreviews(previews: ChannelList) {
        this.previews = previews
    }
    getPreviews() {
        return this.previews
    }

    fromJson(data: TestConfigurationSaveType): void {
        this.programs = data.programs
        this.previews = data.previews
    }
    toJson(): TestConfigurationSaveType {
        return {
            programs: this.programs,
            previews: this.previews,
        }
    }
    clone(): TestConfiguration {
        const clone = new TestConfiguration()
        clone.fromJson(this.toJson())
        return clone
    }
}

export default TestConfiguration
