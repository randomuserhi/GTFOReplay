export declare namespace Rest {
    type RequestFunc<P extends any[] = []> = (...params: P) => Promise<RequestInit> | RequestInit;
    type UrlFunc<P extends any[] = []> = (...params: P) => Promise<URL | string> | URL | string;
    type ParserFunc<P extends any[] = []> = (...params: P) => Promise<Payload> | Payload;
    type FetchFunc<T, P extends any[] = []> = (...params: P) => Promise<T>;
    interface Options<T, P extends any[] = []> {
        parser?: ParserFunc<P>;
        fetch: RequestFunc<P>;
        url: UrlFunc<P>;
        callback: (result: Response) => Promise<T>;
    }
    interface Payload {
        urlParams?: Record<string, string>;
        body?: BodyInit;
    }
    export function fetch<T, P extends any[] = []>(options: Options<T, P>): FetchFunc<T, P>;
    export function fetchJSON<T, P extends any[] = []>(options: Options<T, P>): FetchFunc<T, P>;
    export {};
}
export type Cookie = {
    name: string;
    value: string;
    expires?: Date;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: string;
} & Record<string, string>;
export declare namespace Cookie {
    function jar(...cookies: Cookie[]): string;
    function parseSetCookie(setCookie: string): Cookie;
}
