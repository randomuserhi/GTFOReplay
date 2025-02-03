import { isSignal } from "./signal.js";
const isMap = Object.prototype.isPrototypeOf.bind(Map.prototype);
const isArray = Object.prototype.isPrototypeOf.bind(Array.prototype);
const isNode = Object.prototype.isPrototypeOf.bind(Node.prototype);
const fragNodeMap = new WeakMap();
const baseNodes = new WeakMap();
class RHU_FRAGMENT_METADATA {
    constructor(owner = undefined) {
        this.owner = owner;
    }
}
export const DOM = Symbol("html.dom");
class RHU_FRAGMENT {
    constructor(owner, ...nodes) {
        this.set = new Map();
        this._length = 0;
        this[DOM] = owner;
        this.last = document.createComment(" << rhu-node >> ");
        baseNodes.set(this.last, owner);
        this._first = this._last = { node: this.last };
        this.append(...nodes);
    }
    static unbind(node) {
        const frag = fragNodeMap.get(node);
        if (frag?.owner !== undefined) {
            frag.owner[DOM].remove(node);
        }
    }
    replaceWith(...nodes) {
        html_replaceWith(this[DOM], ...nodes);
    }
    remove(...nodes) {
        for (const node of nodes) {
            if (node === this[DOM])
                continue;
            if (baseNodes.has(node))
                continue;
            const frag = fragNodeMap.get(node);
            if (frag?.owner === this[DOM]) {
                frag.owner = undefined;
                fragNodeMap.delete(node);
            }
            const el = this.set.get(node);
            if (el === undefined)
                continue;
            if (el.prev !== undefined)
                el.prev.next = el.next;
            else
                this._first = el.next;
            if (el.next !== undefined)
                el.next.prev = el.prev;
            this.set.delete(node);
            const parentNode = this.last.parentNode;
            if (parentNode !== null) {
                if (isHTML(node)) {
                    for (const n of node) {
                        if (n.parentNode === parentNode)
                            parentNode.removeChild(n);
                    }
                }
                else {
                    if (node.parentNode === parentNode) {
                        parentNode.removeChild(node);
                    }
                }
            }
            --this._length;
        }
    }
    append(...nodes) {
        for (const node of nodes) {
            if (node === this[DOM])
                continue;
            if (baseNodes.has(node))
                continue;
            if (!fragNodeMap.has(node)) {
                fragNodeMap.set(node, new RHU_FRAGMENT_METADATA());
            }
            const frag = fragNodeMap.get(node);
            if (frag.owner !== undefined) {
                frag.owner[DOM].remove(node);
            }
            frag.owner = this[DOM];
            const linkage = {
                node,
                prev: this._last.prev,
                next: this._last
            };
            this._last.prev = linkage;
            if (linkage.prev !== undefined)
                linkage.prev.next = linkage;
            else
                this._first = linkage;
            this.set.set(node, linkage);
            if (this.last.parentNode !== null) {
                if (isHTML(node)) {
                    for (const n of node) {
                        this.last.parentNode.insertBefore(n, this.last);
                    }
                }
                else {
                    this.last.parentNode.insertBefore(node, this.last);
                }
            }
            ++this._length;
        }
    }
    insertBefore(node, child) {
        if (node === this[DOM])
            return;
        if (baseNodes.has(node))
            return;
        if (!fragNodeMap.has(node)) {
            fragNodeMap.set(node, new RHU_FRAGMENT_METADATA());
        }
        const frag = fragNodeMap.get(node);
        if (frag.owner !== undefined) {
            frag.owner[DOM].remove(node);
        }
        let target = child === undefined ? undefined : this.set.get(child);
        if (target === undefined) {
            target = this._last;
        }
        frag.owner = this[DOM];
        const linkage = {
            node,
            prev: target.prev,
            next: target
        };
        target.prev = linkage;
        if (linkage.prev !== undefined)
            linkage.prev.next = linkage;
        else
            this._first = linkage;
        this.set.set(node, linkage);
        if (this.last.parentNode !== null) {
            let appendNode = isHTML(target.node) ? target.node[DOM].firstNode : target.node;
            if (appendNode.parentNode !== this.last.parentNode) {
                appendNode = this.last;
            }
            if (isHTML(node)) {
                for (const n of node) {
                    this.last.parentNode.insertBefore(n, appendNode);
                }
            }
            else {
                this.last.parentNode.insertBefore(node, appendNode);
            }
        }
        ++this._length;
    }
    get firstNode() {
        const node = this.first;
        if (isHTML(node)) {
            return node[DOM].firstNode;
        }
        else {
            return node;
        }
    }
    get lastNode() {
        return this.last;
    }
    get parent() { return this.last.parentNode; }
    get first() { return this._first.node; }
    get length() { return this._length; }
    *[Symbol.iterator]() {
        let current = this._first;
        while (current !== undefined) {
            yield current.node;
            current = current.next;
        }
    }
    *childNodes() {
        for (const node of this) {
            if (isHTML(node)) {
                yield* node;
            }
            else {
                yield node;
            }
        }
    }
}
class RHU_CLOSURE {
}
RHU_CLOSURE.instance = new RHU_CLOSURE();
RHU_CLOSURE.is = Object.prototype.isPrototypeOf.bind(RHU_CLOSURE.prototype);
class RHU_MARKER {
}
RHU_MARKER.is = Object.prototype.isPrototypeOf.bind(RHU_MARKER.prototype);
class RHU_NODE {
    bind(name) {
        this.name = name;
        return this;
    }
    open() {
        this.isOpen = true;
        return this;
    }
    box(boxed = true) {
        this.boxed = boxed;
        return this;
    }
    transform(transform) {
        transform(this.node);
        return this;
    }
    constructor(node) {
        this.isOpen = false;
        this.node = node;
    }
}
RHU_NODE.is = Object.prototype.isPrototypeOf.bind(RHU_NODE.prototype);
const RHU_HTML_PROTOTYPE = {
    [Symbol.iterator]: function* () {
        for (const node of this[DOM]) {
            if (isHTML(node)) {
                yield* node;
            }
            else {
                yield node;
            }
        }
    },
    [Symbol.toStringTag]: "RHU_FRAG"
};
class RHU_DOM extends RHU_FRAGMENT {
    constructor() {
        super(...arguments);
        this.binds = [];
        this.close = RHU_CLOSURE.instance;
        this.boxed = false;
    }
    children(cb) {
        this.onChildren = cb;
        return this;
    }
    box(boxed = true) {
        this.boxed = boxed;
        return this;
    }
}
RHU_DOM.is = Object.prototype.isPrototypeOf.bind(RHU_DOM.prototype);
export const isHTML = (object) => {
    if (object === undefined)
        return false;
    return RHU_DOM.is(object[DOM]);
};
function stitch(interp, slots) {
    if (interp === undefined)
        return undefined;
    const index = slots.length;
    if (isNode(interp) || isHTML(interp) || isSignal(interp) || RHU_MARKER.is(interp)) {
        slots.push(interp);
        return `<rhu-slot rhu-internal="${index}"></rhu-slot>`;
    }
    else if (RHU_NODE.is(interp)) {
        slots.push(interp);
        return `<rhu-slot rhu-internal="${index}">${interp.isOpen ? `` : `</rhu-slot>`}`;
    }
    else if (RHU_CLOSURE.is(interp)) {
        return `</rhu-slot>`;
    }
    else {
        return undefined;
    }
}
const defineProperties = Object.defineProperties;
function html_addBind(instance, key, value) {
    if (key in instance)
        throw new Error(`The binding '${key.toString()}' already exists.`);
    instance[key] = value;
    instance[DOM].binds.push(key);
}
function html_makeRef(implementation, ref) {
    const wref = {
        deref() {
            const marker = ref();
            if (marker === undefined)
                return undefined;
            return baseNodes.get(marker);
        },
        hasref() {
            return ref() !== undefined;
        }
    };
    defineProperties(implementation, {
        ref: {
            get() {
                return wref;
            },
            configurable: false
        }
    });
}
function html_replaceWith(target, ...nodes) {
    const _isHTML = isHTML(target);
    const parent = _isHTML ? target[DOM].parent : target.parentNode;
    if (parent === null)
        return;
    const ref = _isHTML ? target[DOM].firstNode : target;
    for (const node of nodes) {
        RHU_FRAGMENT.unbind(node);
        if (isHTML(node)) {
            for (const n of node) {
                parent.insertBefore(n, ref);
            }
        }
        else {
            parent.insertBefore(node, ref);
        }
    }
    html.remove(parent, target);
}
export const html = ((first, ...interpolations) => {
    if (isHTML(first)) {
        return first[DOM];
    }
    let source = first[0];
    const slots = [];
    for (let i = 1; i < first.length; ++i) {
        const interp = interpolations[i - 1];
        const result = stitch(interp, slots);
        if (result !== undefined) {
            source += result;
        }
        else if (Array.isArray(interp)) {
            const array = interp;
            for (const interp of array) {
                const result = stitch(interp, slots);
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
        source += first[i];
    }
    const template = document.createElement("template");
    template.innerHTML = source;
    const fragment = template.content;
    document.createNodeIterator(fragment, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT, {
        acceptNode(node) {
            if (node.nodeType === Node.COMMENT_NODE)
                node.parentNode?.removeChild(node);
            else {
                const value = node.nodeValue;
                if (value === null || value === undefined)
                    node.parentNode?.removeChild(node);
                else if (value.trim() === "")
                    node.parentNode?.removeChild(node);
            }
            return NodeFilter.FILTER_REJECT;
        }
    }).nextNode();
    const instance = Object.create(RHU_HTML_PROTOTYPE);
    const implementation = new RHU_DOM(instance);
    instance[DOM] = implementation;
    for (const el of fragment.querySelectorAll("*[m-id]")) {
        const key = el.getAttribute("m-id");
        el.removeAttribute("m-id");
        html_addBind(instance, key, el);
    }
    let elements = [];
    for (const node of fragment.childNodes) {
        let attr;
        if (isElement(node) && (attr = node.getAttribute("rhu-internal"))) {
            const i = parseInt(attr);
            if (isNaN(i)) {
                throw new Error("Could not obtain slot id.");
            }
            node.setAttribute("rhu-elements", elements.length.toString());
            elements.push(undefined);
        }
        else {
            elements.push(node);
        }
    }
    let filterUndefined = false;
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
            let hole = slotElement.getAttribute("rhu-elements");
            if (hole === null) {
                hole = undefined;
            }
            else {
                hole = parseInt(hole);
                if (isNaN(hole)) {
                    hole = undefined;
                }
            }
            const item = slots[i];
            let descriptor = undefined;
            let slot;
            if (RHU_NODE.is(item)) {
                descriptor = item;
                slot = item.node;
            }
            else {
                slot = item;
            }
            if (isSignal(slot)) {
                const node = document.createTextNode(`${slot()}`);
                const ref = new WeakRef(node);
                slot.on((value) => {
                    const node = ref.deref();
                    if (node === undefined)
                        return;
                    node.nodeValue = slot.string(value);
                }, { condition: () => ref.deref() !== undefined });
                const slotName = descriptor?.name;
                if (slotName !== undefined) {
                    html_addBind(instance, slotName, slot);
                }
                html_replaceWith(slotElement, node);
                if (hole !== undefined)
                    elements[hole] = node;
            }
            else if (isNode(slot)) {
                const slotName = descriptor?.name;
                if (slotName !== undefined) {
                    html_addBind(instance, slotName, slot);
                }
                html_replaceWith(slotElement, slot);
                if (hole !== undefined)
                    elements[hole] = slot;
            }
            else if (RHU_MARKER.is(slot)) {
                const node = document.createComment(" << rhu-marker >> ");
                node[DOM] = "marker";
                const slotName = descriptor?.name;
                if (slotName !== undefined) {
                    html_addBind(instance, slotName, node);
                }
                html_replaceWith(slotElement, node);
                if (hole !== undefined)
                    elements[hole] = node;
            }
            else if (isHTML(slot)) {
                const slotImplementation = slot[DOM];
                let boxed = descriptor?.boxed;
                if (boxed === undefined)
                    boxed = slotImplementation.boxed;
                if (boxed || descriptor?.name !== undefined) {
                    const slotName = descriptor?.name;
                    if (slotName !== undefined) {
                        html_addBind(instance, slotName, slot);
                    }
                }
                else {
                    for (const key of slotImplementation.binds) {
                        html_addBind(instance, key, slot[key]);
                    }
                }
                if (slotImplementation.onChildren !== undefined)
                    slotImplementation.onChildren(slotElement.childNodes);
                html_replaceWith(slotElement, slot);
                if (hole !== undefined)
                    elements[hole] = slot;
            }
            else {
                const node = document.createTextNode(`${slot}`);
                const slotName = descriptor?.name;
                if (slotName !== undefined) {
                    html_addBind(instance, slotName, node);
                }
                html_replaceWith(slotElement, node);
                if (hole !== undefined)
                    elements[hole] = node;
            }
        }
        catch (e) {
            if (slotElement.parentNode === fragment)
                filterUndefined = true;
            slotElement.replaceWith();
            console.error(e);
            continue;
        }
    }
    if (filterUndefined) {
        elements = elements.filter(v => v !== undefined);
    }
    implementation.append(...elements);
    const markerRef = new WeakRef(implementation.last);
    html_makeRef(implementation, markerRef.deref.bind(markerRef));
    return instance;
});
html.close = () => RHU_CLOSURE.instance;
html.closure = RHU_CLOSURE.instance;
html.open = (obj) => {
    if (RHU_NODE.is(obj)) {
        obj.open();
        return obj;
    }
    return new RHU_NODE(obj).open();
};
html.bind = (obj, name) => {
    if (RHU_NODE.is(obj)) {
        obj.bind(name);
        return obj;
    }
    return new RHU_NODE(obj).bind(name);
};
html.box = (el, boxed) => {
    if (RHU_NODE.is(el)) {
        el.box(boxed);
        return el;
    }
    return new RHU_NODE(el).box(boxed);
};
html.ref = ((target, obj) => {
    if (obj === undefined) {
        if (isHTML(target)) {
            return target[DOM].ref;
        }
        const deref = WeakRef.prototype.deref.bind(new WeakRef(target));
        return {
            deref,
            hasref: () => deref() !== undefined
        };
    }
    else {
        const wr = isHTML(target) ? target[DOM].ref : new WeakRef(target);
        const wmap = new WeakMap();
        wmap.set(target, obj);
        return {
            deref() {
                return wmap.get(wr.deref());
            },
            hasref() {
                return wr.deref() !== undefined;
            }
        };
    }
});
html.replaceWith = html_replaceWith;
html.remove = (target, ...nodes) => {
    if (isHTML(target)) {
        target[DOM].remove(...nodes);
    }
    else {
        for (const node of nodes) {
            if (isHTML(node)) {
                RHU_FRAGMENT.unbind(node);
                for (const n of node) {
                    if (n.parentNode === target)
                        target.removeChild(n);
                }
            }
            else {
                if (node.parentNode === target) {
                    RHU_FRAGMENT.unbind(node);
                    target.removeChild(node);
                }
            }
        }
    }
};
html.append = (target, ...nodes) => {
    if (isHTML(target)) {
        target[DOM].append(...nodes);
    }
    else {
        for (const node of nodes) {
            RHU_FRAGMENT.unbind(node);
            if (isHTML(node)) {
                for (const n of node) {
                    target.appendChild(n);
                }
            }
            else {
                target.appendChild(node);
            }
        }
    }
};
html.insertBefore = (target, node, ref) => {
    if (isHTML(target)) {
        target[DOM].insertBefore(node, ref);
    }
    else {
        RHU_FRAGMENT.unbind(node);
        const nref = isHTML(ref) ? ref[DOM].firstNode : ref;
        if (isHTML(node)) {
            for (const n of node) {
                target.insertBefore(n, nref);
            }
        }
        else {
            target.insertBefore(node, nref);
        }
    }
};
html.replaceChildren = (target, ...nodes) => {
    target.replaceChildren();
    html.append(target, ...nodes);
};
html.map = ((signal, iterator, factory) => {
    const dom = html ``;
    dom.signal = signal;
    dom.existingEls = new Map();
    dom._existingEls = new Map();
    const stack = [];
    const ref = dom[DOM].ref;
    const update = (value) => {
        const dom = ref.deref();
        if (dom === undefined)
            return;
        const internal = dom[DOM];
        let kvIter = undefined;
        if (iterator !== undefined) {
            kvIter = iterator(value);
        }
        else if (isMap(value) || isArray(value)) {
            kvIter = value.entries();
        }
        if (kvIter != undefined) {
            let prev = undefined;
            for (const kv of kvIter) {
                const [key] = kv;
                if (dom._existingEls.has(key)) {
                    console.warn("'html.map' does not support non-unique keys.");
                    continue;
                }
                const pos = dom._existingEls.size;
                const old = dom.existingEls.get(key);
                const oldEl = old === undefined ? undefined : old[0];
                let el = undefined;
                try {
                    el = factory(kv, oldEl);
                }
                catch (e) {
                    console.error(e);
                    continue;
                }
                if (oldEl === undefined && el === undefined)
                    continue;
                const inOrder = old === undefined || prev === undefined || old[1] > prev;
                const outOfOrder = !inOrder;
                if (old !== undefined && inOrder) {
                    prev = old[1];
                    if (oldEl !== undefined) {
                        for (const el of stack) {
                            internal.insertBefore(el, oldEl);
                        }
                        stack.length = 0;
                    }
                }
                else if (el !== oldEl || outOfOrder) {
                    if (oldEl !== undefined) {
                        internal.remove(oldEl);
                    }
                    if (el !== undefined) {
                        stack.push(el);
                    }
                }
                if (old === undefined) {
                    dom._existingEls.set(key, [el, pos]);
                }
                else {
                    old[0] = el;
                    old[1] = pos;
                    dom._existingEls.set(key, old);
                }
            }
            if (stack.length > 0) {
                internal.append(...stack);
            }
            stack.length = 0;
        }
        for (const [key, [el]] of dom.existingEls) {
            if (dom._existingEls.has(key))
                continue;
            if (el === undefined)
                continue;
            internal.remove(el);
        }
        dom.existingEls.clear();
        const temp = dom._existingEls;
        dom._existingEls = dom.existingEls;
        dom.existingEls = temp;
    };
    signal.on(update, { condition: ref.hasref });
    return dom;
});
html.transform = (el, transform) => {
    if (RHU_NODE.is(el)) {
        el.transform(transform);
        return el;
    }
    return new RHU_NODE(el).transform(transform);
};
html.marker = (name) => {
    return new RHU_NODE(new RHU_MARKER()).bind(name);
};
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
html.observe = function (target) {
    observer.observe(target, {
        childList: true,
        subtree: true
    });
};
const onDocumentLoad = function () {
    html.observe(document);
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDocumentLoad);
}
else {
    onDocumentLoad();
}
