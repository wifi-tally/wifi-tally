class Channel {
    constructor(id, name) {
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
        return name || id
    }
}

Channel.fromValueObject = function(valueObject) {
    const channel = new Channel(
        valueObject.id,
        valueObject.name,
    )
    return channel
}

module.exports = Channel
