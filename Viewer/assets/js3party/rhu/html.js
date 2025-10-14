/// html.ts 
///
/// @randomuserhi
import { isSignal } from "./signal.js";
// Internal helper functions for runtime type information.
const isMap = Object.prototype.isPrototypeOf.bind(Map.prototype);
const isArray = Object.prototype.isPrototypeOf.bind(Array.prototype);
const isNode = Object.prototype.isPrototypeOf.bind(Node.prototype);
const isElement = Object.prototype.isPrototypeOf.bind(Element.prototype);
/** Symbol for accessing DOM interface on a Fragment. */
export const DOM = Symbol("RHU_HTML.[[DOM]]");
/**
 * Maps nodes / components to their metadata.
 *
 * Used to prevent mutating `Node` objects which could lead to undefined behaviour.
 */
const metadata = new WeakMap();
/** Keeps track of existing fragment markers. Refer to RHU_FRAGMENT for more details. */
const markers = new WeakMap();
/**
 * Metadata that is attached to a node / component.
 *
 * Used for tracking which RHU_FRAGMENT has ownership over a given node / component.
 */
class RHU_METADATA {
    constructor(owner = undefined) {
        this.owner = owner;
    }
}
/**
 * Node of the linked list used within a RHU_FRAGMENT that represents
 * the elements / components within said fragment.
 */
class RHU_FRAGMENT_NODE {
}
/**
 * Collection of elements or components.
 *
 * Can be thought of as <></> from React.
 */
class RHU_FRAGMENT {
    constructor(owner, ...nodes) {
        /** Internal collection of nodes / components that make up this fragment. */
        this.nodes = new Map();
        /** The size of the fragment */
        this._length = 0;
        // Assign owning component
        this[DOM] = owner;
        // Create marker.
        this.marker = document.createComment(" << rhu-node >> ");
        // Register this fragment's marker
        markers.set(this.marker, owner);
        // Assign first and last node
        this._first = this._last = { node: this.marker };
        // Append provided nodes
        this.append(...nodes);
    }
    /**
     * Mark the provided node / component as not being owned by any fragment, clearing it of its metadata
     * and removing the node / component from the fragment.
     */
    static unbind(node) {
        const frag = metadata.get(node);
        if (frag?.owner !== undefined) {
            frag.owner[DOM].remove(node);
        }
    }
    /** Append the nodes / components to this fragment. */
    append(...nodes) {
        for (const node of nodes) {
            // Skip self
            if (node === this[DOM])
                continue;
            // Skip if it is a fragment marker
            if (markers.has(node))
                continue;
            // Create metadata for the node.
            if (!metadata.has(node)) {
                metadata.set(node, new RHU_METADATA());
            }
            const meta = metadata.get(node);
            // If it previously belonged to another fragment,
            // remove the node from the previous owner.
            if (meta.owner !== undefined) {
                meta.owner[DOM].remove(node);
            }
            // Set ownership
            meta.owner = this[DOM];
            // Add node to the fragment, appending to the end of the linked list.
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
            // Add node to collection.
            this.nodes.set(node, linkage);
            // If the fragment is on the DOM, append the node to the DOM.
            if (this.marker.parentNode !== null) {
                if (isHTML(node)) {
                    // If it is a RHU.Component we need to append the elements that make up the component.
                    for (const n of node) {
                        this.marker.parentNode.insertBefore(n, this.marker);
                    }
                }
                else {
                    this.marker.parentNode.insertBefore(node, this.marker);
                }
            }
            // Update the length
            ++this._length;
        }
    }
    /** Remove nodes / components from this fragment */
    remove(...nodes) {
        for (const node of nodes) {
            // Skip self
            if (node === this[DOM])
                continue;
            // Skip if it is a fragment marker
            if (markers.has(node))
                continue;
            // Get metadata for the node.
            const frag = metadata.get(node);
            if (frag?.owner === this[DOM]) {
                // If this fragment owns the node, remove ownership.
                frag.owner = undefined;
                metadata.delete(node);
            }
            // Try and get the node in the fragment.
            const el = this.nodes.get(node);
            if (el === undefined)
                continue; // Skip if we cannot find it.
            // Update the linked list to remove the node.
            if (el.prev !== undefined)
                el.prev.next = el.next;
            else
                this._first = el.next;
            if (el.next !== undefined)
                el.next.prev = el.prev;
            // Delete node from collection.
            this.nodes.delete(node);
            // If the fragment is on the DOM, remove the node from the dom.
            const parentNode = this.marker.parentNode;
            if (parentNode !== null) {
                if (isHTML(node)) {
                    // If it is a RHU.Component we need to remove the elements that make up the component.
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
            // Update the length.
            --this._length;
        }
    }
    /** Insert `child` node before the target `node` */
    insertBefore(node, child) {
        // Skip self
        if (node === this[DOM])
            return;
        // Skip if it is a fragment marker
        if (markers.has(node))
            return;
        // Create metadata for the node.
        if (!metadata.has(node)) {
            metadata.set(node, new RHU_METADATA());
        }
        const meta = metadata.get(node);
        // remove from old collection
        if (meta.owner !== undefined) {
            meta.owner[DOM].remove(node);
        }
        // find target
        let target = child === undefined ? undefined : this.nodes.get(child);
        if (target === undefined) {
            target = this._last;
        }
        // Add node to the fragment, appending to the end of the linked list.
        meta.owner = this[DOM];
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
        // Add node to collection.
        this.nodes.set(node, linkage);
        // If the fragment is on the DOM, append the node to the DOM.
        if (this.marker.parentNode !== null) {
            let appendNode = isHTML(target.node) ? target.node[DOM].__firstNode : target.node;
            if (appendNode.parentNode !== this.marker.parentNode) {
                appendNode = this.marker;
            }
            if (isHTML(node)) {
                for (const n of node) {
                    this.marker.parentNode.insertBefore(n, appendNode);
                }
            }
            else {
                this.marker.parentNode.insertBefore(node, appendNode);
            }
        }
        ++this._length;
    }
    /** Replace the fragment with a node / component in the DOM. */
    replaceWith(...nodes) {
        replaceWith(this[DOM], ...nodes);
    }
    /** Get the first node / component in the fragment, not including the fragment marker. */
    get first() {
        const node = this._first.node;
        if (node === this.marker)
            return undefined;
        return node;
    }
    /** Gets the actual first DOM Node, not including the fragment marker. */
    get firstNode() {
        const node = this.first;
        if (isHTML(node)) {
            return node[DOM].firstNode;
        }
        else {
            return node;
        }
    }
    /** Get the last node / component in the fragment, not including the fragment marker. */
    get last() {
        return this._last.prev?.node;
    }
    /** Gets the actual last DOM Node, not including the fragment marker. */
    get lastNode() {
        const node = this.last;
        if (isHTML(node)) {
            return node[DOM].lastNode;
        }
        else {
            return node;
        }
    }
    /** Get the first node / component in the fragment, including the fragment marker. */
    get __first() {
        const node = this._first.node;
        return node;
    }
    /** Gets the actual first DOM Node, including the fragment marker. */
    get __firstNode() {
        const node = this.__first;
        if (isHTML(node)) {
            return node[DOM].__firstNode;
        }
        else {
            return node;
        }
    }
    /** Get the last node / component in the fragment, including the fragment marker. */
    get __last() {
        return this._last.node;
    }
    /** Gets the actual last DOM Node, including the fragment marker. */
    get __lastNode() {
        const node = this.__last;
        if (isHTML(node)) {
            return node[DOM].__lastNode;
        }
        else {
            return node;
        }
    }
    /** Get the parent of the fragment, when attached to DOM. */
    get parent() { return this.marker.parentNode; }
    /** Size of the fragment */
    get length() { return this._length; }
    /**
     * Get all elements / components within the fragment.
     * Includes the marker node.
     */
    *[Symbol.iterator]() {
        let current = this._first;
        while (current !== undefined) {
            yield current.node;
            current = current.next;
        }
    }
    /**
     * Get all elements of the fragment, decomponsing components into their elements.
     * Include the marker node.
     */
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
/** Helper function that replaces the target node / component on the DOM tree. */
function replaceWith(target, ...nodes) {
    const _isHTML = isHTML(target);
    const parent = _isHTML ? target[DOM].parent : target.parentNode;
    if (parent === null)
        return;
    const ref = _isHTML ? target[DOM].__firstNode : target;
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
    remove(parent, target);
}
/** Helper function that removes nodes / components from the target. */
function remove(target, ...nodes) {
    if (isHTML(target)) {
        // If the target is a component, we can use the fragments method.
        target[DOM].remove(...nodes);
    }
    else {
        // Otherwise remove each individual node.
        for (const node of nodes) {
            if (isHTML(node)) {
                if (node[DOM].parent === target) {
                    // In case the component is owned by a fragment, we need to unbind it
                    // now that it is removed from the DOM tree (and thus the fragment as well).
                    RHU_FRAGMENT.unbind(node);
                    // Remove the nodes that make up the fragment
                    for (const n of node) {
                        if (n.parentNode === target)
                            target.removeChild(n);
                    }
                }
            }
            else {
                if (node.parentNode === target) {
                    // In case the node is owned by a fragment, we need to unbind it
                    // now that it is removed from the DOM tree (and thus the fragment as well).
                    RHU_FRAGMENT.unbind(node);
                    // Remove the node
                    target.removeChild(node);
                }
            }
        }
    }
}
/**
 * A component is a custom element made up from other components / elements.
 */
class RHU_COMPONENT extends RHU_FRAGMENT {
    constructor() {
        super(...arguments);
        this.binds = [];
        this.close = RHU_CLOSURE.instance;
        this.boxed = false;
    }
    /** Set the callback which occures when children are added to the component. */
    children(cb) {
        this.onChildren = cb;
        return this;
    }
    /** If true, boxes the bindings such that they are not inheritted directly when used. */
    box(boxed = true) {
        this.boxed = boxed;
        return this;
    }
}
RHU_COMPONENT.is = Object.prototype.isPrototypeOf.bind(RHU_COMPONENT.prototype);
/**
 * A marker is just a html comment that marks a position in the DOM tree.
 */
class RHU_MARKER {
}
RHU_MARKER.is = Object.prototype.isPrototypeOf.bind(RHU_MARKER.prototype);
/**
 * Wrapper around any object that needs to be treated like a HTML DOM node.
 *
 * The wrapper allows providing HTML properties to the object without extending the object to support them.
 */
class RHU_NODE {
    /** Bind the node to a given property key. */
    bind(name) {
        this.name = name;
        return this;
    }
    /**
     * Generate the opening tag for the given node.
     *
     * The opening tag must be closed by a RHU_CLOSURE.
     */
    open() {
        this.isOpen = true;
        return this;
    }
    /**
     * If true, the bindings of the component are boxed behind a single property.
     * Otherwise, the bindings are directly inheritted.
     *
     * Only valid if wrapping a `RHU.Component`.
     */
    box(boxed = true) {
        this.boxed = boxed;
        return this;
    }
    /**
     * Executes a transformation onto this node immediately. Allows for applying changes to a given
     * component inline.
     */
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
/**
 * Implementation the closing tag of an element.
 *
 * Used with opening tags to mark the end.
 */
class RHU_CLOSURE {
}
RHU_CLOSURE.instance = new RHU_CLOSURE();
RHU_CLOSURE.is = Object.prototype.isPrototypeOf.bind(RHU_CLOSURE.prototype);
/**
 * Prototype used to determine if an object is a RHU.Component
 */
const componentProto = {
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
    [Symbol.toStringTag]: "RHU.Component"
};
/** Returns true if the node is a RHU.Component */
export const isHTML = (object) => {
    if (object === undefined)
        return false;
    return RHU_COMPONENT.is(object[DOM]);
};
/**
 * Helper function for interpretting string templates.
 *
 * Replaces all non-standard DOM elements with slots which can then be replaced in post,
 * stitching together the template to produce a valid string that can be parsed into HTML.
 */
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
/** Tag used to tell the difference between a regular array and an array that holds a collection of binds. */
const bindArrayTag = Symbol("RHU_HTML.[[BIND_ARRAY_TAG]]");
/** Utility function that checks if the provided object is the special array holding a collection of binds. */
const isBindArray = ((obj) => /**Array.isArray(obj) &&*/ bindArrayTag in obj);
/**
 * Helper function that binds a value to the target instance.
 * If the bind already exists, converts it to an array and pushes the new value.
 */
function bind(instance, key, value) {
    if (key in instance) {
        // If the key already exists, then the value should be converted to a "bind array".
        // A "bind array" is just a tagged js array indicating it holds a collection of values.
        // This is to distinguish it from a regular array so that we can support a collection of arrays.
        if (isBindArray(instance[key])) {
            // If it is already a bind array, push the value to it.
            instance[key].push(value);
        }
        else {
            // If it is not already a bind array, make it one.
            const collection = [instance[key], value];
            collection[bindArrayTag] = undefined;
            instance[key] = collection;
        }
    }
    else {
        // If the key does not exist, store it as a single value.
        instance[key] = value;
        instance[DOM].binds.push(key);
    }
}
/**
 * Helper function that creates a weak reference to the fragment marker and binds it to the component.
 * This helper function exists to prevent capturing unnecessary scopes when binding the weak ref which could prevent GC.
 */
function makeRef(implementation, ref) {
    const wref = {
        deref() {
            const marker = ref();
            if (marker === undefined)
                return undefined;
            return markers.get(marker);
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
export const html = ((first, ...interpolations) => {
    if (isHTML(first)) {
        // Handle overload which just gets the underlying DOM interface of the provided component.
        return first[DOM];
    }
    // Handle overload for creating `RHU.Component`
    // Stitch together source to form valid HTML.
    // Replaces objects that should be interpreted as custom elements with slots
    // that will get replaced with actual DOM later.
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
    // Parse source using a `template` element
    const template = document.createElement("template");
    template.innerHTML = source;
    const fragment = template.content;
    // Remove nonsense text nodes and comments
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
    // Create component instance
    const instance = Object.create(componentProto);
    const implementation = new RHU_COMPONENT(instance);
    instance[DOM] = implementation;
    // Create bindings
    for (const el of fragment.querySelectorAll("*[m-id]")) {
        const key = el.getAttribute("m-id");
        el.removeAttribute("m-id");
        bind(instance, key, el);
    }
    // Create element list that keeps track of which objects from the string template
    // belong to which slots generated by the stitching process.
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
    // Parse the slots, replacing with the actual DOM.
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
            // Isolate the descriptor (wrapper) from the actual slot object.
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
                // Manage binds
                const slotName = descriptor?.name;
                if (slotName !== undefined) {
                    bind(instance, slotName, slot);
                }
                replaceWith(slotElement, node);
                if (hole !== undefined)
                    elements[hole] = node;
            }
            else if (isNode(slot)) {
                // Manage binds
                const slotName = descriptor?.name;
                if (slotName !== undefined) {
                    bind(instance, slotName, slot);
                }
                replaceWith(slotElement, slot);
                if (hole !== undefined)
                    elements[hole] = slot;
            }
            else if (RHU_MARKER.is(slot)) {
                const node = document.createComment(" << rhu-marker >> ");
                node[DOM] = "marker";
                // Manage binds
                const slotName = descriptor?.name;
                if (slotName !== undefined) {
                    bind(instance, slotName, node);
                }
                replaceWith(slotElement, node);
                if (hole !== undefined)
                    elements[hole] = node;
            }
            else if (isHTML(slot)) {
                const slotImplementation = slot[DOM];
                // Obtain overridable settings
                let boxed = descriptor?.boxed;
                if (boxed === undefined)
                    boxed = slotImplementation.boxed;
                // Manage binds
                if (boxed || descriptor?.name !== undefined) {
                    const slotName = descriptor?.name;
                    if (slotName !== undefined) {
                        bind(instance, slotName, slot);
                    }
                }
                else {
                    for (const key of slotImplementation.binds) {
                        bind(instance, key, slot[key]);
                    }
                }
                if (slotImplementation.onChildren !== undefined)
                    slotImplementation.onChildren(slotElement.childNodes);
                replaceWith(slotElement, slot);
                if (hole !== undefined)
                    elements[hole] = slot;
            }
            else {
                // If its an unknown type, treat it as a text node
                const node = document.createTextNode(`${slot}`);
                // Manage binds
                const slotName = descriptor?.name;
                if (slotName !== undefined) {
                    bind(instance, slotName, node);
                }
                replaceWith(slotElement, node);
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
    // Append elements
    implementation.append(...elements);
    // We have to call a separate function to prevent context hoisting from 
    // preventing garbage collection of the marker node.
    //
    // By declaring an inline function, it will include the context of the above scope,
    // this is what allows us to reference `marker` despite it being outside of the
    // inline functions scope. However, this means that the inline function holds a reference
    // to the context, thus preventing GC of variables inside of said context (such as `marker`).
    //
    // Since we want to be able to hold a reference to the `ref` inlien function but not the context
    // it resides in, we call a separate function. The separate function has its own context (hence
    // we can no longer access `marker` as per its scope) and thus circumvents this issue.
    const markerRef = new WeakRef(implementation.marker);
    makeRef(implementation, markerRef.deref.bind(markerRef));
    return instance;
});
html.close = () => RHU_CLOSURE.instance;
html.closure = RHU_CLOSURE.instance;
html.open = (obj) => {
    if (RHU_NODE.is(obj)) {
        obj.open();
        return obj;
    }
    // Wrap object as a RHU_NODE, if it isn't already
    return new RHU_NODE(obj).open();
};
html.bind = (obj, name) => {
    if (RHU_NODE.is(obj)) {
        obj.bind(name);
        return obj;
    }
    // Wrap object as a RHU_NODE, if it isn't already
    return new RHU_NODE(obj).bind(name);
};
html.box = (el, boxed) => {
    if (RHU_NODE.is(el)) {
        el.box(boxed);
        return el;
    }
    // Wrap object as a RHU_NODE, if it isn't already
    return new RHU_NODE(el).box(boxed);
};
html.ref = ((target, obj) => {
    if (obj === undefined) {
        // Overload for obtaining a weakRef to the target
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
        // Overload for creating a weakref to the given object where its lifetime is tied to the provided target.
        // - Whilst the target is still retained, the object is also retained.
        // - If the target is GC'd, the object may be GC'd as long as no other references to it exist.
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
html.replaceWith = replaceWith;
html.remove = remove;
html.append = (target, ...nodes) => {
    if (isHTML(target)) {
        // If the target is a component, we can append to its internal fragment.
        target[DOM].append(...nodes);
    }
    else {
        for (const node of nodes) {
            // In case the component is owned by a fragment, we need to unbind it
            // now that it is removed from the DOM tree (and thus the fragment as well).
            RHU_FRAGMENT.unbind(node);
            if (isHTML(node)) {
                // Append the nodes that make up the fragment
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
        // If the target is a component, we can call insertBefore on its internal fragment.
        target[DOM].insertBefore(node, ref);
    }
    else {
        // In case the component is owned by a fragment, we need to unbind it
        // now that it is removed from the DOM tree (and thus the fragment as well).
        RHU_FRAGMENT.unbind(node);
        const nref = isHTML(ref) ? ref[DOM].__firstNode : ref;
        if (isHTML(node)) {
            // Insert the nodes that make up the fragment
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
// Helper function that creates the update callback for `html.map`.
// Required to prevent the `update` callback from capturing unnecessary variables in the scope and keeping them alive.
function map_update(ref, iterator, factory) {
    // Stack used to book keep out-of-order items.
    const stack = [];
    // Recycled buffer used to reduce garbage collections
    let _existingEls = new Map();
    return (value) => {
        const dom = ref.deref();
        if (dom === undefined)
            return;
        const internal = dom[DOM];
        // Obtain iterable
        let kvIter = undefined;
        if (iterator !== undefined) {
            try {
                kvIter = iterator(value);
            }
            catch (e) {
                console.error(e);
            }
        }
        else if (isMap(value) || isArray(value)) {
            kvIter = value.entries();
        }
        if (kvIter != undefined) {
            // Store the old position of the previous existing element
            let prev = undefined;
            for (const kv of kvIter) {
                const [key] = kv;
                if (_existingEls.has(key)) {
                    console.warn("'html.map' does not support non-unique keys.");
                    continue;
                }
                const pos = _existingEls.size; // Position of current element
                // Get previous state if the element existed previously
                const old = dom.existingEls.get(key);
                const oldEl = old === undefined ? undefined : old[0];
                // Generate new state
                let el = undefined;
                try {
                    el = factory(kv, oldEl);
                }
                catch (e) {
                    // Continue on error
                    console.error(e);
                    continue;
                }
                // Skip if both old element and new element are undefined
                if (oldEl === undefined && el === undefined)
                    continue;
                // If the element previously existed, and its old position is less than
                // the last seen existing element, then it must be out of order since
                // it now needs to exist after the last seen existing element.
                //
                // NOTE(randomuserhi): The below code is simply the inverse of the above statement
                //                     for if the element is in order.
                const inOrder = old === undefined || prev === undefined || old[1] > prev;
                const outOfOrder = !inOrder;
                if (old !== undefined && inOrder) {
                    // If the element last existed and is in order, append
                    // elements from the stack and update `prev`.
                    prev = old[1];
                    if (oldEl !== undefined) {
                        for (const el of stack) {
                            internal.insertBefore(el, oldEl);
                        }
                        stack.length = 0;
                    }
                }
                else if (el !== oldEl || outOfOrder) {
                    // If the element is out of order / is different to the existing 
                    // one, remove it and append to stack
                    if (oldEl !== undefined) {
                        internal.remove(oldEl);
                    }
                    if (el !== undefined) {
                        stack.push(el);
                    }
                }
                // Update element map
                if (old === undefined) {
                    _existingEls.set(key, [el, pos]);
                }
                else {
                    old[0] = el;
                    old[1] = pos;
                    _existingEls.set(key, old);
                }
            }
            // Append remaining elements in stack to the end of the map
            if (stack.length > 0) {
                internal.append(...stack);
            }
            stack.length = 0;
        }
        // Remove elements that no longer exist
        for (const [key, [el]] of dom.existingEls) {
            if (_existingEls.has(key))
                continue;
            if (el === undefined)
                continue;
            internal.remove(el);
        }
        dom.existingEls.clear();
        const temp = _existingEls;
        _existingEls = dom.existingEls;
        dom.existingEls = temp;
    };
}
html.map = ((signal, iterator, factory) => {
    const dom = html ``;
    dom.signal = signal;
    dom.existingEls = new Map();
    const ref = dom[DOM].ref;
    // Update map on signal change
    //
    // We have to call a separate function to prevent context hoisting from 
    // preventing garbage collection of the created `dom` component.
    //
    // By declaring an inline function, it will include the context of the above scope,
    // this is what allows us to reference `ref` despite it being outside of the
    // inline functions scope. However, this means that the inline function holds a reference
    // to the context, thus preventing GC of variables inside of said context (such as `dom`)
    // which defeats the whole point of holding a WeakRef to it via `ref`.
    //
    // Since we want to be able to hold a reference to the `ref` in the inline function but not the context
    // it resides in, we call a separate function. The separate function has its own context (hence
    // we can no longer access `dom` as per its scope) and thus circumvents this issue.
    signal.on(map_update(ref, iterator, factory), { condition: ref.hasref });
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
html.observe = function (target) {
    observer.observe(target, {
        childList: true,
        subtree: true
    });
};
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
const onDocumentLoad = function () {
    html.observe(document);
};
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDocumentLoad);
}
else {
    // Document may have loaded already if the script is declared as defer, in this case just call onload
    onDocumentLoad();
}
