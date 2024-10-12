import { isSignal, signal } from "./signal.js";
class RHU_NODE {
}
RHU_NODE.is = Object.prototype.isPrototypeOf.bind(RHU_NODE.prototype);
export { RHU_NODE };
class RHU_CLOSURE extends RHU_NODE {
}
RHU_CLOSURE.instance = new RHU_CLOSURE();
RHU_CLOSURE.is = Object.prototype.isPrototypeOf.bind(RHU_CLOSURE.prototype);
export { RHU_CLOSURE };
class RHU_ELEMENT extends RHU_NODE {
    constructor() {
        super(...arguments);
        this.callbacks = new Set();
    }
    bind(key) {
        this._bind = key;
        return this;
    }
    then(callback) {
        this.callbacks.add(callback);
        return this;
    }
    _dom(target, children) {
        throw new Error("Invalid operation.");
    }
    dom(target, children) {
        const result = this._dom(target, children);
        for (const callback of this.callbacks) {
            callback(result[0]);
        }
        return result;
    }
}
RHU_ELEMENT.is = Object.prototype.isPrototypeOf.bind(RHU_ELEMENT.prototype);
export { RHU_ELEMENT };
class RHU_SIGNAL extends RHU_ELEMENT {
    constructor(binding) {
        super();
        this.bind(binding);
    }
    value(value) {
        this._value = value;
        return this;
    }
    _dom(target) {
        let instance = undefined;
        const doBinding = target !== undefined && this._bind !== undefined && this._bind !== null;
        if (doBinding) {
            if (target[this._bind] !== undefined && !isSignal(target[this._bind]))
                throw new Error(`The binding '${this._bind.toString()}' already exists.`);
            instance = target[this._bind];
        }
        if (instance === undefined) {
            instance = signal(this._value !== undefined && this._value !== null ? this._value : "");
        }
        if (doBinding)
            target[this._bind] = instance;
        const node = document.createTextNode(this._value === undefined ? "" : this._value);
        instance.on((value) => node.nodeValue = value);
        return [instance, node];
    }
}
RHU_SIGNAL.is = Object.prototype.isPrototypeOf.bind(RHU_SIGNAL.prototype);
export { RHU_SIGNAL };
class MacroElement {
    constructor(dom, bindings) {
        this.dom = dom;
        if (bindings !== undefined && bindings !== null) {
            Object.assign(this, bindings);
        }
    }
}
MacroElement.is = Object.prototype.isPrototypeOf.bind(MacroElement.prototype);
export { MacroElement };
class RHU_MACRO extends RHU_ELEMENT {
    constructor(html, type, args) {
        super();
        this.html = html;
        this.type = type;
        this.args = args;
    }
    _dom(target, children) {
        const [b, frag] = this.html.dom();
        const dom = [...frag.childNodes];
        const instance = new this.type(dom, b, children === undefined ? [] : children, ...this.args);
        if (target !== undefined && this._bind !== undefined && this._bind !== null) {
            if (this._bind in target)
                throw new SyntaxError(`The binding '${this._bind.toString()}' already exists.`);
            target[this._bind] = instance;
        }
        return [instance, frag];
    }
}
RHU_MACRO.is = Object.prototype.isPrototypeOf.bind(RHU_MACRO.prototype);
export { RHU_MACRO };
class RHU_MACRO_OPEN extends RHU_MACRO {
}
RHU_MACRO_OPEN.is = Object.prototype.isPrototypeOf.bind(RHU_MACRO_OPEN.prototype);
export { RHU_MACRO_OPEN };
export function html(first, ...interpolations) {
    return new RHU_HTML(first, interpolations);
}
class RHU_HTML extends RHU_ELEMENT {
    constructor(first, interpolations) {
        super();
        this.first = first;
        this.interpolations = interpolations;
    }
    stitch(interp, slots) {
        if (isFactory(interp)) {
            throw new SyntaxError("Macro Factory cannot be used to construct a HTML fragment. Did you mean to call the factory?");
        }
        if (RHU_ELEMENT.is(interp)) {
            let result = `<rhu-slot rhu-internal="${slots.length}">`;
            if (!RHU_MACRO_OPEN.is(interp))
                result += `</rhu-slot>`;
            slots.push(interp);
            return result;
        }
        if (RHU_CLOSURE.is(interp))
            return `</rhu-slot>`;
        return undefined;
    }
    _dom(target) {
        let source = this.first[0];
        const slots = [];
        for (let i = 1; i < this.first.length; ++i) {
            const interp = this.interpolations[i - 1];
            const result = this.stitch(interp, slots);
            if (result !== undefined) {
                source += result;
            }
            else if (Array.isArray(interp)) {
                const array = interp;
                for (const interp of array) {
                    const result = this.stitch(interp, slots);
                    if (result !== undefined) {
                        source += result;
                    }
                    else {
                        source += interp;
                    }
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
        if (target === undefined)
            target = {};
        for (const el of fragment.querySelectorAll("*[m-id]")) {
            const key = el.getAttribute("m-id");
            el.removeAttribute("m-id");
            if (key in target)
                throw new Error(`The binding '${key}' already exists.`);
            target[key] = el;
        }
        for (const slotElement of fragment.querySelectorAll("rhu-slot[rhu-internal]")) {
            try {
                const attr = slotElement.getAttribute("rhu-internal");
                if (attr === undefined || attr === null) {
                    throw new Error("Could not find internal attribute.");
                }
                const i = parseInt(attr);
                if (isNaN(i)) {
                    throw new Error("Could not find slot id.");
                }
                const slot = slots[i];
                const frag = slot.dom(target, slotElement.childNodes)[1];
                slotElement.replaceWith(frag);
            }
            catch (e) {
                slotElement.replaceWith();
                console.error(e);
                continue;
            }
        }
        return [target, fragment];
    }
}
RHU_HTML.empty = html ``;
RHU_HTML.is = Object.prototype.isPrototypeOf.bind(RHU_HTML.prototype);
export { RHU_HTML };
const isFactorySymbol = Symbol("factory");
function isFactory(object) {
    if (object === null || object === undefined)
        return false;
    return object[isFactorySymbol] === true;
}
export const Macro = ((type, html) => {
    const factory = function (...args) {
        return new RHU_MACRO(html, type, args);
    };
    factory.open = function (...args) {
        return new RHU_MACRO_OPEN(html, type, args);
    };
    factory.close = RHU_CLOSURE.instance;
    factory[isFactorySymbol] = true;
    return factory;
});
Macro.signal = (binding, value) => new RHU_SIGNAL(binding).value(value);
Macro.create = (macro) => {
    const [instance, frag] = macro.dom();
    return instance;
};
const empty = [];
export class RHU_MAP extends MacroElement {
    constructor(dom, bindings, children, wrapperFactory, itemFactory, append, update, remove) {
        super(dom, bindings);
        this.onappend = new Set();
        this.onupdate = new Set();
        this.onremove = new Set();
        this._items = new Map();
        this.items = new Map();
        if (RHU_HTML.is(wrapperFactory)) {
            this.wrapper = bindings;
        }
        else if (RHU_MACRO.is(wrapperFactory)) {
            this.wrapper = new wrapperFactory.type(dom, bindings, [], ...wrapperFactory.args);
            for (const callback of wrapperFactory.callbacks) {
                callback(this.wrapper);
            }
        }
        else {
            throw new SyntaxError("Unsupported wrapper factory type.");
        }
        this.itemFactory = itemFactory;
        if (append !== undefined)
            this.onappend.add(append);
        if (update !== undefined)
            this.onupdate.add(update);
        if (remove !== undefined)
            this.onremove.add(remove);
    }
    *entries() {
        for (const [key, item] of this.items.entries()) {
            yield [key, item.value, item.bindings];
        }
    }
    clear() {
        this.assign(empty);
    }
    get size() {
        return this.items.size;
    }
    has(key) {
        return this.items.has(key);
    }
    get(key) {
        return this.items.get(key)?.value;
    }
    getElement(key) {
        return this.items.get(key)?.bindings;
    }
    set(key, value) {
        let item = this.items.get(key);
        if (item === undefined) {
            const [bindings, frag] = this.itemFactory.dom();
            item = { bindings, value, dom: [...frag.childNodes] };
            for (const callback of this.onappend)
                callback(this.wrapper, item.dom, item.bindings);
        }
        for (const callback of this.onupdate)
            callback(item.bindings, key, value);
        this.items.set(key, item);
    }
    remove(key) {
        if (!this.items.has(key))
            return;
        const item = this.items.get(key);
        if (this.onremove.size === 0) {
            for (const node of item.dom) {
                node.parentNode?.removeChild(node);
            }
        }
        else {
            for (const callback of this.onremove)
                callback(this.wrapper, item.dom, item.bindings);
        }
    }
    assign(entries) {
        for (const [key, value] of entries) {
            let el = this.items.get(key);
            if (el === undefined) {
                const [bindings, frag] = this.itemFactory.dom();
                el = { bindings, value, dom: [...frag.childNodes] };
                for (const callback of this.onappend)
                    callback(this.wrapper, el.dom, el.bindings);
            }
            if (this.onupdate !== undefined) {
                for (const callback of this.onupdate)
                    callback(el.bindings, key, value);
            }
            this._items.set(key, el);
        }
        for (const [key, item] of this.items) {
            if (this._items.has(key))
                continue;
            if (this.onremove.size === 0) {
                for (const node of item.dom) {
                    node.parentNode?.removeChild(node);
                }
            }
            else {
                for (const callback of this.onremove)
                    callback(this.wrapper, item.dom, item.bindings);
            }
        }
        const temp = this.items;
        this.items = this._items;
        this._items = temp;
        this._items.clear();
    }
}
const MapFactory = function (wrapper, item, append, update, remove) {
    return new RHU_MACRO(RHU_HTML.is(wrapper) ? wrapper : wrapper.html, (RHU_MAP), [wrapper, item, append, update, remove]);
};
Macro.map = MapFactory;
export class RHU_SET extends MacroElement {
    constructor(dom, bindings, children, wrapperFactory, itemFactory, append, update, remove) {
        super(dom, bindings);
        this.onappend = new Set();
        this.onupdate = new Set();
        this.onremove = new Set();
        this._items = new Map();
        this.items = new Map();
        if (RHU_HTML.is(wrapperFactory)) {
            this.wrapper = bindings;
        }
        else if (RHU_MACRO.is(wrapperFactory)) {
            this.wrapper = new wrapperFactory.type(dom, bindings, [], ...wrapperFactory.args);
            for (const callback of wrapperFactory.callbacks) {
                callback(this.wrapper);
            }
        }
        else {
            throw new SyntaxError("Unsupported wrapper factory type.");
        }
        this.itemFactory = itemFactory;
        if (append !== undefined)
            this.onappend.add(append);
        if (update !== undefined)
            this.onupdate.add(update);
        if (remove !== undefined)
            this.onremove.add(remove);
    }
    *entries() {
        for (const [key, item] of this.items.entries()) {
            yield [key, item.bindings];
        }
    }
    clear() {
        this.assign(empty);
    }
    get size() {
        return this.items.size;
    }
    has(value) {
        return this.items.has(value);
    }
    getElement(value) {
        return this.items.get(value)?.bindings;
    }
    add(value) {
        let item = this.items.get(value);
        if (item === undefined) {
            const [bindings, frag] = this.itemFactory.dom();
            item = { bindings, dom: [...frag.childNodes] };
            for (const callback of this.onappend)
                callback(this.wrapper, item.dom, item.bindings);
        }
        for (const callback of this.onupdate)
            callback(item.bindings, value);
        this.items.set(value, item);
    }
    remove(value) {
        if (!this.items.has(value))
            return;
        const item = this.items.get(value);
        if (this.onremove.size === 0) {
            for (const node of item.dom) {
                node.parentNode?.removeChild(node);
            }
        }
        else {
            for (const callback of this.onremove)
                callback(this.wrapper, item.dom, item.bindings);
        }
    }
    assign(entries) {
        for (const value of entries) {
            let el = this.items.get(value);
            if (el === undefined) {
                const [bindings, frag] = this.itemFactory.dom();
                el = { bindings, dom: [...frag.childNodes] };
                for (const callback of this.onappend)
                    callback(this.wrapper, el.dom, el.bindings);
            }
            if (this.onupdate !== undefined) {
                for (const callback of this.onupdate)
                    callback(el.bindings, value);
            }
            this._items.set(value, el);
        }
        for (const [key, item] of this.items) {
            if (this._items.has(key))
                continue;
            if (this.onremove.size === 0) {
                for (const node of item.dom) {
                    node.parentNode?.removeChild(node);
                }
            }
            else {
                for (const callback of this.onremove)
                    callback(this.wrapper, item.dom, item.bindings);
            }
        }
        const temp = this.items;
        this.items = this._items;
        this._items = temp;
        this._items.clear();
    }
}
const SetFactory = function (wrapper, item, append, update, remove) {
    return new RHU_MACRO(RHU_HTML.is(wrapper) ? wrapper : wrapper.html, (RHU_SET), [wrapper, item, append, update, remove]);
};
Macro.set = SetFactory;
export class RHU_LIST extends MacroElement {
    constructor(dom, bindings, children, wrapperFactory, itemFactory, append, update, remove) {
        super(dom, bindings);
        this.onappend = new Set();
        this.onupdate = new Set();
        this.onremove = new Set();
        this._items = [];
        this.items = [];
        if (RHU_HTML.is(wrapperFactory)) {
            this.wrapper = bindings;
        }
        else if (RHU_MACRO.is(wrapperFactory)) {
            this.wrapper = new wrapperFactory.type(dom, bindings, [], ...wrapperFactory.args);
            for (const callback of wrapperFactory.callbacks) {
                callback(this.wrapper);
            }
        }
        else {
            throw new SyntaxError("Unsupported wrapper factory type.");
        }
        this.itemFactory = itemFactory;
        if (append !== undefined)
            this.onappend.add(append);
        if (update !== undefined)
            this.onupdate.add(update);
        if (remove !== undefined)
            this.onremove.add(remove);
    }
    *entries() {
        for (const [key, item] of this.items.entries()) {
            yield [key, item.value, item.bindings];
        }
    }
    clear() {
        this.assign(empty);
    }
    get length() {
        return this.items.length;
    }
    get(index) {
        return this.items[index].value;
    }
    getElement(index) {
        return this.items[index].bindings;
    }
    remove(index) {
        const item = this.items[index];
        if (item === undefined)
            return;
        if (this.onremove.size === 0) {
            for (const node of item.dom) {
                node.parentNode?.removeChild(node);
            }
        }
        else {
            for (const callback of this.onremove)
                callback(this.wrapper, item.dom, item.bindings);
        }
        this.items.splice(index, 1);
    }
    push(value) {
        this.insert(value, this.items.length);
    }
    insert(value, index) {
        let el = this.items[index];
        if (el === undefined) {
            const [bindings, frag] = this.itemFactory.dom();
            el = { bindings, value, dom: [...frag.childNodes] };
            for (const callback of this.onappend)
                callback(this.wrapper, el.dom, el.bindings);
        }
        if (this.onupdate !== undefined) {
            for (const callback of this.onupdate)
                callback(el.bindings, value, index);
        }
        this.items[index] = el;
    }
    assign(entries) {
        const iter = entries[Symbol.iterator]();
        let current = iter.next();
        let i = 0;
        for (; current.done === false; ++i, current = iter.next()) {
            const value = current.value;
            let el = this.items[i];
            if (el === undefined) {
                const [bindings, frag] = this.itemFactory.dom();
                el = { bindings, value, dom: [...frag.childNodes] };
                for (const callback of this.onappend)
                    callback(this.wrapper, el.dom, el.bindings);
            }
            if (this.onupdate !== undefined) {
                for (const callback of this.onupdate)
                    callback(el.bindings, value, i);
            }
            this._items[i] = el;
        }
        for (; i < this.items.length; ++i) {
            const item = this.items[i];
            if (item === undefined)
                continue;
            if (this.onremove.size === 0) {
                for (const node of item.dom) {
                    node.parentNode?.removeChild(node);
                }
            }
            else {
                for (const callback of this.onremove)
                    callback(this.wrapper, item.dom, item.bindings);
            }
        }
        const temp = this.items;
        this.items = this._items;
        this._items = temp;
        this._items.length = 0;
    }
}
const ListFactory = function (wrapper, item, append, update, remove) {
    return new RHU_MACRO(RHU_HTML.is(wrapper) ? wrapper : wrapper.html, (RHU_LIST), [wrapper, item, append, update, remove]);
};
Macro.list = ListFactory;
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
