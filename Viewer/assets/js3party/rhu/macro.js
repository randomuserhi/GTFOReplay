import { signal } from "./signal.js";
class NODE {
}
NODE.is = Object.prototype.isPrototypeOf.bind(NODE.prototype);
class CLOSURE extends NODE {
}
CLOSURE.instance = new CLOSURE();
CLOSURE.is = Object.prototype.isPrototypeOf.bind(CLOSURE.prototype);
const symbols = {
    factory: Symbol("factory"),
};
class ELEMENT extends NODE {
    bind(key) {
        this._bind = key;
        return this;
    }
}
ELEMENT.is = Object.prototype.isPrototypeOf.bind(ELEMENT.prototype);
class SIGNAL extends ELEMENT {
    constructor(binding) {
        super();
        this.bind(binding);
    }
    value(value) {
        this._value = value;
        return this;
    }
}
SIGNAL.is = Object.prototype.isPrototypeOf.bind(SIGNAL.prototype);
class MacroElement {
    constructor(dom, bindings, target) {
        this.dom = dom;
        if (bindings !== undefined && bindings !== null) {
            if (target !== undefined && target !== null) {
                Object.assign(target, bindings);
            }
            else {
                Object.assign(this, bindings);
            }
        }
    }
}
MacroElement.is = Object.prototype.isPrototypeOf.bind(MacroElement.prototype);
export { MacroElement };
class MACRO extends ELEMENT {
    constructor(html, type, args) {
        super();
        this.callbacks = new Set();
        this.html = html;
        this.type = type;
        this.args = args;
    }
    then(callback) {
        this.callbacks.add(callback);
        return this;
    }
}
MACRO.is = Object.prototype.isPrototypeOf.bind(MACRO.prototype);
class MACRO_OPEN extends MACRO {
}
MACRO_OPEN.is = Object.prototype.isPrototypeOf.bind(MACRO_OPEN.prototype);
export function html(first, ...interpolations) {
    return new HTML(first, interpolations);
}
class HTML {
    constructor(first, interpolations) {
        this.callbacks = new Set();
        this.first = first;
        this.interpolations = interpolations;
    }
    bind(key) {
        this._bind = key;
        return this;
    }
    then(callback) {
        this.callbacks.add(callback);
        return this;
    }
    dom() {
        let source = this.first[0];
        const html = [];
        const macros = [];
        const signals = [];
        for (let i = 1; i < this.first.length; ++i) {
            const interp = this.interpolations[i - 1];
            if (isFactory(interp)) {
                throw new SyntaxError("Macro Factory cannot be used to construct a HTML fragment. Did you mean to call the factory?");
            }
            if (HTML.is(interp)) {
                source += `<rhu-html rhu-internal="${html.length}"></rhu-macro>`;
                html.push(interp);
            }
            if (NODE.is(interp)) {
                if (CLOSURE.is(interp)) {
                    source += `</rhu-macro>`;
                }
                else if (MACRO_OPEN.is(interp)) {
                    source += `<rhu-macro rhu-internal="${macros.length}">`;
                    macros.push(interp);
                }
                else if (MACRO.is(interp)) {
                    source += `<rhu-macro rhu-internal="${macros.length}"></rhu-macro>`;
                    macros.push(interp);
                }
                else if (SIGNAL.is(interp)) {
                    source += `<rhu-signal rhu-internal="${signals.length}"></rhu-signal>`;
                    signals.push(interp);
                }
            }
            else {
                source += interp;
            }
            source += this.first[i];
        }
        const template = document.createElement("template");
        template.innerHTML = source;
        const fragment = template.content;
        const bindings = {};
        for (const el of fragment.querySelectorAll("*[m-id]")) {
            const key = el.getAttribute("m-id");
            el.removeAttribute("m-id");
            if (key in bindings)
                throw new SyntaxError(`The binding '${key}' already exists.`);
            bindings[key] = el;
        }
        document.createNodeIterator(fragment, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const value = node.nodeValue;
                if (value === null || value === undefined)
                    node.parentNode?.removeChild(node);
                else if (value.trim() === "")
                    node.parentNode?.removeChild(node);
                return NodeFilter.FILTER_REJECT;
            }
        }).nextNode();
        for (let i = 0; i < signals.length; ++i) {
            const slot = fragment.querySelector(`rhu-signal[rhu-internal="${i}"]`);
            if (slot === undefined || slot === null)
                throw new Error("Unable to find slot for signal.");
            const sig = signals[i];
            let instance = undefined;
            const sig_value = sig._value;
            const sig_bind = sig._bind;
            if (sig_bind !== undefined && sig_bind !== null) {
                if (!(sig_bind in bindings)) {
                    bindings[sig_bind] = signal(sig_value !== undefined && sig_value !== null ? sig_value : "");
                }
                instance = bindings[sig_bind];
            }
            const node = document.createTextNode(sig_value === undefined ? "" : sig_value);
            instance?.on((value) => node.nodeValue = value);
            slot.replaceWith(node);
        }
        for (let i = 0; i < html.length; ++i) {
            const slot = fragment.querySelector(`rhu-html[rhu-internal="${i}"]`);
            if (slot === undefined || slot === null)
                throw new Error("Unable to find slot for HTML.");
            const HTML = html[i];
            const [instance, frag] = HTML.dom();
            for (const callback of HTML.callbacks) {
                callback(instance);
            }
            const html_bind = HTML._bind;
            if (html_bind !== undefined && html_bind !== null) {
                if (html_bind in bindings)
                    throw new SyntaxError(`The binding '${html_bind.toString()}' already exists.`);
                bindings[html_bind] = instance;
            }
            slot.replaceWith(frag);
        }
        const slots = new Array(macros.length);
        for (let i = 0; i < macros.length; ++i) {
            const slot = fragment.querySelector(`rhu-macro[rhu-internal="${i}"]`);
            if (slot === undefined || slot === null)
                throw new Error("Unable to find slot for macro.");
            slots[i] = slot;
        }
        for (let i = 0; i < macros.length; ++i) {
            const slot = slots[i];
            const children = [...slot.childNodes];
            slot.replaceChildren();
            const macro = macros[i];
            const [b, frag] = macro.html.dom();
            const dom = [...frag.childNodes];
            frag.replaceChildren();
            const instance = new macro.type(dom, b, children, ...macro.args);
            for (const callback of macro.callbacks) {
                callback(instance);
            }
            const macro_bind = macro._bind;
            if (macro_bind !== undefined && macro_bind !== null) {
                if (macro_bind in bindings)
                    throw new SyntaxError(`The binding '${macro_bind.toString()}' already exists.`);
                bindings[macro_bind] = instance;
            }
            slot.replaceWith(...dom);
        }
        return [bindings, fragment];
    }
}
HTML.empty = html ``;
HTML.is = Object.prototype.isPrototypeOf.bind(HTML.prototype);
export { HTML };
function isFactory(object) {
    if (object === null || object === undefined)
        return false;
    return object[symbols.factory] === true;
}
export const Macro = ((type, html) => {
    const factory = function (...args) {
        return new MACRO(html, type, args);
    };
    factory.open = function (...args) {
        return new MACRO_OPEN(html, type, args);
    };
    factory.close = CLOSURE.instance;
    factory[symbols.factory] = true;
    return factory;
});
Macro.signal = (binding, value) => new SIGNAL(binding).value(value);
Macro.create = (macro) => {
    const [b, frag] = macro.html.dom();
    const dom = [...frag.childNodes];
    frag.replaceChildren();
    const instance = new macro.type(dom, b, [], ...macro.args);
    for (const callback of macro.callbacks) {
        callback(instance);
    }
    return instance;
};
const isElement = Object.prototype.isPrototypeOf.bind(Element.prototype);
const recursiveDispatch = function (node) {
    if (isElement(node))
        node.dispatchEvent(new CustomEvent("mount"));
    for (const child of node.childNodes)
        recursiveDispatch(child);
};
const observer = new MutationObserver(function (mutationList) {
    for (const mutation of mutationList) {
        switch (mutation.type) {
            case "childList":
                {
                    for (const node of mutation.addedNodes)
                        recursiveDispatch(node);
                }
                break;
        }
    }
});
Macro.observe = function (target) {
    observer.observe(target, {
        childList: true,
        subtree: true
    });
};
const onDocumentLoad = function () {
    Macro.observe(document);
};
if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", onDocumentLoad);
else
    onDocumentLoad();
