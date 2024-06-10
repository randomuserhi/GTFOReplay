export interface Ipc { 
    send: (event: string, ...args: any[]) => void;
    invoke: (event: string, ...args: any[]) => Promise<any>;
}

export interface IpcAPI { 
    on(callback: (message: IpcMessage) => void): void; 
    send(message: IpcMessage, ...args: any[]): void; 
}

export interface IpcMessage {
    key: string;
    event: string;
    id?: number;
    type: "out" | "in";
    error?: string;
    data: any[];
}

/* exported IpcInterface */
export class IpcInterface {
    private static key: string = "IpcInterface_Key"; 
    
    private api: IpcAPI;
    private listeners: Map<string, Set<(...args: any[]) => void>>;
    private promises: Map<string, Map<number, (value: any) => void>>;
    private responses: Map<string, (...args: any[]) => Promise<{ data?: any, args?: any[] }>>;
    constructor(api: IpcAPI) {
        this.api = api;
        this.listeners = new Map();
        this.promises = new Map();
        this.responses = new Map();
        this.messageId = 0;

        this.api.on(async (message: IpcMessage) => {
            const { key, event, id, type, data, error } = message;
            if (event === undefined || data === undefined || key != IpcInterface.key) return;
            if (id === undefined) {
                this.listeners.get(event)?.forEach(cb => cb(...data));
            } else {
                if (type === "in") {
                    if (error !== undefined) throw new IpcError(error);
                    const resolve = this.promises.get(event)?.get(id);
                    if (resolve !== undefined) resolve(data[0]);
                } else {
                    if (this.responses.has(event)) {
                        const resp = this.responses.get(event)!;
                        const handle = await resp(...data);
                        const message: IpcMessage = {
                            key: IpcInterface.key,
                            event,
                            id,
                            type: "in",
                            data: [handle.data]
                        };
                        if (handle.args !== undefined) this.api.send(message, ...handle.args);
                        else this.api.send(message);
                    } else {
                        this.api.send({
                            key: IpcInterface.key,
                            event,
                            id,
                            type: "in",
                            error: `No response was setup for '${event}'.`,
                            data: []
                        });
                    }
                }
            }
        });
    }

    private messageId: number;
    private getMessageId(): number {
        const id = this.messageId;
        this.messageId = (this.messageId + 1) % Number.MAX_SAFE_INTEGER;
        return id;
    }

    public on(event: string, callback: (...args: any[]) => void) {
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event)!.add(callback);
    }

    public off(event: string, callback: (...args: any[]) => void) {
        this.listeners.get(event)?.delete(callback);
    }

    public send(event: string, ...args: any[]) {
        const message: IpcMessage = {
            key: IpcInterface.key,
            event,
            type: "out",
            data: args
        };
        this.api.send(message);
    }

    public raw(event: string, args: any[], ...options: any[]) {
        const message: IpcMessage = {
            key: IpcInterface.key,
            event,
            type: "out",
            data: args
        };
        this.api.send(message, ...options);
    }

    public resp(event: string, callback: (...args: any[]) => Promise<{ data?: any, args?: any[] }>): void {
        this.responses.set(event, callback);
    }

    public invoke(event: string, ...args: any[]): Promise<any> {
        const message: IpcMessage = {
            key: IpcInterface.key,
            event,
            type: "out",
            id: this.getMessageId(),
            data: args
        };
        const promise = new Promise((resolve) => {
            if (!this.promises.has(event)) this.promises.set(event, new Map());
            const collection = this.promises.get(event)!;
            if (collection.has(message.id!)) throw new IpcDuplicateMessageId(`Duplicate message id of '${message.id}'.`);
            collection.set(message.id!, resolve);
        });
        this.api.send(message);
        return promise;
    }
}

class IpcError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

class IpcDuplicateMessageId extends Error {
    constructor(message?: string) {
        super(message);
    }
}