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
    getDateTime() {
        return this.dateTime
    }
    getSeverity() {
        return this.severity
    }
    getMessage() {
        return this.message
    }
}

Log.INFO = 0
Log.WARNING = 1
Log.ERROR = 2

module.exports = Log;