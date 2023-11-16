declare namespace RHU
{
    interface Modules
    {
        "rhu/rest": RHU.Rest;
    }

    interface Rest
    {
        fetch<T>(options: RHU.Rest.Options<T, RHU.Rest.ParserFunc>): RHU.Rest.FetchFunc<T, RHU.Rest.ParserFunc>;
        fetch<T, P extends (...params: any[]) => RHU.Rest.Payload>(options: RHU.Rest.Options<T, P>): RHU.Rest.FetchFunc<T, P>;
        
        fetchJSON<T>(options: RHU.Rest.Options<T, RHU.Rest.ParserFunc>): RHU.Rest.FetchFunc<T, RHU.Rest.ParserFunc>;
        fetchJSON<T, P extends (...params: any[]) => RHU.Rest.Payload>(options: RHU.Rest.Options<T, P>): RHU.Rest.FetchFunc<T, P>;
    }

    namespace Rest
    {
        type ParserFunc = (payload: RHU.Rest.Payload) => RHU.Rest.Payload;
        type FetchFunc<T, P extends (...params: any[]) => RHU.Rest.Payload> = (...params: Parameters<P>) => Promise<T>;

        interface Options<T, P extends (...params: any[]) => RHU.Rest.Payload>
        {
            url: URL | string;
            fetch: RequestInit;
            callback: (result: Response) => Promise<T>;
            parser?: P;
        }

        interface Payload
        {
            urlParams?: Record<string, string>;
            body?: BodyInit | null;
        }
    }
}