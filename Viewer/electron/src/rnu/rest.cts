import { core } from "./core.cjs";

export interface Rest
{
    fetch<T>(options: Rest.Options<T, Rest.ParserFunc>): Rest.FetchFunc<T, Rest.ParserFunc>;
    fetch<T, P extends (...params: any[]) => Rest.Payload>(options: Rest.Options<T, P>): Rest.FetchFunc<T, P>;
    
    fetchJSON<T>(options: Rest.Options<T, Rest.ParserFunc>): Rest.FetchFunc<T, Rest.ParserFunc>;
    fetchJSON<T, P extends (...params: any[]) => Rest.Payload>(options: Rest.Options<T, P>): Rest.FetchFunc<T, P>;
}

export declare namespace Rest
{
    type ParserFunc = (payload: Rest.Payload) => Rest.Payload;
    type FetchFunc<T, P extends (...params: any[]) => Rest.Payload> = (...params: Parameters<P>) => Promise<T>;

    interface Options<T, P extends (...params: any[]) => Rest.Payload>
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

export const rest: Rest = {
    fetch: function<T, P extends (...params: any[]) => Rest.Payload>(options: Rest.Options<T, P>): Rest.FetchFunc<T, P> | Rest.FetchFunc<T, Rest.ParserFunc> {
        interface partialOpt extends Omit<Omit<Rest.Options<T, P>, "fetch">, "callback">
        {
            fetch?: RequestInit;
            callback?: (result: Response) => Promise<T>;
        }
        const partialOpt: partialOpt = {
            url: "",
            fetch: undefined,
            callback: undefined,
            parser: undefined
        };
        core.parseOptions(partialOpt, options);

        if (!core.exists(partialOpt.fetch)) throw new SyntaxError("No fetch options were provided.");
        if (!core.exists(partialOpt.callback)) throw new SyntaxError("No callback was provided.");

        const opt: Rest.Options<T, P> = partialOpt as Rest.Options<T, P>;

        /** 
         * NOTE(randomuserhi): parser check is handled outside the function such that
         *                     the generated function object does not need to do a redundant
         *                     check.
         */
        if (core.exists(opt.parser)) {
            return (async function(...params: Parameters<P>) {
                const payload: Rest.Payload = { 
                    urlParams: {},
                    body: null
                };
                core.parseOptions(payload, opt.parser!(...params));

                // NOTE(randomuserhi): clone opt.fetch so we do not effect the original settings.
                const init: RequestInit = core.clone(opt.fetch);
                init.body = payload.body;

                const url = new URL(opt.url);
                for (const key in payload.urlParams) url.searchParams.append(key, payload.urlParams[key]);
                
                const response = await fetch(url, init);
                return await opt.callback(response);
            });
        } else {
            return (async function(payload: Rest.Payload) {
                const parsedPayload: Rest.Payload = { 
                    urlParams: {},
                    body: null
                };
                core.parseOptions(parsedPayload, payload);

                // NOTE(randomuserhi): clone opt.fetch so we do not effect the original settings.
                const init: RequestInit = core.clone(opt.fetch);
                init.body = payload.body;    

                const url = new URL(opt.url);
                for (const key in parsedPayload.urlParams) url.searchParams.append(key, parsedPayload.urlParams[key]);
                const response = await fetch(url, init);
                return await opt.callback(response);
            });
        }
    },

    fetchJSON: function<T, Parser extends (...params: any[]) => Rest.Payload>(options: Rest.Options<T, Parser>): Rest.FetchFunc<T, Parser> {
        interface partialOpt extends Omit<Omit<Omit<Rest.Options<T, Parser>, "url">, "fetch">, "callback">
        {
            url?: string | URL;
            fetch?: RequestInit;
            callback?: (result: Response) => Promise<T>;
        }
        const partialOpt: partialOpt = {
            url: undefined,
            fetch: undefined,
            callback: undefined,
            parser: undefined
        };
        core.parseOptions(partialOpt, options);

        if (!core.exists(partialOpt.url)) throw new SyntaxError("No fetch url was provided.");
        if (!core.exists(partialOpt.fetch)) throw new SyntaxError("No fetch options were provided.");
        if (!core.exists(partialOpt.callback)) throw new SyntaxError("No callback was provided.");

        const headers: Headers = new Headers(partialOpt.fetch.headers);
        headers.set("Content-Type", "application/json");
        partialOpt.fetch.headers = headers;

        const opt: Rest.Options<T, Parser> = partialOpt as Rest.Options<T, Parser>;

        /** 
         * NOTE(randomuserhi): parser check is handled outside the function such that
         *                     the generated function object does not need to do a redundant
         *                     check.
         */
        if (core.exists(opt.parser)) {
            const parser = opt.parser;
            opt.parser = function(...params: any[]): Rest.Payload {
                const payload = parser(...params);

                if (core.exists(payload.body)) payload.body = JSON.stringify(payload.body);
                return payload;
            } as Parser;
        } else {
            opt.parser = function(payload) {
                if (core.exists(payload.body)) payload.body = JSON.stringify(payload.body);
                return payload;
            } as Parser;
        }
        
        return rest.fetch<T, Parser>(opt);
    }
};