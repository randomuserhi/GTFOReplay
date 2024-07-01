import { ThemeVariable } from "./theme.js";
export type ClassName<T extends {} = {}> = {
    [Symbol.toPrimitive]: () => string;
    name: string;
} & T;
interface ClassNameConstructor {
    new <T extends {} = {}>(name?: string): ClassName<T>;
    prototype: ClassName;
}
export declare const ClassName: ClassNameConstructor;
export declare const css: (style: StyleDeclaration) => string;
interface Generator {
    (first: TemplateStringsArray, ...interpolations: (string | ClassName | ThemeVariable)[]): void;
    class<T extends {} = {}>(first: TemplateStringsArray, ...interpolations: (string | ThemeVariable)[]): ClassName & T;
}
interface Factory {
    style: Generator;
}
type StyleDeclaration = {
    [Property in CSSProperty]?: Property extends keyof CSSPropertiesMap ? CSSPropertiesMap[Property] : CSSValue;
};
type BasicColor = "black" | "silver" | "gray" | "white" | "maroon" | "red" | "purple" | "fuchsia" | "green" | "lime" | "olive" | "yellow" | "navy" | "blue" | "teal" | "aqua";
type ExtendedColor = "aliceblue" | "antiquewhite";
type Color = BasicColor | ExtendedColor;
type CSSString = string & {};
type CSSKey = CSSString;
type CSSFlatValue = CSSString | number;
type CSSValue = CSSFlatValue | {};
declare namespace CSSProperties {
    interface border {
        "border-radius"?: CSSFlatValue;
        borderRadius?: CSSFlatValue;
    }
    type All = border;
}
type CSSPropertiesMap = CSSProperties.All & {
    display?: "none" | "block" | "flex" | "grid" | CSSString;
    color?: Color | CSSString;
    "background-color"?: Color | CSSString;
    backgroundColor?: Color | CSSString;
    "border"?: CSSString | CSSProperties.border;
};
type CSSProperty = CSSKey | keyof CSSPropertiesMap;
export declare function Style<T>(factory: (worker: Factory) => T): T;
export {};
