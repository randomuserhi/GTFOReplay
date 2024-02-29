import { exists } from "./rhu.js";
import { ClassName } from "./style.js";
let id = 69;
export const ThemeVariable = function (name) {
    if (exists(name)) {
        this.name = name;
    }
    else {
        this.name = `--rhu-${++id}`;
    }
};
ThemeVariable.prototype[Symbol.toPrimitive] = function () {
    return `var(${this.name})`;
};
export function Theme(factory) {
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
    Object.assign(cn, exports);
    return cn;
}
