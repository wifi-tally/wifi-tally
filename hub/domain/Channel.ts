import { string } from "yargs"

export type ChannelSaveObject = {
    id: string
    name?: string
}

class Channel {
    id: string
    name?: string

    constructor(id: string, name?: string) {
        this.id = id.toString()
        this.name = name
    }

    toJson(): ChannelSaveObject {
        return {
            id: this.id,
            name: this.name,
        }
    }
    toString() {
        return this.name || this.id
    }

    static fromJson = function(valueObject: ChannelSaveObject) {
        const channel = new Channel(
            valueObject.id,
            valueObject.name,
        )
        return channel
    }
}

export default Channel
