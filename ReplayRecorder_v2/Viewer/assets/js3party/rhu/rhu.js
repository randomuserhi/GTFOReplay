export function exists(obj) {
    return obj !== null && obj !== undefined;
}
export function parseOptions(template, options) {
    if (!exists(options))
        return template;
    if (!exists(template))
        return template;
    const result = template;
    Object.assign(result, options);
    return result;
}
export function properties(object, options = {}, operation) {
    if (!exists(object))
        throw TypeError("Cannot get properties of 'null' or 'undefined'.");
    const opt = {
        enumerable: undefined,
        configurable: undefined,
        symbols: undefined,
        hasOwn: undefined,
        writable: undefined,
        get: undefined,
        set: undefined
    };
    parseOptions(opt, options);
    const properties = new Set();
    const iterate = function (props, descriptors) {
        for (const p of props) {
            const descriptor = descriptors[p];
            let valid = true;
            if (opt.enumerable && descriptor.enumerable !== opt.enumerable)
                valid = false;
            if (opt.configurable && descriptor.configurable !== opt.configurable)
                valid = false;
            if (opt.writable && descriptor.writable !== opt.writable)
                valid = false;
            if (opt.get === false && descriptor.get)
                valid = false;
            else if (opt.get === true && !descriptor.get)
                valid = false;
            if (opt.set === false && descriptor.set)
                valid = false;
            else if (opt.set === true && !descriptor.set)
                valid = false;
            if (valid) {
                if (!properties.has(p)) {
                    if (exists(operation))
                        operation(curr, p);
                    properties.add(p);
                }
            }
        }
    };
    let curr = object;
    do {
        const descriptors = Object.getOwnPropertyDescriptors(curr);
        if (!exists(opt.symbols) || opt.symbols === false) {
            const props = Object.getOwnPropertyNames(curr);
            iterate(props, descriptors);
        }
        if (!exists(opt.symbols) || opt.symbols === true) {
            const props = Object.getOwnPropertySymbols(curr);
            iterate(props, descriptors);
        }
    } while ((curr = Object.getPrototypeOf(curr)) && !opt.hasOwn);
    return properties;
}
export function defineProperty(object, property, options, flags) {
    const opt = {
        replace: true,
        warn: false,
        err: false
    };
    parseOptions(opt, flags);
    if (opt.replace || !properties(object, { hasOwn: true }).has(property)) {
        delete object[property];
        Object.defineProperty(object, property, options);
        return true;
    }
    if (opt.warn)
        console.warn(`Failed to define property '${property.toString()}', it already exists. Try 'replace: true'`);
    if (opt.err)
        console.error(`Failed to define property '${property.toString()}', it already exists. Try 'replace: true'`);
    return false;
}
export function definePublicProperty(object, property, options, flags) {
    const opt = {
        writable: true,
        enumerable: true
    };
    return defineProperty(object, property, Object.assign(opt, options), flags);
}
export function definePublicAccessor(object, property, options, flags) {
    const opt = {
        configurable: true,
        enumerable: true
    };
    return defineProperty(object, property, Object.assign(opt, options), flags);
}
export function defineProperties(object, props, flags) {
    for (const key of properties(props, { hasOwn: true }).keys()) {
        if (Object.hasOwnProperty.call(props, key)) {
            defineProperty(object, key, props[key], flags);
        }
    }
}
export function definePublicProperties(object, props, flags) {
    const opt = function () {
        this.configurable = true;
        this.writable = true;
        this.enumerable = true;
    };
    for (const key of properties(props, { hasOwn: true }).keys()) {
        if (Object.hasOwnProperty.call(props, key)) {
            const o = Object.assign(new opt(), props[key]);
            defineProperty(object, key, o, flags);
        }
    }
}
export function definePublicAccessors(object, props, flags) {
    const opt = function () {
        this.configurable = true;
        this.enumerable = true;
    };
    for (const key of properties(props, { hasOwn: true }).keys()) {
        if (Object.hasOwnProperty.call(props, key)) {
            const o = Object.assign(new opt(), props[key]);
            defineProperty(object, key, o, flags);
        }
    }
}
export function assign(target, source, options) {
    if (target === source)
        return target;
    defineProperties(target, Object.getOwnPropertyDescriptors(source), options);
    return target;
}
export function deleteProperties(object, preserve) {
    if (object === preserve)
        return;
    properties(object, { hasOwn: true }, (obj, prop) => {
        if (!exists(preserve) || !properties(preserve, { hasOwn: true }).has(prop))
            delete obj[prop];
    });
}
export function clone(object, prototype) {
    if (exists(prototype))
        return assign(Object.create(prototype), object);
    else
        return assign(Object.create(Object.getPrototypeOf(object)), object);
}
export function clearAttributes(element) {
    while (element.attributes.length > 0)
        element.removeAttribute(element.attributes[0].name);
}
export function getElementById(id, clearID = true) {
    const el = document.getElementById(id);
    if (exists(el) && clearID)
        el.removeAttribute("id");
    return el;
}
export function CreateEvent(type, detail) {
    return new CustomEvent(type, { detail: detail });
}
export function isConstructor(object) {
    try {
        Reflect.construct(String, [], object);
    }
    catch (e) {
        return false;
    }
    return true;
}
export function inherit(child, base) {
    Object.setPrototypeOf(child.prototype, base.prototype);
    Object.setPrototypeOf(child, base);
}
export function reflectConstruct(base, name, constructor, argnames) {
    if (!isConstructor(base))
        throw new TypeError("'constructor' and 'base' must be object constructors.");
    let args = argnames;
    if (!exists(args)) {
        args = ["...args"];
        const STRIP_COMMENTS = /((\/\/.*$)|(\/\*.*\*\/))/mg;
        const funcString = constructor.toString().replace(STRIP_COMMENTS, "");
        if (funcString.indexOf("function") === 0) {
            const s = funcString.substring("function".length).trimStart();
            args = s.substring(s.indexOf("(") + 1, s.indexOf(")"))
                .split(",")
                .map((a) => {
                let clean = a.trim();
                clean = clean.split(/[ =]/)[0];
                return clean;
            })
                .filter((c) => c !== "");
        }
    }
    let definition;
    const argstr = args.join(",");
    if (!exists(name))
        name = constructor.name;
    name.replace(/[ \t\r\n]/g, "");
    if (name === "")
        name = "__ReflectConstruct__";
    const parts = name.split(".").filter(c => c !== "");
    let evalStr = "{ let ";
    for (let i = 0; i < parts.length - 1; ++i) {
        const part = parts[i];
        evalStr += `${part} = {}; ${part}.`;
    }
    evalStr += `${parts[parts.length - 1]} = function(${argstr}) { return definition.__reflect__.call(this, new.target, [${argstr}]); }; definition = ${parts.join(".")} }`;
    eval(evalStr);
    if (!exists(definition)) {
        console.warn("eval() call failed to create reflect constructor. Using fallback...");
        definition = function (...args) {
            return definition.__reflect__.call(this, new.target, args);
        };
    }
    definition.__constructor__ = constructor;
    definition.__args__ = function () {
        return [];
    };
    definition.__reflect__ = function (newTarget, args = []) {
        if (exists(newTarget)) {
            const obj = Reflect.construct(base, definition.__args__(...args), definition);
            definition.__constructor__.call(obj, ...args);
            return obj;
        }
        else
            definition.__constructor__.call(this, ...args);
    };
    return definition;
}
