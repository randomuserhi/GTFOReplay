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
        let isElement;
        let Element_setAttribute;
        let Element_getAttribute;
        let Element_hasAttribute;
        let Element_removeAttribute;
        let Node_childNodes;
        let Node_parentNode;
        isElement = Object.prototype.isPrototypeOf.bind(Element.prototype);
        Element_setAttribute = Function.call.bind(Element.prototype.setAttribute);
        Element_getAttribute = Function.call.bind(Element.prototype.getAttribute);
        Element_hasAttribute = Function.call.bind(Element.prototype.hasAttribute);
        Element_removeAttribute = Function.call.bind(Element.prototype.removeAttribute);
        let Descriptor_childNodes = Object.getOwnPropertyDescriptor(Node.prototype, "childNodes");
        if (!RHU.exists(Descriptor_childNodes))
            throw new ReferenceError("Node.prototype.childNodes is null or undefined.");
        Node_childNodes = Function.call.bind(Descriptor_childNodes.get);
        let Descriptor_parentNode = Object.getOwnPropertyDescriptor(Node.prototype, "parentNode");
        if (!RHU.exists(Descriptor_parentNode))
            throw new ReferenceError("Node.prototype.parentNode is null or undefined.");
        Node_parentNode = Function.call.bind(Descriptor_parentNode.get);
        Document.prototype.createMacro = function (type) {
            let T = type.toString();
            let definition = templates.get(T);
            if (!RHU.exists(definition))
                definition = defaultTemplate;
            let options = definition.options;
            let doc = Macro.parseDomString(options.element);
            let el = doc.children[0];
            if (!RHU.exists(el))
                throw SyntaxError(`No valid container element to convert into macro was found for '${T}'.`);
            el.remove();
            Element_setAttribute(el, "rhu-macro", T);
            Macro.parse(el, T);
            return el[symbols.macro];
        };
        Document.prototype.Macro = function (type, attributes) {
            let T = type.toString();
            let definition = templates.get(T);
            if (!RHU.exists(definition))
                definition = defaultTemplate;
            let options = definition.options;
            let doc = Macro.parseDomString(options.element);
            let el = doc.children[0];
            if (!RHU.exists(el))
                throw SyntaxError(`No valid container element to convert into macro was found for '${T}'.`);
            Element_setAttribute(el, "rhu-macro", T);
            for (let key in attributes)
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
            let template = function (first, ...interpolations) {
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
            let opt = {
                element: "<div></div>",
                floating: false,
                strict: false,
                encapsulate: undefined,
                content: undefined
            };
            RHU.parseOptions(opt, options);
            let doc = Macro.parseDomString(opt.element);
            let macro = doc.children[0];
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
            let update = watching.get(type);
            if (RHU.exists(update))
                for (let el of update)
                    Macro.parse(el, type, true);
            return Template(type);
        };
        let templates = new Map();
        let defaultTemplate = {
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
        let xPathEvaluator = new XPathEvaluator();
        Macro.parseDomString = function (str) {
            let template = document.createElement("template");
            template.innerHTML = str;
            return template.content;
        };
        let clonePrototypeChain = function (prototype, last) {
            let next = Object.getPrototypeOf(prototype);
            if (next === Object.prototype)
                return RHU.clone(prototype, last);
            return RHU.clone(prototype, clonePrototypeChain(next, last));
        };
        let parseStack = [];
        let watching = new Map();
        Macro.parse = function (element, type, force = false) {
            if (!RHU.exists(type))
                type = "";
            if (element.tagName === "RHU-MACRO") {
                let definition = templates.get(type);
                if (!RHU.exists(definition))
                    return;
                let options = definition.options;
                let doc = Macro.parseDomString(options.element);
                let macro = doc.children[0];
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
            let oldType = element[symbols.constructed];
            let proto = element[symbols.prototype];
            RHU.deleteProperties(element);
            Element.prototype.replaceChildren.call(element);
            let definition = templates.get(type);
            if (!RHU.exists(definition))
                definition = defaultTemplate;
            let constructor = definition.constructor;
            let options = definition.options;
            let proxy = Object.create(constructor.prototype);
            let target = element;
            if (options.floating)
                target = Object.create(proxy);
            else {
                if (!RHU.exists(proto))
                    proto = element[symbols.prototype] = Object.getPrototypeOf(element);
                else
                    element[symbols.prototype] = proto;
                let protoCache = definition.protoCache;
                let cachedProto = protoCache.get(proto);
                if (RHU.exists(cachedProto)) {
                    proxy = Object.create(cachedProto);
                }
                else {
                    let clonedProto = clonePrototypeChain(constructor.prototype, proto);
                    protoCache.set(proto, clonedProto);
                    proxy = Object.create(clonedProto);
                }
                Object.setPrototypeOf(target, proxy);
            }
            let doc;
            let source = RHU.exists(definition.source) ? definition.source : "";
            if (!options.floating) {
                slot = document.createElement("div");
                element.replaceWith(slot);
                element.innerHTML = source;
                doc = new DocumentFragment();
                doc.append(element);
            }
            else {
                doc = Macro.parseDomString(source);
            }
            let properties = {};
            let checkProperty = (identifier) => {
                if (Object.hasOwnProperty.call(properties, identifier))
                    throw new SyntaxError(`Identifier '${identifier.toString()}' already exists.`);
                if (!options.encapsulate && options.strict && identifier in target)
                    throw new SyntaxError(`Identifier '${identifier.toString()}' already exists.`);
                return true;
            };
            let nested = [...doc.querySelectorAll("rhu-macro")];
            for (let el of nested) {
                if (el === element)
                    continue;
                const typename = "rhu-type";
                let type = Element_getAttribute(el, typename);
                Element.prototype.removeAttribute.call(el, typename);
                let definition = templates.get(type);
                if (!RHU.exists(definition))
                    throw new TypeError(`Could not expand <rhu-macro> of type '${type}'. Macro definition does not exist.`);
                let options = definition.options;
                if (options.floating) {
                    if (Element_hasAttribute(el, "rhu-id")) {
                        let identifier = Element_getAttribute(el, "rhu-id");
                        Element.prototype.removeAttribute.call(el, "rhu-id");
                        checkProperty(identifier);
                        RHU.definePublicAccessor(properties, identifier, {
                            get: function () { return el[symbols.macro]; }
                        });
                    }
                    Macro.parse(el, type);
                }
                else {
                    let doc = Macro.parseDomString(options.element);
                    let macro = doc.children[0];
                    if (!RHU.exists(macro))
                        console.error(`No valid container element to convert into macro was found for '${type}'.`);
                    else {
                        for (let i = 0; i < el.attributes.length; ++i)
                            macro.setAttribute(el.attributes[i].name, el.attributes[i].value);
                        el.replaceWith(macro);
                        Element_setAttribute(macro, "rhu-macro", type);
                    }
                }
            }
            let referencedElements = doc.querySelectorAll("*[rhu-id]");
            for (let el of referencedElements) {
                if (el === element)
                    continue;
                let identifier = Element_getAttribute(el, "rhu-id");
                Element.prototype.removeAttribute.call(el, "rhu-id");
                checkProperty(identifier);
                RHU.definePublicAccessor(properties, identifier, {
                    get: function () { return el[symbols.macro]; }
                });
            }
            for (let el of doc.querySelectorAll("*[rhu-macro]")) {
                if (el === element)
                    continue;
                Macro.parse(el, Element_getAttribute(el, "rhu-macro"));
            }
            if (options.floating)
                Element.prototype.append.call(element, ...doc.childNodes);
            else
                slot.replaceWith(element);
            const xPath = "//comment()";
            let query = xPathEvaluator.evaluate(xPath, element, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0, length = query.snapshotLength; i < length; ++i) {
                let self = query.snapshotItem(i);
                if (RHU.exists(self.parentNode))
                    self.parentNode.removeChild(self);
            }
            if (RHU.exists(options.content)) {
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
            constructor.call(target);
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
                    let typeCollection = watching.get(type);
                    typeCollection.add(element);
                }
            }
            target[symbols.constructed] = type;
            element[symbols.constructed] = type;
            parseStack.pop();
        };
        let load = function () {
            let expand = [...document.getElementsByTagName("rhu-macro")];
            for (let el of expand) {
                const typename = "rhu-type";
                let type = Element_getAttribute(el, typename);
                Element.prototype.removeAttribute.call(el, typename);
                let definition = templates.get(type);
                if (!RHU.exists(definition)) {
                    if (RHU.exists(type)) {
                        if (!watching.has(type))
                            watching.set(type, new WeakCollection());
                        let typeCollection = watching.get(type);
                        typeCollection.add(el);
                    }
                    continue;
                }
                let options = definition.options;
                let doc = Macro.parseDomString(options.element);
                let macro = doc.children[0];
                if (!RHU.exists(macro))
                    console.error(`No valid container element to convert into macro was found for '${type}'.`);
                else {
                    for (let i = 0; i < el.attributes.length; ++i)
                        macro.setAttribute(el.attributes[i].name, el.attributes[i].value);
                    el.replaceWith(macro);
                    Element_setAttribute(macro, "rhu-macro", type);
                }
            }
            let macros = document.querySelectorAll("[rhu-macro]");
            for (let el of macros) {
                Macro.parse(el, Element_getAttribute(el, "rhu-macro"));
                recursiveDispatch(el);
            }
            Macro.observe(document);
        };
        let recursiveDispatch = function (node) {
            if (isElement(node) && Element_hasAttribute(node, "rhu-macro"))
                node.dispatchEvent(RHU.CustomEvent("mount", {}));
            for (let child of node.childNodes)
                recursiveDispatch(child);
        };
        let recursiveParse = function (node) {
            if (isElement(node) && Element_hasAttribute(node, "rhu-macro")) {
                Macro.parse(node, Element_getAttribute(node, "rhu-macro"));
                recursiveDispatch(node);
                return;
            }
            for (let child of node.childNodes)
                recursiveParse(child);
        };
        let observer = new MutationObserver(function (mutationList) {
            let attributes = new Map();
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
                            for (let node of mutation.addedNodes)
                                recursiveParse(node);
                        }
                        break;
                }
            }
            for (let el of attributes.keys()) {
                let attr = Element_getAttribute(el, "rhu-macro");
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
        let onDocumentLoad = function () {
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
