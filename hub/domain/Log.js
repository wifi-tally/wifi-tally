class Log {
    constructor(dateTime, severity, message) {
        if(typeof dateTime === "string") {
            dateTime = new Date(dateTime)
        } else if (typeof dateTime !== "object") {
            dateTime = new Date()
        }
        this.dateTime = dateTime
        if (severity === "INFO") {
            severity = Log.INFO
        } else if (severity === "ERROR") {
            severity = Log.ERROR
        } else if (severity === "WARN") {
            severity = Log.WARNING
        }
        this.severity = severity
        this.message = message
    }
    isError() {
        return this.severity == Log.ERROR
    }
    isWarning() {
        return this.severity == Log.WARNING
    }
    isInfo() {
        return this.severity == Log.INFO
    }
    isStatus() {
        return this.severity == Log.STATUS
    }
    toValueObject() {
        return {
            date: this.dateTime.toISOString(),
            severity: this.severity,
            message: this.message
        }
    }
}

Log.fromValueObject = function(valueObject) {
    return new Log(
        valueObject.date,
        valueObject.severity,
        valueObject.message
    )
}

Log.INFO = 0
Log.WARNING = 1
Log.ERROR = 2
Log.STATUS = 3

module.exports = Log;