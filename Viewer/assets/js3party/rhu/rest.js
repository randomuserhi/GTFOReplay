import { exists, parseOptions } from "./rhu.js";
const _fetch = fetch;
export var Rest;
(function (Rest) {
    function fetch(options) {
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
        const opt = partialOpt;
        if (exists(opt.parser)) {
            return (async function (...params) {
                const payload = {
                    urlParams: {},
                    body: undefined
                };
                parseOptions(payload, opt.parser(...params));
                const init = await opt.fetch(...params);
                if (exists(payload.body)) {
                    init.body = payload.body;
                }
                const url = new URL(await opt.url(...params));
                for (const key in payload.urlParams)
                    if (exists(payload.urlParams[key]))
                        url.searchParams.append(key, payload.urlParams[key]);
                const response = await _fetch(url, init);
                return await opt.callback(response);
            });
        }
        else {
            return (async function (...params) {
                const init = await opt.fetch(...params);
                const url = new URL(await opt.url(...params));
                const response = await _fetch(url, init);
                return await opt.callback(response);
            });
        }
    }
    Rest.fetch = fetch;
    function fetchJSON(options) {
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
        const fetch = partialOpt.fetch;
        partialOpt.fetch = async (...params) => {
            const request = await fetch(...params);
            const headers = new Headers(request.headers);
            headers.set("Content-Type", "application/json");
            request.headers = headers;
            return request;
        };
        const opt = partialOpt;
        if (exists(opt.parser)) {
            const parser = opt.parser;
            opt.parser = async function (...params) {
                const payload = await parser(...params);
                if (exists(payload.body))
                    payload.body = JSON.stringify(payload.body);
                return payload;
            };
        }
        return Rest.fetch(opt);
    }
    Rest.fetchJSON = fetchJSON;
})(Rest || (Rest = {}));
function isNonEmptyString(str) {
    return typeof str === "string" && !!str.trim();
}
function parseNameValuePair(nameValuePairStr) {
    let name = "";
    let value = "";
    const nameValueArr = nameValuePairStr.split("=");
    if (nameValueArr.length > 1) {
        name = nameValueArr.shift();
        value = nameValueArr.join("=");
    }
    else {
        value = nameValuePairStr;
    }
    return { name: name, value: value };
}
export var Cookie;
(function (Cookie) {
    function jar(...cookies) {
        const str = [];
        for (const cookie of cookies) {
            str.push(`${cookie.name}=${cookie.value}`);
        }
        return str.join("; ");
    }
    Cookie.jar = jar;
    function parseSetCookie(setCookie) {
        const parts = setCookie.split(";").filter(isNonEmptyString);
        const nameValuePairStr = parts.shift();
        if (nameValuePairStr === undefined)
            throw new Error(`Unable to parse 'set-cookie' string of value: ${setCookie}`);
        const parsed = parseNameValuePair(nameValuePairStr);
        const name = parsed.name;
        const value = decodeURIComponent(parsed.value);
        const cookie = { name, value };
        parts.forEach(function (part) {
            const sides = part.split("=");
            const key = sides.shift().trimStart().toLowerCase();
            const value = sides.join("=");
            if (key === "expires") {
                cookie.expires = new Date(value);
            }
            else if (key === "max-age") {
                cookie.maxAge = parseInt(value, 10);
            }
            else if (key === "secure") {
                cookie.secure = true;
            }
            else if (key === "httponly") {
                cookie.httpOnly = true;
            }
            else if (key === "samesite") {
                cookie.sameSite = value;
            }
            else {
                cookie[key] = value;
            }
        });
        return cookie;
    }
    Cookie.parseSetCookie = parseSetCookie;
})(Cookie || (Cookie = {}));
