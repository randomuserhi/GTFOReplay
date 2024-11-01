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
const element = Symbol("style.element");
export const Style = ((factory) => {
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
                    generatedCode += interpolation;
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
                    if (interpolation instanceof ThemeVariable) {
                        generatedCode += `${interpolation}`;
                    }
                    else {
                        generatedCode += interpolation;
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
    const exports = factory({ css: generator });
    generatedCode = generatedCode.replace(/(\r\n|\n|\r)/gm, "").replace(/ +/g, ' ').trim();
    const el = document.createElement("style");
    el.innerHTML = generatedCode;
    document.head.append(el);
    exports[element] = el;
    return exports;
});
Style.dispose = (style) => {
    const el = style[element];
    if (el === undefined)
        throw new Error("Cannot dispose a non-style object.");
    style[element] = undefined;
    el.remove();
};
