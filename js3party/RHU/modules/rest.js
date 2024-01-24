(function () {
    const RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    RHU.module(new Error(), "rhu/rest", {}, function () {
        const Rest = {
            fetch: function (options) {
                const partialOpt = {
                    url: "",
                    fetch: undefined,
                    callback: undefined,
                    parser: undefined
                };
                RHU.parseOptions(partialOpt, options);
                if (!RHU.exists(partialOpt.fetch))
                    throw new SyntaxError("No fetch options were provided.");
                if (!RHU.exists(partialOpt.callback))
                    throw new SyntaxError("No callback was provided.");
                const opt = partialOpt;
                if (RHU.exists(opt.parser)) {
                    return (async function (...params) {
                        const payload = {
                            urlParams: {},
                            body: null
                        };
                        RHU.parseOptions(payload, opt.parser(...params));
                        const init = RHU.clone(opt.fetch);
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
                        RHU.parseOptions(parsedPayload, payload);
                        const init = RHU.clone(opt.fetch);
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
                RHU.parseOptions(partialOpt, options);
                if (!RHU.exists(partialOpt.url))
                    throw new SyntaxError("No fetch url was provided.");
                if (!RHU.exists(partialOpt.fetch))
                    throw new SyntaxError("No fetch options were provided.");
                if (!RHU.exists(partialOpt.callback))
                    throw new SyntaxError("No callback was provided.");
                const headers = new Headers(partialOpt.fetch.headers);
                headers.set("Content-Type", "application/json");
                partialOpt.fetch.headers = headers;
                const opt = partialOpt;
                if (RHU.exists(opt.parser)) {
                    const parser = opt.parser;
                    opt.parser = function (...params) {
                        const payload = parser(...params);
                        if (RHU.exists(payload.body))
                            payload.body = JSON.stringify(payload.body);
                        return payload;
                    };
                }
                else {
                    opt.parser = function (payload) {
                        if (RHU.exists(payload.body))
                            payload.body = JSON.stringify(payload.body);
                        return payload;
                    };
                }
                return Rest.fetch(opt);
            }
        };
        return Rest;
    });
})();
