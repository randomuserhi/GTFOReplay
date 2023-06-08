interface RHU
{

    Macro?: RHU.Macro;
}

declare namespace RHU
{
    interface Macro
    {
        
        (constructor: Function, type: string, source: string, options: RHU.Macro.Options): void;
        
        parseDomString(str: string): DocumentFragment;
        
        parse(element: Element, type?: string | undefined | null, force?: boolean): void;

        observe(target: Node): void;
    }

    namespace Macro
    {
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
    
    createMacro<T extends keyof RHU.Macro.TemplateMap>(type: T): RHU.Macro.TemplateMap[T];
    
    Macro(type: string, attributes: Record<string, string>): string;
}

interface Element
{
    rhuMacro: string;
}