(function () {
    const RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    RHU.module(new Error(), "rhu/macro", { Weak: "rhu/weak" }, function ({ Weak: { WeakRefMap, WeakCollection } }) {
        const symbols = {
            macro: Symbol("macro"),
            constructed: Symbol("macro constructed"),
            prototype: Symbol("macro prototype")
        };
        RHU.defineProperty(Node.prototype, symbols.macro, {
            get: function () { return this; }
        });
        RHU.definePublicAccessor(Node.prototype, "macro", {
            get: function () { return this[symbols.macro]; }
        });
        const isElement = Object.prototype.isPrototypeOf.bind(Element.prototype);
        const Element_setAttribute = Function.call.bind(Element.prototype.setAttribute);
        const Element_getAttribute = Function.call.bind(Element.prototype.getAttribute);
        const Element_hasAttribute = Function.call.bind(Element.prototype.hasAttribute);
        const Element_removeAttribute = Function.call.bind(Element.prototype.removeAttribute);
        const Element_append = Function.call.bind(Element.prototype.append);
        const Descriptor_childNodes = Object.getOwnPropertyDescriptor(Node.prototype, "childNodes");
        if (!RHU.exists(Descriptor_childNodes))
            throw new ReferenceError("Node.prototype.childNodes is null or undefined.");
        const Node_childNodes = Function.call.bind(Descriptor_childNodes.get);
        const Descriptor_parentNode = Object.getOwnPropertyDescriptor(Node.prototype, "parentNode");
        if (!RHU.exists(Descriptor_parentNode))
            throw new ReferenceError("Node.prototype.parentNode is null or undefined.");
        const Node_parentNode = Function.call.bind(Descriptor_parentNode.get);
        Document.prototype.createMacro = function (type) {
            const t = type.toString();
            let definition = templates.get(t);
            if (!RHU.exists(definition))
                definition = defaultTemplate;
            const options = definition.options;
            const doc = Macro.parseDomString(options.element);
            const el = doc.children[0];
            if (!RHU.exists(el))
                throw SyntaxError(`No valid container element to convert into macro was found for '${t}'.`);
            el.remove();
            Element_setAttribute(el, "rhu-macro", t);
            Macro.parse(el, t);
            return el[symbols.macro];
        };
        Document.prototype.Macro = function (type, attributes) {
            const t = type.toString();
            let definition = templates.get(t);
            if (!RHU.exists(definition))
                definition = defaultTemplate;
            const options = definition.options;
            const doc = Macro.parseDomString(options.element);
            const el = doc.children[0];
            if (!RHU.exists(el))
                throw SyntaxError(`No valid container element to convert into macro was found for '${t}'.`);
            Element_setAttribute(el, "rhu-macro", t);
            for (const key in attributes)
                el.setAttribute(key, attributes[key]);
            el.remove();
            return el.outerHTML;
        };
        Element.prototype.setAttribute = function (qualifiedName, value) {
            if (qualifiedName === "rhu-macro")
                Macro.parse(this, value);
            return Element_setAttribute(this, qualifiedName, value);
        };
        Element.prototype.removeAttribute = function (qualifiedName) {
            if (qualifiedName === "rhu-macro")
                Macro.parse(this);
            return Element_removeAttribute(this, qualifiedName);
        };
        RHU.definePublicAccessor(Element.prototype, "rhuMacro", {
            get: function () { return Element_getAttribute(this, "rhu-macro"); },
            set: function (value) {
                Element_setAttribute(this, "rhu-macro", value);
                Macro.parse(this, value);
            }
        });
        const Template = function (type) {
            const template = function (first, ...interpolations) {
                let generatedCode = `<rhu-macro rhu-type="${type}" ${first[0]}`;
                for (let i = 0; i < interpolations.length; ++i) {
                    const interpolation = interpolations[i];
                    generatedCode += interpolation;
                    generatedCode += first[i + 1];
                }
                generatedCode += `></rhu-macro>`;
                return generatedCode;
            };
            template.type = type;
            template.toString = () => type,
                template[Symbol.toPrimitive] = () => `<rhu-macro rhu-type="${type}"></rhu-macro>`;
            return template;
        };
        const Macro = function (constructor, type, source = "", options) {
            if (type == "")
                throw new SyntaxError("'type' cannot be blank.");
            if (typeof type !== "string")
                throw new TypeError("'type' must be a string.");
            if (typeof source !== "string")
                throw new TypeError("'source' must be a string.");
            if (!RHU.isConstructor(constructor))
                throw new TypeError("'object' must be a constructor.");
            if (templates.has(type))
                console.warn(`Macro template '${type}' already exists. Definition will be overwritten.`);
            const opt = {
                element: "<div></div>",
                floating: false,
                strict: false,
                encapsulate: undefined,
                content: undefined
            };
            RHU.parseOptions(opt, options);
            const doc = Macro.parseDomString(opt.element);
            const macro = doc.children[0];
            if (!RHU.exists(macro))
                throw new SyntaxError(`No valid container element to convert into macro was found for '${type}'.`);
            if (macro.tagName === "RHU-MACRO")
                throw new Error(`Container element cannot be the tag RHU-MACRO.`);
            templates.set(type, {
                constructor: constructor,
                type: type,
                source: source,
                options: opt,
                protoCache: new WeakRefMap()
            });
            const update = watching.get(type);
            if (RHU.exists(update))
                for (const el of update)
                    Macro.parse(el, type, true);
            return Template(type);
        };
        const templates = new Map();
        const defaultTemplate = {
            constructor: function () { },
            type: undefined,
            source: undefined,
            options: {
                element: "<div></div>",
                floating: false,
                strict: false,
                encapsulate: undefined,
                content: undefined
            },
            protoCache: new WeakRefMap()
        };
        const xPathEvaluator = new XPathEvaluator();
        Macro.parseDomString = function (str) {
            const template = document.createElement("template");
            template.innerHTML = str;
            return template.content;
        };
        const _anon = function (source, parseStack, donor, root = false) {
            let doc;
            if (RHU.exists(donor)) {
                donor.innerHTML = source;
                doc = new DocumentFragment();
                doc.append(donor);
            }
            else {
                doc = Macro.parseDomString(source);
            }
            const properties = {};
            const checkProperty = (identifier) => {
                if (Object.hasOwnProperty.call(properties, identifier))
                    throw new SyntaxError(`Identifier '${identifier.toString()}' already exists.`);
                return true;
            };
            const nested = [...doc.querySelectorAll("rhu-macro")];
            for (const el of nested) {
                if (el === donor)
                    continue;
                const typename = "rhu-type";
                const type = Element_getAttribute(el, typename);
                Element.prototype.removeAttribute.call(el, typename);
                const definition = templates.get(type);
                if (!RHU.exists(definition))
                    throw new TypeError(`Could not expand <rhu-macro> of type '${type}'. Macro definition does not exist.`);
                const options = definition.options;
                if (options.floating) {
                    if (Element_hasAttribute(el, "rhu-id")) {
                        const identifier = Element_getAttribute(el, "rhu-id");
                        Element.prototype.removeAttribute.call(el, "rhu-id");
                        checkProperty(identifier);
                        RHU.definePublicAccessor(properties, identifier, {
                            get: function () { return el[symbols.macro]; }
                        });
                    }
                    try {
                        _parse(el, type, parseStack);
                    }
                    catch (e) {
                        errorHandle("parser", type, e, root);
                    }
                }
                else {
                    const doc = Macro.parseDomString(options.element);
                    const macro = doc.children[0];
                    if (!RHU.exists(macro))
                        throw new SyntaxError(`No valid container element to convert into macro was found for '${type}'.`);
                    else {
                        for (let i = 0; i < el.attributes.length; ++i)
                            macro.setAttribute(el.attributes[i].name, el.attributes[i].value);
                        el.replaceWith(macro);
                        Element_setAttribute(macro, "rhu-macro", type);
                    }
                }
            }
            const referencedElements = doc.querySelectorAll("*[rhu-id]");
            for (const el of referencedElements) {
                if (el === donor)
                    continue;
                const identifier = Element_getAttribute(el, "rhu-id");
                Element.prototype.removeAttribute.call(el, "rhu-id");
                checkProperty(identifier);
                RHU.definePublicAccessor(properties, identifier, {
                    get: function () { return el[symbols.macro]; }
                });
            }
            for (const el of doc.querySelectorAll("*[rhu-macro]")) {
                if (el === donor)
                    continue;
                const type = Element_getAttribute(el, "rhu-macro");
                try {
                    _parse(el, type, parseStack);
                }
                catch (e) {
                    errorHandle("parser", type, e, root);
                }
            }
            const tempContainer = document.createElement("div");
            Element_append(tempContainer, ...doc.childNodes);
            const xPath = "//comment()";
            const query = xPathEvaluator.evaluate(xPath, tempContainer, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0, length = query.snapshotLength; i < length; ++i) {
                const self = query.snapshotItem(i);
                if (RHU.exists(self.parentNode))
                    self.parentNode.removeChild(self);
            }
            doc.append(...tempContainer.childNodes);
            return [properties, doc];
        };
        Macro.anon = function (source) {
            return _anon(source, [], undefined, true);
        };
        const clonePrototypeChain = function (prototype, last) {
            const next = Object.getPrototypeOf(prototype);
            if (next === Object.prototype)
                return RHU.clone(prototype, last);
            return RHU.clone(prototype, clonePrototypeChain(next, last));
        };
        const errorHandle = function (type, macro, e, root) {
            switch (type) {
                case "parser": {
                    if (typeof e === "string") {
                        throw e;
                    }
                }
                default: {
                    const message = typeof e === "string" ? e : `\n\n${e.stack}`;
                    throw `\n[__${type}__] ${root ? "Macro.Parse(" : "_parse("}${macro})${message}`;
                }
            }
        };
        const watching = new Map();
        const _parse = function (element, type, parseStack, root = false, force = false) {
            if (!RHU.exists(type))
                type = "";
            if (element.tagName === "RHU-MACRO") {
                const definition = templates.get(type);
                if (!RHU.exists(definition))
                    return;
                const options = definition.options;
                const doc = Macro.parseDomString(options.element);
                const macro = doc.children[0];
                if (!RHU.exists(macro))
                    throw new SyntaxError(`No valid container element to convert into macro was found for '${type}'.`);
                Element_setAttribute(macro, "rhu-macro", type);
                for (let i = 0; i < element.attributes.length; ++i)
                    macro.setAttribute(element.attributes[i].name, element.attributes[i].value);
                element.replaceWith(macro);
                watching.get(type).delete(element);
                element = macro;
            }
            if (!Object.hasOwnProperty.call(element, symbols.constructed) && RHU.properties(element, { hasOwn: true }).size !== 0)
                throw new TypeError(`Element is not eligible to be used as a rhu-macro.`);
            if (!RHU.exists(element))
                return;
            if (force === false && element[symbols.constructed] === type)
                return;
            if (parseStack.includes(type))
                throw new Error("Recursive definition of macros are not allowed.");
            parseStack.push(type);
            let slot;
            const oldType = element[symbols.constructed];
            let proto = element[symbols.prototype];
            RHU.deleteProperties(element);
            Element.prototype.replaceChildren.call(element);
            let definition = templates.get(type);
            if (!RHU.exists(definition))
                definition = defaultTemplate;
            const constructor = definition.constructor;
            const options = definition.options;
            let proxy = Object.create(constructor.prototype);
            let target = element;
            if (options.floating)
                target = Object.create(proxy);
            else {
                if (!RHU.exists(proto))
                    proto = element[symbols.prototype] = Object.getPrototypeOf(element);
                else
                    element[symbols.prototype] = proto;
                const protoCache = definition.protoCache;
                const cachedProto = protoCache.get(proto);
                if (RHU.exists(cachedProto)) {
                    proxy = Object.create(cachedProto);
                }
                else {
                    const clonedProto = clonePrototypeChain(constructor.prototype, proto);
                    protoCache.set(proto, clonedProto);
                    proxy = Object.create(clonedProto);
                }
                Object.setPrototypeOf(target, proxy);
            }
            let donor = undefined;
            if (!options.floating) {
                slot = document.createElement("div");
                element.replaceWith(slot);
                donor = element;
            }
            const [properties, fragment] = _anon(RHU.exists(definition.source) ? definition.source : "", parseStack, donor);
            const checkProperty = (identifier) => {
                if (Object.hasOwnProperty.call(properties, identifier))
                    throw new SyntaxError(`Identifier '${identifier.toString()}' already exists.`);
                if (!options.encapsulate && options.strict && identifier in target)
                    throw new SyntaxError(`Identifier '${identifier.toString()}' already exists.`);
                return true;
            };
            if (options.floating) {
                Element_append(element, fragment);
            }
            else {
                slot.replaceWith(fragment);
            }
            if (RHU.exists(options.content)) {
                if (typeof options.content !== "string")
                    throw new TypeError("Option 'content' must be a string.");
                checkProperty(options.content);
                properties[options.content] = [...Node_childNodes(element)];
            }
            if (options.floating) {
                if (RHU.exists(Node_parentNode(element)))
                    Element.prototype.replaceWith.call(element, ...Node_childNodes(element));
                else
                    Element.prototype.replaceWith.call(element);
                RHU.defineProperties(element, {
                    [symbols.macro]: {
                        configurable: true,
                        get: function () { return target; }
                    }
                });
            }
            if (RHU.exists(options.encapsulate)) {
                checkProperty(options.encapsulate);
                RHU.definePublicAccessor(proxy, options.encapsulate, {
                    get: function () { return properties; }
                });
            }
            else
                RHU.assign(proxy, properties);
            try {
                constructor.call(target);
            }
            catch (e) {
                errorHandle("constructor", type, e, root);
            }
            if (RHU.exists(oldType)) {
                let old = templates.get(oldType);
                if (!RHU.exists(old))
                    old = defaultTemplate;
                if (!old.options.floating && watching.has(oldType))
                    watching.get(oldType).delete(element);
            }
            if (!options.floating) {
                if (RHU.exists(type)) {
                    if (!watching.has(type))
                        watching.set(type, new WeakCollection());
                    const typeCollection = watching.get(type);
                    typeCollection.add(element);
                }
            }
            target[symbols.constructed] = type;
            element[symbols.constructed] = type;
            parseStack.pop();
        };
        Macro.parse = function (element, type, force = false) {
            _parse(element, type, [], true, force);
        };
        const load = function () {
            const expand = [...document.getElementsByTagName("rhu-macro")];
            for (const el of expand) {
                const typename = "rhu-type";
                const type = Element_getAttribute(el, typename);
                Element.prototype.removeAttribute.call(el, typename);
                const definition = templates.get(type);
                if (!RHU.exists(definition)) {
                    if (RHU.exists(type)) {
                        if (!watching.has(type))
                            watching.set(type, new WeakCollection());
                        const typeCollection = watching.get(type);
                        typeCollection.add(el);
                    }
                    continue;
                }
                const options = definition.options;
                const doc = Macro.parseDomString(options.element);
                const macro = doc.children[0];
                if (!RHU.exists(macro))
                    console.error(`No valid container element to convert into macro was found for '${type}'.`);
                else {
                    for (let i = 0; i < el.attributes.length; ++i)
                        macro.setAttribute(el.attributes[i].name, el.attributes[i].value);
                    el.replaceWith(macro);
                    Element_setAttribute(macro, "rhu-macro", type);
                }
            }
            const macros = document.querySelectorAll("[rhu-macro]");
            for (const el of macros) {
                Macro.parse(el, Element_getAttribute(el, "rhu-macro"));
                recursiveDispatch(el);
            }
            Macro.observe(document);
        };
        const recursiveDispatch = function (node) {
            if (isElement(node) && Element_hasAttribute(node, "rhu-macro"))
                node.dispatchEvent(RHU.CustomEvent("mount", {}));
            for (const child of node.childNodes)
                recursiveDispatch(child);
        };
        const recursiveParse = function (node) {
            if (isElement(node) && Element_hasAttribute(node, "rhu-macro")) {
                Macro.parse(node, Element_getAttribute(node, "rhu-macro"));
                recursiveDispatch(node);
                return;
            }
            for (const child of node.childNodes)
                recursiveParse(child);
        };
        const observer = new MutationObserver(function (mutationList) {
            const attributes = new Map();
            for (const mutation of mutationList) {
                switch (mutation.type) {
                    case "attributes":
                        {
                            if (mutation.attributeName === "rhu-macro") {
                                if (!attributes.has(mutation.target))
                                    attributes.set(mutation.target, mutation.oldValue);
                                else if (attributes.get(mutation.target) !== mutation.oldValue) {
                                    attributes.set(mutation.target, mutation.oldValue);
                                    if (isElement(mutation.target))
                                        Macro.parse(mutation.target, mutation.oldValue);
                                }
                            }
                        }
                        break;
                    case "childList":
                        {
                            for (const node of mutation.addedNodes)
                                recursiveParse(node);
                        }
                        break;
                }
            }
            for (const el of attributes.keys()) {
                const attr = Element_getAttribute(el, "rhu-macro");
                if (attributes.get(el) !== attr)
                    Macro.parse(el, attr);
            }
        });
        Macro.observe = function (target) {
            observer.observe(target, {
                attributes: true,
                attributeOldValue: true,
                attributeFilter: ["rhu-macro"],
                childList: true,
                subtree: true
            });
        };
        const onDocumentLoad = function () {
            window.dispatchEvent(new Event("load-rhu-macro"));
            load();
        };
        if (document.readyState === "loading")
            document.addEventListener("DOMContentLoaded", onDocumentLoad);
        else
            onDocumentLoad();
        return Macro;
    });
})();
