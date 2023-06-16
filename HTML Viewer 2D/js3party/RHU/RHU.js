(function () {
    let core;
    (function () {
        core = {
            exists: function (object) {
                return object !== null && object !== undefined;
            },
            parseOptions: function (template, opt) {
                if (!core.exists(opt))
                    return template;
                if (!core.exists(template))
                    return template;
                let result = template;
                Object.assign(result, opt);
                return result;
            },
            dependencies: function (options) {
                let opt = {
                    hard: [],
                    soft: [],
                    trace: undefined
                };
                core.parseOptions(opt, options);
                let check = (items) => {
                    let has = [];
                    let missing = [];
                    let set = {};
                    for (let path of items) {
                        if (core.exists(set[path]))
                            continue;
                        set[path] = true;
                        let traversal = path.split(".");
                        let obj = window;
                        for (; traversal.length !== 0 && core.exists(obj); obj = obj[(traversal.shift())]) {
                        }
                        if (core.exists(obj))
                            has.push(path);
                        else
                            missing.push(path);
                    }
                    return {
                        has: has,
                        missing: missing
                    };
                };
                let hard = check(opt.hard);
                let soft = check(opt.soft);
                return {
                    hard: hard,
                    soft: soft,
                    trace: opt.trace
                };
            },
            path: {
                join: function (...paths) {
                    const separator = "/";
                    paths = paths.map((part, index) => {
                        if (index)
                            part = part.replace(new RegExp("^" + separator), "");
                        if (index !== paths.length - 1)
                            part = part.replace(new RegExp(separator + "$"), "");
                        return part;
                    });
                    return paths.join(separator);
                },
                isAbsolute: function (path) {
                    return /^([a-z]+:)?[\\/]/i.test(path);
                }
            },
            readyState: "loading"
        };
    })();
    let result = core.dependencies({
        hard: [
            "document.createElement",
            "document.head",
            "document.createTextNode",
            "window.Function",
            "Map",
            "Set",
            "Reflect"
        ]
    });
    if (result.hard.missing.length !== 0) {
        let msg = `RHU was unable to import due to missing dependencies.`;
        if (core.exists(result.trace) && core.exists(result.trace.stack))
            msg += `\n${result.trace.stack.split("\n").splice(1).join("\n")}\n`;
        for (let dependency of result.hard.missing) {
            msg += (`\n\tMissing '${dependency}'`);
        }
        console.error(msg);
        return;
    }
    (function () {
        let loaded;
        let scripts = document.getElementsByTagName("script");
        for (let s of scripts) {
            var type = String(s.type).replace(/ /g, "");
            if (type.match(/^text\/x-rhu-config(;.*)?$/) && !type.match(/;executed=true/)) {
                s.type += ";executed=true";
                loaded = Function(`"use strict"; let RHU = { config: {} }; ${s.innerHTML}; return RHU;`)();
            }
        }
        let Options = {
            config: {}
        };
        core.parseOptions(Options, loaded);
        core.config = {
            root: undefined,
            extensions: [],
            modules: [],
            includes: {}
        };
        core.parseOptions(core.config, Options.config);
    })();
    (function () {
        let config = core.config;
        let root = {
            location: config.root,
            script: "",
            params: {}
        };
        if (core.exists(document.currentScript)) {
            if (!core.exists(root.location)) {
                let s = document.currentScript;
                let r = s.src.match(/(.*)[/\\]/);
                root.location = "";
                if (core.exists(r))
                    root.location = r[1] || "";
                root.script = s.innerHTML;
                let params = (new URL(s.src)).searchParams;
                for (let key of params.keys()) {
                    root.params[key] = params.get(key);
                }
            }
        }
        if (!core.exists(root.location))
            throw new Error("Unable to get root location.");
        core.loader = {
            timeout: 15 * 1000,
            head: document.head,
            root: Object.assign({
                path: function (path) {
                    return core.path.join(this.location, path);
                }
            }, root),
            JS: function (path, module, callback) {
                let mod = {
                    name: "",
                    type: "module"
                };
                core.parseOptions(mod, module);
                if (!core.exists(mod.name) || mod.name === "") {
                    console.error("Cannot load module without a name.");
                    return false;
                }
                if (!core.exists(mod.type) || mod.type === "") {
                    console.error("Cannot load module without a type.");
                    return false;
                }
                let script = document.createElement("script");
                script.type = "text/javascript";
                script.src = path;
                let handled = false;
                script.onload = function () {
                    handled = true;
                    if (core.exists(callback))
                        callback(true);
                };
                let onerror = function () {
                    if (handled)
                        return;
                    if (core.exists(mod.type))
                        console.error(`Unable to find ${mod.type}, '${mod.name}'.`);
                    else
                        console.error(`Unable to load script: [RHU]/${path}`);
                    handled = true;
                    if (core.exists(callback))
                        callback(false);
                };
                script.onerror = onerror;
                setTimeout(onerror, this.timeout);
                this.head.append(script);
                return true;
            }
        };
    })();
    (function () {
        if (core.exists(window.RHU))
            console.warn("Overwriting global RHU...");
        let RHU = window.RHU = {
            version: "1.0.0",
            MODULE: "module",
            EXTENSION: "x-module",
            LOADING: "loading",
            COMPLETE: "complete",
            isMobile: function () {
                if (RHU.exists(navigator.userAgentData) && RHU.exists(navigator.userAgentData.mobile))
                    return navigator.userAgentData.mobile;
                else
                    return ((a) => /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4)))(navigator.userAgent || navigator.vendor || window.opera);
            },
            exists: function (obj) {
                return obj !== null && obj !== undefined;
            },
            parseOptions: function (template, options) {
                if (!RHU.exists(options))
                    return template;
                if (!RHU.exists(template))
                    return template;
                let result = template;
                Object.assign(result, options);
                return result;
            },
            properties: function (object, options = {}, operation) {
                if (!RHU.exists(object))
                    throw TypeError("Cannot get properties of 'null' or 'undefined'.");
                let opt = {
                    enumerable: undefined,
                    configurable: undefined,
                    symbols: undefined,
                    hasOwn: undefined,
                    writable: undefined,
                    get: undefined,
                    set: undefined
                };
                RHU.parseOptions(opt, options);
                let properties = new Set();
                let iterate = function (props, descriptors) {
                    for (let p of props) {
                        let descriptor = descriptors[p];
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
                                if (RHU.exists(operation))
                                    operation(curr, p);
                                properties.add(p);
                            }
                        }
                    }
                };
                let curr = object;
                do {
                    let descriptors = Object.getOwnPropertyDescriptors(curr);
                    if (!RHU.exists(opt.symbols) || opt.symbols === false) {
                        let props = Object.getOwnPropertyNames(curr);
                        iterate(props, descriptors);
                    }
                    if (!RHU.exists(opt.symbols) || opt.symbols === true) {
                        let props = Object.getOwnPropertySymbols(curr);
                        iterate(props, descriptors);
                    }
                } while ((curr = Object.getPrototypeOf(curr)) && !opt.hasOwn);
                return properties;
            },
            defineProperty: function (object, property, options, flags) {
                let opt = {
                    replace: true,
                    warn: false,
                    err: false
                };
                RHU.parseOptions(opt, flags);
                if (opt.replace || !RHU.properties(object, { hasOwn: true }).has(property)) {
                    delete object[property];
                    Object.defineProperty(object, property, options);
                    return true;
                }
                if (opt.warn)
                    console.warn(`Failed to define property '${property.toString()}', it already exists. Try 'replace: true'`);
                if (opt.err)
                    console.error(`Failed to define property '${property.toString()}', it already exists. Try 'replace: true'`);
                return false;
            },
            definePublicProperty: function (object, property, options, flags) {
                let opt = {
                    writable: true,
                    enumerable: true
                };
                return RHU.defineProperty(object, property, Object.assign(opt, options), flags);
            },
            definePublicAccessor: function (object, property, options, flags) {
                let opt = {
                    configurable: true,
                    enumerable: true
                };
                return RHU.defineProperty(object, property, Object.assign(opt, options), flags);
            },
            defineProperties: function (object, properties, flags) {
                for (let key of RHU.properties(properties, { hasOwn: true }).keys()) {
                    if (Object.hasOwnProperty.call(properties, key)) {
                        RHU.defineProperty(object, key, properties[key], flags);
                    }
                }
            },
            definePublicProperties: function (object, properties, flags) {
                let opt = function () {
                    this.configurable = true;
                    this.writable = true;
                    this.enumerable = true;
                };
                for (let key of RHU.properties(properties, { hasOwn: true }).keys()) {
                    if (Object.hasOwnProperty.call(properties, key)) {
                        let o = Object.assign(new opt(), properties[key]);
                        RHU.defineProperty(object, key, o, flags);
                    }
                }
            },
            definePublicAccessors: function (object, properties, flags) {
                let opt = function () {
                    this.configurable = true;
                    this.enumerable = true;
                };
                for (let key of RHU.properties(properties, { hasOwn: true }).keys()) {
                    if (Object.hasOwnProperty.call(properties, key)) {
                        let o = Object.assign(new opt(), properties[key]);
                        RHU.defineProperty(object, key, o, flags);
                    }
                }
            },
            assign: function (target, source, options) {
                if (target === source)
                    return target;
                RHU.defineProperties(target, Object.getOwnPropertyDescriptors(source), options);
                return target;
            },
            deleteProperties: function (object, preserve) {
                if (object === preserve)
                    return;
                RHU.properties(object, { hasOwn: true }, (obj, prop) => {
                    if (!RHU.exists(preserve) || !RHU.properties(preserve, { hasOwn: true }).has(prop))
                        delete obj[prop];
                });
            },
            clone: function (object, prototype) {
                if (RHU.exists(prototype))
                    return RHU.assign(Object.create(prototype), object);
                else
                    return RHU.assign(Object.create(Object.getPrototypeOf(object)), object);
            },
            isConstructor: function (object) {
                try {
                    Reflect.construct(String, [], object);
                }
                catch (e) {
                    return false;
                }
                return true;
            },
            inherit: function (child, base) {
                Object.setPrototypeOf(child.prototype, base.prototype);
                Object.setPrototypeOf(child, base);
            },
            reflectConstruct: function (base, name, constructor, argnames) {
                let args = argnames;
                if (!RHU.exists(args)) {
                    args = ["...args"];
                    let STRIP_COMMENTS = /((\/\/.*$)|(\/\*.*\*\/))/mg;
                    let funcString = constructor.toString().replace(STRIP_COMMENTS, "");
                    if (funcString.indexOf("function") === 0) {
                        let s = funcString.substring("function".length).trimStart();
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
                let argstr = args.join(",");
                if (!RHU.exists(name))
                    name = constructor.name;
                name.replace(/[ \t\r\n]/g, "");
                if (name === "")
                    name = "__ReflectConstruct__";
                let parts = name.split(".").filter(c => c !== "");
                let evalStr = "{ let ";
                for (let i = 0; i < parts.length - 1; ++i) {
                    let part = parts[i];
                    evalStr += `${part} = {}; ${part}.`;
                }
                evalStr += `${parts[parts.length - 1]} = function(${argstr}) { return definition.__reflect__.call(this, new.target, [${argstr}]); }; definition = ${parts.join(".")} }`;
                eval(evalStr);
                if (!RHU.exists(definition)) {
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
                    if (RHU.exists(newTarget)) {
                        let obj = Reflect.construct(base, definition.__args__(...args), definition);
                        definition.__constructor__.call(obj, ...args);
                        return obj;
                    }
                    else
                        definition.__constructor__.call(this, ...args);
                };
                return definition;
            },
            clearAttributes: function (element) {
                while (element.attributes.length > 0)
                    element.removeAttribute(element.attributes[0].name);
            },
            getElementById: function (id, clearID = true) {
                let el = document.getElementById(id);
                if (RHU.exists(el) && clearID)
                    el.removeAttribute("id");
                return el;
            },
            CustomEvent: function (type, detail) {
                return new CustomEvent(type, { detail: detail });
            }
        };
        RHU.definePublicAccessor(RHU, "readyState", {
            get: function () { return core.readyState; }
        });
        RHU.definePublicAccessor(RHU, "config", {
            get: function () { return core.config; }
        });
        let isEventListener = function (listener) {
            return listener instanceof Function;
        };
        let node = document.createTextNode("");
        let addEventListener = node.addEventListener.bind(node);
        RHU.addEventListener = function (type, listener, options) {
            let context = RHU;
            if (isEventListener(listener))
                addEventListener(type, ((e) => { listener.call(context, e.detail); }), options);
            else
                addEventListener(type, ((e) => { listener.handleEvent.call(context, e.detail); }), options);
        };
        RHU.removeEventListener = node.removeEventListener.bind(node);
        RHU.dispatchEvent = node.dispatchEvent.bind(node);
    })();
    (function () {
        core.moduleLoader = {
            importList: new Set(),
            watching: [],
            imported: [],
            run: function (module) {
                if (core.exists(module.callback))
                    module.callback(result);
                this.imported.push(module);
            },
            execute: function (module) {
                let result = core.dependencies(module);
                if (result.hard.missing.length === 0) {
                    this.run(module);
                    return true;
                }
                else {
                    let msg = `could not loaded as not all hard dependencies were found.`;
                    if (core.exists(result.trace) && core.exists(result.trace.stack))
                        msg += `\n${result.trace.stack.split("\n").splice(1).join("\n")}\n`;
                    for (let dependency of result.hard.missing) {
                        msg += (`\n\tMissing '${dependency}'`);
                    }
                    if (core.exists(module.name))
                        console.warn(`Module, '${module.name}', ${msg}`);
                    else
                        console.warn(`Unknown module ${msg}`);
                    return false;
                }
            },
            reconcile: function (allowPartial = false) {
                let oldLen = this.watching.length;
                do {
                    oldLen = this.watching.length;
                    let old = this.watching;
                    this.watching = [];
                    for (let module of old) {
                        let result = core.dependencies(module);
                        if ((!allowPartial && (result.hard.missing.length === 0 && result.soft.missing.length === 0))
                            || (allowPartial && result.hard.missing.length === 0)) {
                            if (core.exists(module.callback))
                                module.callback(result);
                            this.imported.push(module);
                        }
                        else
                            this.watching.push(module);
                    }
                } while (oldLen !== this.watching.length);
            },
            load: function (module) {
                if (core.readyState !== RHU.COMPLETE) {
                    this.watching.push(module);
                }
                else
                    this.execute(module);
            },
            onLoad: function (isSuccessful, module) {
                if (isSuccessful)
                    this.reconcile();
                this.importList.delete(module);
                if (this.importList.size === 0)
                    this.onComplete();
            },
            onComplete: function () {
                core.readyState = RHU.COMPLETE;
                this.reconcile();
                this.reconcile(true);
                for (let module of this.watching)
                    this.execute(module);
                if (core.exists(core.loader.root.params.load))
                    if (core.exists(window[core.loader.root.params.load]))
                        window[core.loader.root.params.load]();
                    else
                        console.error(`Callback for 'load' event called '${core.loader.root.params.load}' does not exist.`);
                RHU.dispatchEvent(RHU.CustomEvent("load", {}));
            }
        };
        let RHU = window.RHU;
        RHU.require = function (root, module) {
            if (core.dependencies(module).hard.missing.length === 0)
                return root;
            throw new ReferenceError("Not all hard dependencies were available.");
        };
        RHU.module = function (module) {
            return module;
        };
        RHU.import = function (module) {
            core.moduleLoader.load(module);
        };
        RHU.definePublicAccessor(RHU, "imports", {
            get: function () {
                let obj = [...core.moduleLoader.imported];
                obj.toString = function () {
                    let msg = "Imports in order of execution:";
                    for (let module of obj) {
                        msg += `\n${core.exists(module.name) ? module.name : "Unknown"}${core.exists(module.trace) && core.exists(module.trace.stack)
                            ? "\n" + module.trace.stack.split("\n")[1]
                            : ""}`;
                    }
                    return msg;
                };
                return obj;
            }
        });
        for (let module of core.config.modules) {
            core.moduleLoader.importList.add({
                path: core.loader.root.path(core.path.join("modules", `${module}.js`)),
                name: module,
                type: RHU.MODULE
            });
        }
        for (let module of core.config.extensions) {
            core.moduleLoader.importList.add({
                path: core.loader.root.path(core.path.join("extensions", `${module}.js`)),
                name: module,
                type: RHU.EXTENSION
            });
        }
        for (let includePath in core.config.includes) {
            if (typeof includePath !== "string" || includePath === "")
                continue;
            let isAbsolute = core.path.isAbsolute(includePath);
            for (let module of core.config.includes[includePath]) {
                if (typeof module !== "string" || module === "")
                    continue;
                let path;
                if (isAbsolute)
                    path = core.path.join(includePath, `${module}.js`);
                else
                    path = core.loader.root.path(core.path.join(includePath, `${module}.js`));
                core.moduleLoader.importList.add({
                    path: path,
                    name: module,
                    type: RHU.MODULE
                });
            }
        }
        if (core.moduleLoader.importList.size === 0)
            core.moduleLoader.onComplete();
        else {
            for (let module of core.moduleLoader.importList) {
                core.loader.JS(module.path, {
                    name: module.name,
                    type: module.type
                }, (isSuccessful) => core.moduleLoader.onLoad(isSuccessful, module));
            }
        }
    })();
})();
