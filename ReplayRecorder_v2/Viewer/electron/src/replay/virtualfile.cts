import { TcpClient } from "../net/tcpClient.cjs";

export class VirtualFile {
    private requests: {
        start: number;
        end: number;
        numBytes: number;
        callback: (bytes?: ArrayBufferLike) => void;
    }[];

    ip: string;
    port: number;
    client: TcpClient;

    start: number;
    end: number;
    buffer: Uint8Array;

    constructor(ip: string, port: number) {
        this.ip = ip;
        this.port = port;
        this.client = new TcpClient();
        this.requests = [];

        this.start = 0;
        this.end = 0;
        this.buffer = new Uint8Array(0);

        this.client.addEventListener("message", (bytes) => {
            this.buffer = Buffer.concat([this.buffer, bytes]);
            this.end += bytes.byteLength;

            const requests = this.requests;
            this.requests = [];
            requests.forEach(r => this.doRequest(r));
        });
    }

    public async open() {
        await this.client.connect(this.ip, this.port);
    }

    public close() {
        this.client.disconnect();
    }

    private doRequest(request: { start: number; end: number; numBytes: number; callback: (bytes?: ArrayBufferLike) => void }) {
        const { start, end, numBytes, callback } = request;
        if (end < start) {
            callback();
            return;
        }
        this.getBytesImpl(start, end, numBytes).then(callback).catch(() => {
            this.requests.push({
                start,
                end,
                numBytes,
                callback
            });
        });
    }

    // TODO(randomuserhi): Safety if buffer grows too fast (stop filling up memory)
    private getBytesImpl(start: number, end: number, numBytes: number): Promise<ArrayBufferLike> {
        return new Promise((resolve, reject) => {
            if (start >= this.start && end <= this.end) {
                const buffer = new Uint8Array(numBytes);
                for (let i = 0; i < numBytes; ++i) {
                    buffer[i] = this.buffer[i + this.start - start];
                }
                this.start = end;
                const temp = new Uint8Array(this.buffer.byteLength - numBytes);
                for (let i = 0; i < temp.byteLength; ++i) {
                    temp[i] = this.buffer[i + numBytes];
                }
                this.buffer = temp;
                resolve(buffer);
            } else {
                reject();
            }
        });
    }
    public getBytes(index: number, numBytes: number): Promise<ArrayBufferLike | undefined> {
        const start = index;
        const end = index + numBytes;
        return new Promise((resolve) => {
            this.doRequest({
                start,
                end,
                numBytes,
                callback: resolve
            });
        });
    }
}