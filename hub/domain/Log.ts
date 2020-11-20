export enum Severity {
    INFO = 0,
    WARNING = 1,
    ERROR = 2,
    STATUS = 3,
}

export type SeverityType = typeof Severity

export class Log {
    severity: Severity
    dateTime: Date
    message: string

    constructor(dateTime: Date | string | null, severity: string, message: string) {
        if(typeof dateTime === "string") {
            dateTime = new Date(dateTime)
        } else if (typeof dateTime !== "object") {
            dateTime = new Date()
        }
        this.dateTime = dateTime

        if (severity === "INFO") {
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
    toValueObject() {
        return {
            date: this.dateTime.toISOString(),
            severity: this.severity,
            message: this.message
        }
    }
}

export type LogType = typeof Log

export const logFromValueObject = function(valueObject: any) {
    return new Log(
        valueObject.date,
        valueObject.severity,
        valueObject.message
    )
}
