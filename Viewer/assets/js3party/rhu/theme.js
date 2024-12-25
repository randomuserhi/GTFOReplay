import { ClassName } from "./style.js";
const element = Symbol("theme.element");
let id = 69;
export const ThemeVariable = function (name) {
    if (name !== undefined) {
        this.name = name;
    }
    else {
        this.name = `--rhu-${++id}`;
    }
};
ThemeVariable.prototype[Symbol.toPrimitive] = function () {
    return `var(${this.name})`;
};
export const Theme = (factory) => {
    const cn = new ClassName();
    let generatedCode = `.${cn} {`;
    const generator = function (first, ...interpolations) {
        const themeVar = new ThemeVariable();
        generatedCode += `${themeVar.name}:${first[0]}`;
        for (let i = 0; i < interpolations.length; ++i) {
            const interpolation = interpolations[i];
            generatedCode += interpolation;
            generatedCode += first[i + 1];
        }
        generatedCode += `;`;
        return themeVar;
    };
    const exports = factory({ theme: generator });
    generatedCode += "}";
    generatedCode = generatedCode.replace(/(\r\n|\n|\r)/gm, "").replace(/ +/g, ' ').trim();
    const el = document.createElement("style");
    el.innerHTML = generatedCode;
    document.head.append(el);
    exports[element] = el;
    Object.assign(cn, exports);
    return cn;
};
Theme.dispose = (theme) => {
    const el = theme[element];
    if (el === undefined)
        throw new Error("Cannot dispose a non-style object.");
    theme[element] = undefined;
    el.remove();
};
export function tvar(themeVar) {
    return themeVar.name;
}
