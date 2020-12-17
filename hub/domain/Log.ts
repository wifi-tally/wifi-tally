export enum Severity {
    INFO = 0,
    WARNING = 1,
    ERROR = 2,
    STATUS = 3,
}

export type LogObjectType = {
    severity: Severity
    date: string
    message: string
}

export class Log {
    severity: Severity
    dateTime: Date
    message: string

    constructor(dateTime: Date | string | null, severity: Severity | string | null, message: string) {
        if(typeof dateTime === "string") {
            this.dateTime = new Date(dateTime)
        } else if (dateTime instanceof Date) {
            this.dateTime = dateTime
        } else {
            this.dateTime = new Date()
        }

        if (typeof severity === "number") {
            this.severity = severity
        } else if (severity === "INFO") {
            this.severity = Severity.INFO
        } else if (severity === "ERROR") {
            this.severity = Severity.ERROR
        } else if (severity === "WARN") {
            this.severity = Severity.WARNING
        } else {
            this.severity = Severity.STATUS
        }

        this.message = message
    }
    isError() {
        return this.severity === Severity.ERROR
    }
    isWarning() {
        return this.severity === Severity.WARNING
    }
    isInfo() {
        return this.severity === Severity.INFO
    }
    isStatus() {
        return this.severity === Severity.STATUS
    }
    toJson(): LogObjectType {
        return {
            date: this.dateTime.toISOString(),
            severity: this.severity,
            message: this.message
        }
    }
    
    static fromJson = function(valueObject: LogObjectType) {
        return new Log(
            valueObject.date,
            valueObject.severity,
            valueObject.message
        )
    }
}

export default Log
