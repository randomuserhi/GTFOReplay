// TODO(randomuserhi): comments and documentation
//                     especially important here since a lot of types here are defined with strict intent
//                     and are quite complex
declare namespace RHU
{
    interface Modules
    {
        "rhu/style": RHU.Style;
        "rhu/style/types": {
            cn: RHU.Style.ClassNameConstructor;
        };

        "rhu/theme": RHU.Theme;
        "rhu/theme/types": {
            ThemeVariable: RHU.Theme.ThemeVariableConstructor;
        };
    }

    interface Theme
    {
        <T extends {} = {}>(factory: (worker: Theme.Factory) => T): Style.ClassName<T>;
    }

    namespace Theme
    {
        type ThemeVariable<T extends {} = {}> = {
            [Symbol.toPrimitive]: () => string;
        } & T;
        interface ThemeVariableConstructor
        {
            new<T extends{} = {}>(name?: string): ThemeVariable<T>;
            prototype: ThemeVariable;
        }

        interface Generator
        {
            (first: TemplateStringsArray, ...interpolations: (string | ThemeVariable)[]): ThemeVariable;
        }

        interface Factory 
        {
            theme: Generator;
        }
    }

    interface Style
    {
        <T>(factory: (worker: Style.Factory) => T): T;
        cn: Style.ClassNameConstructor
    }

    namespace Style
    {
        type ClassName<T extends {} = {}> = {
            [Symbol.toPrimitive]: () => string;
        } & T;
        interface ClassNameConstructor
        {
            new<T extends {} = {}>(name?: string): ClassName<T>;
            prototype: ClassName;
        }

        interface Generator
        {
            (first: TemplateStringsArray, ...interpolations: (string | ClassName | Theme.ThemeVariable)[]): void;
            class<T extends {} = {}>(first: TemplateStringsArray, ...interpolations: (string | Theme.ThemeVariable)[]): ClassName & T;
        }

        interface Factory 
        {
            style: Generator;
            css: (style: StyleDeclaration) => string;
            cn: <T extends {} = {}>(name?: string) => ClassName & T;
        }

        type StyleDeclaration = {
            [Property in Style.CSSProperty]?: Property extends keyof Style.CSSPropertiesMap ? Style.CSSPropertiesMap[Property] : CSSValue;
        };

        // CSS types

        type HTMLElement = keyof HTMLElementTagNameMap;

        type BasicColor = 
            "black" |
            "silver" |
            "gray" |
            "white" |
            "maroon" |
            "red" |
            "purple" |
            "fuchsia" |
            "green" |
            "lime" |
            "olive" |
            "yellow" |
            "navy" |
            "blue" |
            "teal" |
            "aqua";

        // TODO(randomuserhi): Fill out from https://www.w3.org/wiki/CSS/Properties/color/keywords
        type ExtendedColor = 
            "aliceblue" |
            "antiquewhite";

        type Color = BasicColor | ExtendedColor;

        // https://stackoverflow.com/questions/74467392/autocomplete-in-typescript-of-literal-type-and-string
        type CSSString = string & {};

        type CSSKey = CSSString;
        type CSSFlatValue = CSSString | number;
        type CSSValue = CSSFlatValue | {};

        // TODO(randomuserhi): Fill out
        namespace CSSProperties
        {
            interface border
            {
                "border-radius"?: CSSFlatValue;
                borderRadius?: CSSFlatValue;
            }

            type All = border;
        }

        type CSSPropertiesMap = CSSProperties.All &
        {
            display?: "none" | "block" | "flex" | "grid" | CSSString;

            color?: Color | CSSString;

            "background-color"?: Color | CSSString;
            backgroundColor?: Color | CSSString;

            "border"?: CSSString | CSSProperties.border;
        }

        type CSSProperty = CSSKey | keyof CSSPropertiesMap;    
    }
}