export interface Connector {
    connect() : void
    disconnect() : void
    isConnected(): boolean
}