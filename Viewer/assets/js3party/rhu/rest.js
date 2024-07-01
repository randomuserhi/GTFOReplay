import { clone, exists, parseOptions } from "./rhu";
export const rest = {
    fetch: function (options) {
        const partialOpt = {
            url: "",
            fetch: undefined,
            callback: undefined,
            parser: undefined
        };
        parseOptions(partialOpt, options);
        if (!exists(partialOpt.fetch))
            throw new SyntaxError("No fetch options were provided.");
        if (!exists(partialOpt.callback))
            throw new SyntaxError("No callback was provided.");
        const opt = partialOpt;
        if (exists(opt.parser)) {
            return (async function (...params) {
                const payload = {
                    urlParams: {},
                    body: null
                };
                parseOptions(payload, opt.parser(...params));
                const init = clone(opt.fetch);
                init.body = payload.body;
                const url = new URL(opt.url);
                for (const key in payload.urlParams)
                    url.searchParams.append(key, payload.urlParams[key]);
                const response = await fetch(url, init);
                return await opt.callback(response);
            });
        }
        else {
            return (async function (payload) {
                const parsedPayload = {
                    urlParams: {},
                    body: null
                };
                parseOptions(parsedPayload, payload);
                const init = clone(opt.fetch);
                init.body = payload.body;
                const url = new URL(opt.url);
                for (const key in parsedPayload.urlParams)
                    url.searchParams.append(key, parsedPayload.urlParams[key]);
                const response = await fetch(url, init);
                return await opt.callback(response);
            });
        }
    },
    fetchJSON: function (options) {
        const partialOpt = {
            url: undefined,
            fetch: undefined,
            callback: undefined,
            parser: undefined
        };
        parseOptions(partialOpt, options);
        if (!exists(partialOpt.url))
            throw new SyntaxError("No fetch url was provided.");
        if (!exists(partialOpt.fetch))
            throw new SyntaxError("No fetch options were provided.");
        if (!exists(partialOpt.callback))
            throw new SyntaxError("No callback was provided.");
        const headers = new Headers(partialOpt.fetch.headers);
        headers.set("Content-Type", "application/json");
        partialOpt.fetch.headers = headers;
        const opt = partialOpt;
        if (exists(opt.parser)) {
            const parser = opt.parser;
            opt.parser = function (...params) {
                const payload = parser(...params);
                if (exists(payload.body))
                    payload.body = JSON.stringify(payload.body);
                return payload;
            };
        }
        else {
            opt.parser = function (payload) {
                if (exists(payload.body))
                    payload.body = JSON.stringify(payload.body);
                return payload;
            };
        }
        return rest.fetch(opt);
    }
};
