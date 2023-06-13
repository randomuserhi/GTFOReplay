interface RHU
{

    WebSockets?: RHU.WebSockets;
}

interface WebSocketConstructor
{
    prototype: WebSocket;
    new(url: string | URL, protocols?: string | string[]): WebSocket;
}

declare namespace RHU
{
    interface WebSockets
    {
        readonly CONNECTING: 0;
        readonly OPEN: 1;
        readonly CLOSING: 2;
        readonly CLOSED: 3;

        ws: RHU.WebSockets.wsConstructor;

        wsClient: RHU.WebSockets.wsClientGenerator;
    }

    namespace WebSockets
    {
        interface Options
        {
            url: string | URL;
            protocols?: string | string[];
        }

        interface ws extends WebSocket
        {
            queue: (string | ArrayBufferLike | Blob | ArrayBufferView)[];
        }
        interface wsConstructor extends WebSocketConstructor, ReflectConstruct<WebSocketConstructor, wsConstructor>
        {
            readonly prototype: ws;
            new(url: string | URL, protocols?: string | string[]): ws;
        }

        interface wsClient<T extends WebSocket, Construct extends (...args: any[]) => RHU.WebSockets.Options> extends EventTarget
        {
            args: any[];
            ws: T;

            onclose: ((this: wsClient<T, Construct>, ev: CloseEvent) => any) | null;
            onerror: ((this: wsClient<T, Construct>, ev: Event) => any) | null;
            onmessage: ((this: wsClient<T, Construct>, ev: MessageEvent) => any) | null;
            onopen: ((this: wsClient<T, Construct>, ev: Event) => any) | null;

            reconnect(...args: Parameters<Construct>): void;
            send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
            close(code?: number, reason?: string): void;

            addEventListener<T extends keyof WebSocketEventMap>(type: T, listener: (this: WebSocket, ev: WebSocketEventMap[T]) => any, options?: boolean | AddEventListenerOptions): void;
            addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
            removeEventListener<T extends keyof WebSocketEventMap>(type: T, listener: (this: WebSocket, ev: WebSocketEventMap[T]) => any, options?: boolean | EventListenerOptions): void;
            removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
        }
        interface wsClientConstructor<T extends WebSocket, Construct extends (...args: any[]) => RHU.WebSockets.Options>
        {
            readonly prototype: wsClient<T, Construct>;
            new(...args: Parameters<Construct>): wsClient<T, Construct>;
        }

        interface wsClientGenerator
        {
            new<T extends WebSocketConstructor, Construct extends (...args: any[]) => RHU.WebSockets.Options>(webSocket: T, constructor: Construct): wsClientConstructor<T extends { prototype: infer Socket } ? Socket : never, Construct>;
        }
    }
}