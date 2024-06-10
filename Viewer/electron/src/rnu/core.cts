export interface Constructor
{
    new(...args: any[]): any;
    prototype: any;
}
export type Prototype<T extends Constructor> = T extends { new(...args: any[]): any; prototype: infer Proto; } ? Proto : never;

export interface Core
{
    readonly version: string;

    exists<T>(object: T | null | undefined): object is T;

    parseOptions<T extends {}>(template: T, options: any | null | undefined): T;

    properties(object: any, options: Core.Properties.Options, operation?: (object: any, property: PropertyKey) => void): Set<PropertyKey>;

    defineProperty(object: any, property: PropertyKey, options: PropertyDescriptor, flags?: Core.Properties.Flags): boolean;

    definePublicProperty(object: any, property: PropertyKey, options: PropertyDescriptor, flags?: Core.Properties.Flags): boolean;
    
    definePublicAccessor(object: any, property: PropertyKey, options: PropertyDescriptor, flags?: Core.Properties.Flags): boolean;

    defineProperties(object: any, properties: { [x: PropertyKey]: PropertyDescriptor }, flags?: Core.Properties.Flags): void;
    
    definePublicProperties(object: any, properties: { [x: PropertyKey]: PropertyDescriptor }, flags?: Core.Properties.Flags): void;

    definePublicAccessors(object: any, properties: { [x: PropertyKey]: PropertyDescriptor }, flags?: Core.Properties.Flags): void;

    assign<T>(target: T, source: any, options?: Core.Properties.Flags): T;
    
    deleteProperties(object: any, preserve?: {}): void;

    clone<T extends object>(object: object, prototype: T) : T;
    clone<T extends object>(object: T) : T;

    isConstructor(object: any): boolean;

    inherit(child: Function, base: Function): void;

    reflectConstruct<T extends Constructor, K extends T>(base: T, name: string, constructor: (...args: any[]) => void, argnames?: string[]): Core.ReflectConstruct<T, Prototype<K>>;
}

export declare namespace Core
{
    // Utilities used for type inference

    // Converts a single string path, `"object.property"` into the type `{ object: { property: {} } }`
    type PathToType<Key extends string, Value> =
        Key extends `${infer Parent}.${infer Child}` ? { [P in Parent]: PathToType<Child, Value> } 
                                                     : { [P in Key]: Value };

    // Converts multiple string paths, `"object.a" | "object.b"` into the type `{ object: { a: {} } & { b: {} } }` 
    //     => which is same as `{ object: { a: {}, b: {} } }`
    type PathsToType<Keys extends string, Value> = 
        { [Property in Keys]: (x: PathToType<Property, Value>) => void } extends { [k: string]: (x: infer Record) => void } ?
        { [Property in keyof Record]: Record[Property] } : never;

    // Gets the type of the value of a property inside T
    type ValueOf<T extends object, Key extends string & keyof T> = 
        T extends { [Property in Key]: infer Value } ? Value : never;
    
    // Gets the type of the array
    type ArrayOf<Array extends any[]> = 
        Array extends (infer T)[] ? T : never;
    
    // Traverses down a path by key
    //     => TraversePath<"object", "object.property" | "other.example" | "object.other.a"> => "property" | "other.a"   
    type TraversePath<Key extends string, Path> = 
        Path extends `${Key}.${infer Child}` ? `${Child}` : never;

    // Casts a type T into a type where the provided paths exist (not null | undefined)
    //     => CastExists<{ a: number | undefined, b: number | undefined, c: number | undefined }, "a" | "b">
    //         => { a: number, b: number, c: number | undefined }
    //         => NOTE(randomuserhi): The above type is what it basically bois down to, but the actual type
    //                                is represented differently. Refer to: 
    //            https://stackoverflow.com/questions/76311435/typescript-infer-values-that-are-not-null-from-string-identifier
    type CastExists<T extends object, Paths extends string> =
        { [Property in string & keyof T]: ValueOf<T, Property> & PathsToType<TraversePath<Property, Paths>, {}> };

    // Casts a type T into a type where the provided paths exist (not null | undefined)
    // and then select a subset of properties
    //     => CastExistsSubSet<{ a: number | undefined, b: number | undefined, c: number | undefined }, "a", "a" | "b">
    //         => { a: number }
    //             => "a" | "b" exist, but "a" was the only selected key to expose
    //         => NOTE(randomuserhi): The above type is what it basically bois down to, but the actual type
    //                                is represented differently. Refer to: 
    //            https://stackoverflow.com/questions/76311435/typescript-infer-values-that-are-not-null-from-string-identifier
    /**
     * @deprecated The method should not be used
     */
    type CastExistsSubSet<T extends object, Keys extends string & keyof T, Paths extends string> = 
        { [Property in Keys & keyof T]: ValueOf<T, Property> & PathsToType<TraversePath<Property, Paths>, {}> };

    // NOTE(randomuserhi): Type definitions to get around https://github.com/microsoft/TypeScript/issues/28357
    interface EventListener {
        (evt: Event): void;
        (evt: CustomEvent): void;
    }
    interface EventListenerObject {
        handleEvent(object: Event): void;
        handleEvent(object: CustomEvent): void;
    }
    type EventListenerOrEventListenerObject = EventListener | EventListenerObject;

    namespace Properties
    {
        interface Options
        {
            enumerable?: boolean;
            configurable?: boolean;
            symbols?: boolean;
            hasOwn?: boolean;
            writable?: boolean;
            get?: boolean;
            set?: boolean;
        }

        interface Flags
        {
            replace?: boolean;
            warn?: boolean;
            err?: boolean;
        }
    }

    interface ReflectConstruct<Base extends Constructor, T> extends Constructor
    {
        __reflect__(newTarget: any, args: any[]): T | undefined;
        __constructor__(...args: any[]): void;
        __args__(...args: any[]): ConstructorParameters<Base>;
    }
}

const isEventListener = function(callback: EventListenerOrEventListenerObject): callback is EventListener {
    return callback instanceof Function;
};

export const core: Core = {
    version: "1.0.0",

    exists: function<T>(obj: T | undefined | null): obj is T {
        return obj !== null && obj !== undefined;
    },

    parseOptions: function<T extends {}>(template: T, options: any | undefined | null): T {
        if (!core.exists(options)) return template;
        if (!core.exists(template)) return template;
        
        const result = template;
        Object.assign(result, options);
        return result;
    },

    properties: function(object: any, options: Core.Properties.Options = {}, operation?: (object: any, property: PropertyKey) => void): Set<PropertyKey> {
        if (!core.exists(object)) throw TypeError("Cannot get properties of 'null' or 'undefined'.");

        const opt: Core.Properties.Options = {
            enumerable: undefined,
            configurable: undefined,
            symbols: undefined,
            hasOwn: undefined,
            writable: undefined,
            get: undefined,
            set: undefined
        };
        core.parseOptions(opt, options);

        /** 
         * NOTE(randomuserhi): In the event that Set() is not supported:
         *                     Can use an object {} and then do `properties[descriptor] = undefined`,
         *                     then use `for (let key in properties)` to return an array of properties.
         */
        const properties = new Set<PropertyKey>();
        const iterate = function
        <T extends keyof ({ [x: PropertyKey]: TypedPropertyDescriptor<any> } & { [x: PropertyKey]: PropertyDescriptor })>
        (props: T[], descriptors: { [x: PropertyKey]: TypedPropertyDescriptor<any> } & { [x: PropertyKey]: PropertyDescriptor }): void {
            for (const p of props) {
                const descriptor = descriptors[p];
                let valid = true;
                
                // TODO(randomuserhi): Fairly sure these conditions are incorrect, need double checking
                if (opt.enumerable && descriptor.enumerable !== opt.enumerable) valid = false;
                if (opt.configurable && descriptor.configurable !== opt.configurable) valid = false;
                if (opt.writable && descriptor.writable !== opt.writable) valid = false;
                if (opt.get === false && descriptor.get) valid = false;
                else if (opt.get === true && !descriptor.get) valid = false;
                if (opt.set === false && descriptor.set) valid = false;
                else if (opt.set === true && !descriptor.set) valid = false;

                if (valid) {
                    if (!properties.has(p)) {
                        if (core.exists(operation)) operation(curr, p);
                        properties.add(p);
                    }
                }
            }
        };
        
        /**
         * NOTE(randomuserhi): Reflect.ownKeys() gets both symbols and non-symbols so it may be worth using that
         *                     when symbols is undefined
         */
        let curr = object;
        do {
            const descriptors = Object.getOwnPropertyDescriptors(curr);
            
            if (!core.exists(opt.symbols) || opt.symbols === false) {
                const props = Object.getOwnPropertyNames(curr);
                iterate(props, descriptors);
            }
            
            if (!core.exists(opt.symbols) || opt.symbols === true) {
                const props = Object.getOwnPropertySymbols(curr);
                iterate(props, descriptors);
            }
        } while((curr = Object.getPrototypeOf(curr)) && !opt.hasOwn);
        
        return properties;
    },

    defineProperty: function(object: any, property: PropertyKey, options: PropertyDescriptor, flags?: Core.Properties.Flags): boolean {
        const opt: Core.Properties.Flags = {
            replace: true,
            warn: false,
            err: false
        };
        core.parseOptions(opt, flags);

        if (opt.replace || !core.properties(object, { hasOwn: true }).has(property)) {
            delete object[property];  // NOTE(randomuserhi): Should throw an error in Strict Mode when trying to delete a property of 'configurable: false'.
            //                     Also will not cause issues with inherited properties as `delete` only removes own properties.    
            Object.defineProperty(object, property, options);
            return true;
        }
        if (opt.warn) console.warn(`Failed to define property '${property.toString()}', it already exists. Try 'replace: true'`);
        if (opt.err) console.error(`Failed to define property '${property.toString()}', it already exists. Try 'replace: true'`);
        return false;
    },
    definePublicProperty: function(object: any, property: PropertyKey, options: PropertyDescriptor, flags?: Core.Properties.Flags) {
        const opt: PropertyDescriptor = {
            writable: true,
            enumerable: true
        };
        return core.defineProperty(object, property, Object.assign(opt, options), flags);
    },
    definePublicAccessor: function(object: any, property: PropertyKey, options: PropertyDescriptor, flags?: Core.Properties.Flags) {
        const opt: PropertyDescriptor = {
            configurable: true,
            enumerable: true
        };
        return core.defineProperty(object, property, Object.assign(opt, options), flags);
    },

    defineProperties: function(object, properties: { [x: PropertyKey]: PropertyDescriptor }, flags?: Core.Properties.Flags) {
        for (const key of core.properties(properties, { hasOwn: true }).keys()) {
            if (Object.hasOwnProperty.call(properties, key)) {
                core.defineProperty(object, key, properties[key], flags);
            }
        }
    },
    definePublicProperties: function(object, properties: { [x: PropertyKey]: PropertyDescriptor }, flags?: Core.Properties.Flags) {
        interface opt
        {
            new(): PropertyDescriptor,
            prototype: PropertyDescriptor
        }
        const opt = function(this: PropertyDescriptor) {
            this.configurable = true;
            this.writable = true;
            this.enumerable = true;
        } as Function as opt;

        for (const key of core.properties(properties, { hasOwn: true }).keys()) {
            if (Object.hasOwnProperty.call(properties, key)) {
                const o = Object.assign(new opt(), properties[key]);
                core.defineProperty(object, key, o, flags);
            }
        }
    },
    definePublicAccessors: function(object, properties: { [x: PropertyKey]: PropertyDescriptor }, flags?: Core.Properties.Flags) {
        interface opt
        {
            new(): PropertyDescriptor,
            prototype: PropertyDescriptor
        }
        const opt = function(this: PropertyDescriptor) {
            this.configurable = true;
            this.enumerable = true;
        } as Function as opt;

        for (const key of core.properties(properties, { hasOwn: true }).keys()) {
            if (Object.hasOwnProperty.call(properties, key)) {
                const o = Object.assign(new opt(), properties[key]);
                core.defineProperty(object, key, o, flags);
            }
        }
    },

    assign: function<T>(target: T, source: any, options?: Core.Properties.Flags): T {
        if (target === source) return target;
        core.defineProperties(target, Object.getOwnPropertyDescriptors(source), options);
        return target;
    },

    deleteProperties: function(object: any, preserve?: {}): void {
        if (object === preserve) return;

        /**
         * Since preserve uses hasOwnProperty, inherited properties of preserve are not preserved:
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties
         *
         * Since traversing and deleting a prototype can effect other objects, we do not recursively delete
         * through the prototype.
         *
         * TODO(randomuserhi): Option to skip properties that are non-configurable (aka cannot be deleted).
         *                     Right now we just throw an error.
         */
        core.properties(object, { hasOwn: true }, (obj: any, prop: PropertyKey) => {
            if (!core.exists(preserve) || !core.properties(preserve, { hasOwn: true }).has(prop))
                delete obj[prop];
        });
    },

    clone: function<T extends object>(object: any, prototype?: T) : T {
        /** 
         * NOTE(randomuserhi): Performs a shallow clone => references inside the cloned object will be the same
         *                     as original.
         */
        if (core.exists(prototype)) return core.assign(Object.create(prototype), object);
        else return core.assign(Object.create(Object.getPrototypeOf(object)), object);
    },

    isConstructor: function(object: any): boolean {
        try {
            Reflect.construct(String, [], object);
        } catch (e) {
            return false;
        }
        return true;
    },

    inherit: function(child: Function, base: Function): void {
        // NOTE(randomuserhi): Cause we are using typescript, we don't need this check.
        //if (!RHU.isConstructor(child) || !RHU.isConstructor(base)) 
        //    throw new TypeError(`'child' and 'base' must be object constructors.`); 

        Object.setPrototypeOf(child.prototype, base.prototype); // Inherit instance properties
        Object.setPrototypeOf(child, base); // Inherit static properties
    },

    reflectConstruct: function<T extends Constructor, K extends T>(base: T, name: string, constructor: (...args: any[]) => void, argnames?: string[]): Core.ReflectConstruct<T, Prototype<K>> {
        // NOTE(randomuserhi): Cause we are using typescript, we don't need this check.
        //if (!RHU.isConstructor(base)) throw new TypeError(`'constructor' and 'base' must be object constructors.`);

        // Get arguments from constructor or from provided argnames
        let args = argnames;
        if (!core.exists(args)) {
            args = ["...args"];

            const STRIP_COMMENTS = /((\/\/.*$)|(\/\*.*\*\/))/mg;
            const funcString = constructor.toString().replace(STRIP_COMMENTS, "");
            if (funcString.indexOf("function") === 0) {
                const s = funcString.substring("function".length).trimStart();
                args = s.substring(s.indexOf("(") + 1, s.indexOf(")"))
                    .split(",")
                    .map((a) => {
                        let clean = a.trim();
                        // Remove optional assignment in parameters
                        clean = clean.split(/[ =]/)[0];
                        return clean;
                    })
                    .filter((c) => c !== "");
            }
        }

        // Create function definition with provided signature
        let definition: (Core.ReflectConstruct<T, Prototype<K>> | undefined);

        const argstr = args.join(",");
        if (!core.exists(name))
            name = constructor.name;
        name.replace(/[ \t\r\n]/g, "");
        if (name === "") name = "__ReflectConstruct__";
        const parts = name.split(".").filter(c => c !== "");
        let evalStr = "{ let ";
        for (let i = 0; i < parts.length - 1; ++i) {
            const part = parts[i];
            evalStr += `${part} = {}; ${part}.`;
        }
        evalStr += `${parts[parts.length - 1]} = function(${argstr}) { return definition.__reflect__.call(this, new.target, [${argstr}]); }; definition = ${parts.join(".")} }`;
        eval(evalStr);

        if (!core.exists(definition)) {
            console.warn("eval() call failed to create reflect constructor. Using fallback...");
            definition = function(this: Core.ReflectConstruct<T, Prototype<K>>, ...args: any[]): unknown {
                return definition!.__reflect__.call(this, new.target, args);
            } as Function as Core.ReflectConstruct<T, Prototype<K>>; // NOTE(randomuserhi): dodgy cast, but needs to be done so we can initially set the definition
        }

        // NOTE(randomuserhi): Careful with naming conflicts since JS may add __constructor__ as a standard function property
        definition.__constructor__ = constructor;
        definition.__args__ = function(): any {
            return [];
        };
        definition.__reflect__ = function(newTarget: any, args: any[] = []) : Prototype<K> | undefined {
            if (core.exists(newTarget)) {
                const obj = Reflect.construct(base, definition!.__args__(...args), definition!);
                definition!.__constructor__.call(obj, ...args);
                return obj;
            } else definition!.__constructor__.call(this, ...args);
        };

        return definition; 
    }
};