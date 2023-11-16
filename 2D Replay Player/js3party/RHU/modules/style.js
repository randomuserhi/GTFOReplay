(function () {
    const RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    const symbols = {
        name: Symbol("style/theme name"),
    };
    RHU.module(new Error(), "rhu/theme/types", {}, function () {
        let id = 69;
        const ThemeVariable = function (name) {
            if (RHU.exists(name)) {
                this[symbols.name] = name;
            }
            else {
                this[symbols.name] = `--rhu-${++id}`;
            }
        };
        ThemeVariable.prototype[Symbol.toPrimitive] = function () {
            return `var(${this[symbols.name]})`;
        };
        return {
            ThemeVariable,
        };
    });
    RHU.module(new Error(), "rhu/theme", { types: "rhu/theme/types", Style: "rhu/style/types" }, function ({ types: { ThemeVariable }, Style }) {
        let Theme = function (factory) {
            const cn = new Style.cn();
            let generatedCode = `.${cn} {`;
            let generator = function (first, ...interpolations) {
                const themeVar = new ThemeVariable();
                generatedCode += `${themeVar[symbols.name]}:${first[0]}`;
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
            let el = document.createElement("style");
            el.innerHTML = generatedCode;
            document.head.append(el);
            Object.assign(cn, exports);
            return cn;
        };
        return Theme;
    });
    RHU.module(new Error(), "rhu/style/types", {}, function () {
        let id = 69;
        const cn = function (name) {
            if (RHU.exists(name)) {
                this[symbols.name] = name;
            }
            else {
                this[symbols.name] = `rhu-${++id}`;
            }
        };
        cn.prototype[Symbol.toPrimitive] = function () {
            return this[symbols.name];
        };
        return {
            cn,
        };
    });
    RHU.module(new Error(), "rhu/style", { style: "rhu/style/types", Theme: "rhu/theme/types" }, function ({ style: { cn }, Theme }) {
        let interpret = function (value) {
            if (typeof value === "number") {
                return `${value}px`;
            }
            return value;
        };
        let css = function (style) {
            let result = "";
            for (const [key, value] of Object.entries(style)) {
                let prop = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
                if (typeof value === "string" || value instanceof String) {
                    result += `${prop}:${value};`;
                }
                else if (typeof value === "number") {
                    result += `${prop}:${value}px;`;
                }
                else {
                    switch (prop) {
                        case "border":
                            const parse = value;
                            const borderRadius = interpret(parse["border-radius"] || parse.borderRadius);
                            if (RHU.exists(borderRadius))
                                result += `border-radius: ${borderRadius}; `;
                            break;
                    }
                }
            }
            return result;
        };
        let Style = function (factory) {
            let generatedCode = "";
            let generator = function (first, ...interpolations) {
                generatedCode += first[0];
                for (let i = 0; i < interpolations.length; ++i) {
                    const interpolation = interpolations[i];
                    if (typeof interpolation === "object") {
                        if (interpolation instanceof cn) {
                            generatedCode += `.${interpolation}`;
                        }
                        else if (interpolation instanceof Theme.ThemeVariable) {
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
                const classname = new cn();
                if (first.length > 1 || first[0] !== '' || interpolations.length !== 0) {
                    generatedCode += `.${classname} {${first[0]}`;
                    for (let i = 0; i < interpolations.length; ++i) {
                        const interpolation = interpolations[i];
                        if (typeof interpolation === "object") {
                            if (interpolation instanceof cn) {
                                generatedCode += interpolation;
                            }
                            else if (interpolation instanceof Theme.ThemeVariable) {
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
            const exports = factory({ style: generator, css, cn: (name) => new cn(name) });
            generatedCode = generatedCode.replace(/(\r\n|\n|\r)/gm, "").replace(/ +/g, ' ').trim();
            let el = document.createElement("style");
            el.innerHTML = generatedCode;
            document.head.append(el);
            return exports;
        };
        Style.cn = cn;
        return Style;
    });
})();
