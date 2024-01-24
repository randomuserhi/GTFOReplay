interface GlobalEventHandlersEventMap {
    "mount": CustomEvent<{}>;
}

declare namespace RHU
{
    interface Modules
    {
        "rhu/macro": RHU.Macro;
    }

    interface Macro
    {
        
        <T extends RHU.Macro.Templates>(constructor: Function, type: T, source: string, options: RHU.Macro.Options): Macro.Template<T>;
        
        parseDomString(str: string): DocumentFragment;

        anon<T extends {} = {}>(source: string): [T, DocumentFragment];
        
        parse(element: Element, type?: string & {} | RHU.Macro.Templates | undefined | null, force?: boolean): void;

        observe(target: Node): void;
    }

    namespace Macro
    {
        interface Template<T extends RHU.Macro.Templates> {
            (first: TemplateStringsArray, ...interpolations: (string | { [Symbol.toPrimitive]: (...args: any[]) => string })[]): string;
            type: T;
            toString: () => T;
            [Symbol.toPrimitive]: () => string;
        }

        interface Options
        {

            element?: string;

            floating?: boolean;

            strict?: boolean;

            encapsulate?: PropertyKey;
            
            content?: PropertyKey;
        }

        interface Constructor<T extends Element = Element>
        {
            (this: T): void;
            prototype: T;
        }

        type Templates = keyof TemplateMap;
        interface TemplateMap
        {

        }
    }
}

type Macro = HTMLElement | {};

interface Node
{
    macro: Macro;
}

interface Document
{
    
    createMacro<T extends string & keyof RHU.Macro.TemplateMap>(type: T | RHU.Macro.Template<T>): RHU.Macro.TemplateMap[T];
    
    Macro<T extends string & keyof RHU.Macro.TemplateMap>(type: T | RHU.Macro.Template<T>, attributes: Record<string, string>): string;
}

interface Element
{
    rhuMacro: string;
}