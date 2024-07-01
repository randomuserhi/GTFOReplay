export interface Rest {
    fetch<T>(options: Rest.Options<T, Rest.ParserFunc>): Rest.FetchFunc<T, Rest.ParserFunc>;
    fetch<T, P extends (...params: any[]) => Rest.Payload>(options: Rest.Options<T, P>): Rest.FetchFunc<T, P>;
    fetchJSON<T>(options: Rest.Options<T, Rest.ParserFunc>): Rest.FetchFunc<T, Rest.ParserFunc>;
    fetchJSON<T, P extends (...params: any[]) => Rest.Payload>(options: Rest.Options<T, P>): Rest.FetchFunc<T, P>;
}
export declare namespace Rest {
    type ParserFunc = (payload: Rest.Payload) => Rest.Payload;
    type FetchFunc<T, P extends (...params: any[]) => Rest.Payload> = (...params: Parameters<P>) => Promise<T>;
    interface Options<T, P extends (...params: any[]) => Rest.Payload> {
        url: URL | string;
        fetch: RequestInit;
        callback: (result: Response) => Promise<T>;
        parser?: P;
    }
    interface Payload {
        urlParams?: Record<string, string>;
        body?: BodyInit | null;
    }
}
export declare const rest: Rest;
