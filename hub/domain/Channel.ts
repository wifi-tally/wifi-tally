class Channel {
    id: string
    name?: string

    constructor(id: string, name?: string) {
        this.id = id.toString()
        this.name = name
    }

    toValueObject() {
        return {
            id: this.id,
            name: this.name,
        }
    }
    toString() {
        return this.name || this.id
    }

    static fromValueObject = function(valueObject: any) {
        const channel = new Channel(
            valueObject.id,
            valueObject.name,
        )
        return channel
    }
}

export default Channel
