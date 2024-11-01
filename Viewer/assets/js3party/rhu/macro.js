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
        this.boxed = false;
        this.callbacks = new Set();
    }
    bind(key) {
        this._bind = key;
        return this;
    }
    box() {
        this.boxed = true;
        return this;
    }
    unbox() {
        this.boxed = true;
        return this;
    }
    then(callback) {
        this.callbacks.add(callback);
        return this;
    }
    copy() {
        throw new Error("Invalid operation.");
    }
    _dom(target, children) {
        throw new Error("Invalid operation.");
    }
    dom(target, children) {
        const result = this._dom(target, children);
        for (const callback of this.callbacks) {
            callback(result[0], children === undefined ? NoChildren : children, result.pop());
        }
        return result;
    }
}
RHU_ELEMENT.is = Object.prototype.isPrototypeOf.bind(RHU_ELEMENT.prototype);
export { RHU_ELEMENT };
class RHU_ELEMENT_OPEN extends RHU_NODE {
    constructor(element) {
        super();
        this.element = element;
    }
    box() {
        this.element.box();
        return this;
    }
    unbox() {
        this.element.unbox();
        return this;
    }
    copy() {
        return new RHU_ELEMENT_OPEN(this.element.copy());
    }
    bind(key) {
        this.element.bind(key);
        return this;
    }
    then(callback) {
        this.element.then(callback);
        return this;
    }
    dom(target, children) {
        return this.element.dom(target, children);
    }
}
RHU_ELEMENT_OPEN.is = Object.prototype.isPrototypeOf.bind(RHU_ELEMENT_OPEN.prototype);
export { RHU_ELEMENT_OPEN };
class RHU_SIGNAL extends RHU_ELEMENT {
    constructor(binding, toString) {
        super();
        this.bind(binding);
        if (toString !== undefined)
            this.string(toString);
    }
    string(toString) {
        this._toString = toString;
    }
    value(value) {
        this._value = value;
        return this;
    }
    copy() {
        const copy = new RHU_SIGNAL(this._bind);
        copy._value = this._value;
        copy._toString = this._toString;
        copy.boxed = this.boxed;
        for (const callback of this.callbacks.values()) {
            copy.then(callback);
        }
        return copy;
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
            instance = signal(this._value);
        }
        if (doBinding)
            target[this._bind] = instance;
        const toString = this._toString;
        const node = document.createTextNode(`${this._value}`);
        const ref = new WeakRef(node);
        instance.on((value) => {
            const node = ref.deref();
            if (node === undefined)
                return;
            if (toString) {
                node.nodeValue = `${toString(value)}`;
            }
            else {
                node.nodeValue = `${value}`;
            }
        }, { condition: () => ref.deref() !== undefined });
        return [instance, node, [node]];
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
const NoChildren = document.createDocumentFragment().childNodes;
class RHU_MACRO extends RHU_ELEMENT {
    constructor(html, type, args) {
        super();
        this.html = html;
        this.type = type;
        this.args = args;
    }
    open() {
        return new RHU_ELEMENT_OPEN(this);
    }
    copy() {
        const copy = new RHU_MACRO(this.html, this.type, this.args).bind(this._bind);
        copy.boxed = this.boxed;
        for (const callback of this.callbacks.values()) {
            copy.then(callback);
        }
        return copy;
    }
    _dom(target, children) {
        const [b, frag] = this.html.dom();
        const dom = [...frag.childNodes];
        const instance = new this.type(dom, b, children === undefined ? NoChildren : children, ...this.args);
        if (target !== undefined && this._bind !== undefined && this._bind !== null) {
            if (this._bind in target)
                throw new SyntaxError(`The binding '${this._bind.toString()}' already exists.`);
            target[this._bind] = instance;
        }
        return [instance, frag, dom];
    }
}
RHU_MACRO.is = Object.prototype.isPrototypeOf.bind(RHU_MACRO.prototype);
export { RHU_MACRO };
export const html = function (first, ...interpolations) {
    return new RHU_HTML(first, interpolations);
};
html.close = RHU_CLOSURE.instance;
class RHU_HTML extends RHU_ELEMENT {
    constructor(first, interpolations) {
        super();
        this.close = RHU_CLOSURE.instance;
        this.first = first;
        this.interpolations = interpolations;
    }
    open() {
        return new RHU_ELEMENT_OPEN(this);
    }
    copy() {
        const copy = new RHU_HTML(this.first, this.interpolations).bind(this._bind);
        copy.boxed = this.boxed;
        for (const callback of this.callbacks.values()) {
            copy.then(callback);
        }
        return copy;
    }
    stitch(interp, slots) {
        if (isFactory(interp)) {
            throw new SyntaxError("Macro Factory cannot be used to construct a HTML fragment. Did you mean to call the factory?");
        }
        const index = slots.length;
        if (RHU_ELEMENT.is(interp) || isSignal(interp)) {
            slots.push(interp);
            return `<rhu-slot rhu-internal="${index}"></rhu-slot>`;
        }
        else if (RHU_ELEMENT_OPEN.is(interp)) {
            slots.push(interp.element);
            return `<rhu-slot rhu-internal="${index}">`;
        }
        else if (RHU_CLOSURE.is(interp)) {
            return `</rhu-slot>`;
        }
        else {
            return undefined;
        }
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
        let instance;
        const hasBinding = this._bind !== null && this._bind !== undefined;
        if (target !== undefined && !hasBinding && !this.boxed)
            instance = target;
        else
            instance = {};
        for (const el of fragment.querySelectorAll("*[m-id]")) {
            const key = el.getAttribute("m-id");
            el.removeAttribute("m-id");
            if (key in instance)
                throw new Error(`The binding '${key}' already exists.`);
            instance[key] = el;
        }
        if (target !== undefined && hasBinding) {
            if (this._bind in target)
                throw new SyntaxError(`The binding '${this._bind.toString()}' already exists.`);
            target[this._bind] = instance;
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
                if (!isSignal(slot)) {
                    const frag = slot.dom(instance, slotElement.childNodes)[1];
                    slotElement.replaceWith(frag);
                }
                else {
                    const node = document.createTextNode(`${slot()}`);
                    const ref = new WeakRef(node);
                    slot.on((value) => {
                        const node = ref.deref();
                        if (node === undefined)
                            return;
                        node.nodeValue = `${value}`;
                    }, { condition: () => ref.deref() !== undefined });
                    slotElement.replaceWith(node);
                }
            }
            catch (e) {
                slotElement.replaceWith();
                console.error(e);
                continue;
            }
        }
        return [instance, fragment, [...fragment.childNodes]];
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
        return new RHU_MACRO(html(...args), type, args);
    };
    factory.close = RHU_CLOSURE.instance;
    factory[isFactorySymbol] = true;
    return factory;
});
Macro.signal = (binding, value, toString) => new RHU_SIGNAL(binding, toString).value(value);
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
            this.wrapper = new wrapperFactory.type(dom, bindings, NoChildren, ...wrapperFactory.args);
            for (const callback of wrapperFactory.callbacks) {
                callback(this.wrapper, NoChildren, this.wrapper.dom);
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
    *values() {
        for (const item of this.items.values()) {
            yield [item.value, item.bindings];
        }
    }
    *keys() {
        for (const key of this.items.keys()) {
            yield key;
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
                callback(this.wrapper, item.dom, item.bindings, key, value);
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
                callback(this.wrapper, item.dom, item.bindings, key, item.value);
        }
    }
    assign(entries) {
        for (const [key, value] of entries) {
            let el = this.items.get(key);
            if (el === undefined)
                el = this._items.get(key);
            if (el === undefined) {
                const [bindings, frag] = this.itemFactory.dom();
                el = { bindings, value, dom: [...frag.childNodes] };
                for (const callback of this.onappend)
                    callback(this.wrapper, el.dom, el.bindings, key, value);
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
                    callback(this.wrapper, item.dom, item.bindings, key, item.value);
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
            this.wrapper = new wrapperFactory.type(dom, bindings, NoChildren, ...wrapperFactory.args);
            for (const callback of wrapperFactory.callbacks) {
                callback(this.wrapper, NoChildren, this.wrapper.dom);
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
                callback(this.wrapper, item.dom, item.bindings, value);
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
                callback(this.wrapper, item.dom, item.bindings, value);
        }
    }
    assign(entries) {
        for (const value of entries) {
            let el = this.items.get(value);
            if (el === undefined)
                el = this._items.get(value);
            if (el === undefined) {
                const [bindings, frag] = this.itemFactory.dom();
                el = { bindings, dom: [...frag.childNodes] };
                for (const callback of this.onappend)
                    callback(this.wrapper, el.dom, el.bindings, value);
            }
            if (this.onupdate !== undefined) {
                for (const callback of this.onupdate)
                    callback(el.bindings, value);
            }
            this._items.set(value, el);
        }
        for (const [value, item] of this.items) {
            if (this._items.has(value))
                continue;
            if (this.onremove.size === 0) {
                for (const node of item.dom) {
                    node.parentNode?.removeChild(node);
                }
            }
            else {
                for (const callback of this.onremove)
                    callback(this.wrapper, item.dom, item.bindings, value);
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
            this.wrapper = new wrapperFactory.type(dom, bindings, NoChildren, ...wrapperFactory.args);
            for (const callback of wrapperFactory.callbacks) {
                callback(this.wrapper, NoChildren, this.wrapper.dom);
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
    *values() {
        for (const item of this.items.values()) {
            yield [item.value, item.bindings];
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
                callback(this.wrapper, item.dom, item.bindings, item.value, index);
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
                callback(this.wrapper, el.dom, el.bindings, value, index);
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
                    callback(this.wrapper, el.dom, el.bindings, value, i);
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
                    callback(this.wrapper, item.dom, item.bindings, item.value, i);
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
const recursiveDispatch = function (node, event) {
    if (isElement(node))
        node.dispatchEvent(new CustomEvent(event));
    for (const child of node.childNodes)
        recursiveDispatch(child, event);
};
const observer = new MutationObserver(function (mutationList) {
    for (const mutation of mutationList) {
        switch (mutation.type) {
            case "childList":
                {
                    for (const node of mutation.addedNodes)
                        recursiveDispatch(node, "mount");
                    for (const node of mutation.removedNodes)
                        recursiveDispatch(node, "dismount");
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
