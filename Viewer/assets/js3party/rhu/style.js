import { exists } from "./rhu.js";
import { ThemeVariable } from "./theme.js";
let id = 69;
export const ClassName = function (name) {
    if (exists(name)) {
        this.name = name;
    }
    else {
        this.name = `rhu-${++id}`;
    }
};
ClassName.prototype[Symbol.toPrimitive] = function () {
    return this.name;
};
const interpret = function (value) {
    if (typeof value === "number") {
        return `${value}px`;
    }
    return value;
};
export const css = function (style) {
    let result = "";
    for (const [key, value] of Object.entries(style)) {
        const prop = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        if (typeof value === "string" || value instanceof String) {
            result += `${prop}:${value};`;
        }
        else if (typeof value === "number") {
            result += `${prop}:${value}px;`;
        }
        else {
            switch (prop) {
                case "border": {
                    const parse = value;
                    const borderRadius = interpret(parse["border-radius"] || parse.borderRadius);
                    if (exists(borderRadius))
                        result += `border-radius: ${borderRadius}; `;
                    break;
                }
            }
        }
    }
    return result;
};
export function Style(factory) {
    let generatedCode = "";
    const generator = function (first, ...interpolations) {
        generatedCode += first[0];
        for (let i = 0; i < interpolations.length; ++i) {
            const interpolation = interpolations[i];
            if (typeof interpolation === "object") {
                if (interpolation instanceof ClassName) {
                    generatedCode += `.${interpolation}`;
                }
                else if (interpolation instanceof ThemeVariable) {
                    generatedCode += `${interpolation}`;
                }
                else {
                    generatedCode += css(interpolation);
                }
            }
            else {
                generatedCode += interpolation;
            }
            generatedCode += first[i + 1];
        }
    };
    generator.class = function (first, ...interpolations) {
        const classname = new ClassName();
        if (first.length > 1 || first[0] !== '' || interpolations.length !== 0) {
            generatedCode += `.${classname} {${first[0]}`;
            for (let i = 0; i < interpolations.length; ++i) {
                const interpolation = interpolations[i];
                if (typeof interpolation === "object") {
                    if (interpolation instanceof ClassName) {
                        generatedCode += interpolation;
                    }
                    else if (interpolation instanceof ThemeVariable) {
                        generatedCode += `${interpolation}`;
                    }
                    else {
                        generatedCode += css(interpolation);
                    }
                }
                else {
                    generatedCode += interpolation;
                }
                generatedCode += first[i + 1];
            }
            generatedCode += "}";
        }
        return classname;
    };
    const exports = factory({ style: generator });
    generatedCode = generatedCode.replace(/(\r\n|\n|\r)/gm, "").replace(/ +/g, ' ').trim();
    const el = document.createElement("style");
    el.innerHTML = generatedCode;
    document.head.append(el);
    return exports;
}
