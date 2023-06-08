(function () {
    let RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    RHU.import(RHU.module({ trace: new Error(),
        name: "rhu/rest", hard: ["fetch", "URL", "Promise"],
        callback: function () {
            if (RHU.exists(RHU.Rest))
                console.warn("Overwriting RHU.Rest...");
            let Rest = RHU.Rest = {
                fetch: function (options) {
                    let partialOpt = {
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
                    let opt = partialOpt;
                    if (RHU.exists(opt.parser)) {
                        return (async function (...params) {
                            let payload = {
                                urlParams: {},
                                body: null
                            };
                            RHU.parseOptions(payload, opt.parser(...params));
                            let init = RHU.clone(opt.fetch);
                            init.body = payload.body;
                            let url = new URL(opt.url);
                            for (let key in payload.urlParams)
                                url.searchParams.append(key, payload.urlParams[key]);
                            const response = await fetch(url, init);
                            return await opt.callback(response);
                        });
                    }
                    else {
                        return (async function (payload) {
                            let parsedPayload = {
                                urlParams: {},
                                body: null
                            };
                            RHU.parseOptions(parsedPayload, payload);
                            let init = RHU.clone(opt.fetch);
                            init.body = payload.body;
                            let url = new URL(opt.url);
                            for (let key in parsedPayload.urlParams)
                                url.searchParams.append(key, parsedPayload.urlParams[key]);
                            const response = await fetch(url, init);
                            return await opt.callback(response);
                        });
                    }
                },
                fetchJSON: function (options) {
                    let partialOpt = {
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
                    let headers = new Headers(partialOpt.fetch.headers);
                    headers.set("Content-Type", "application/json");
                    partialOpt.fetch.headers = headers;
                    let opt = partialOpt;
                    if (RHU.exists(opt.parser)) {
                        let parser = opt.parser;
                        opt.parser = function (...params) {
                            let payload = parser(...params);
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
        }
    }));
})();
