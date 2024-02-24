declare namespace RHU {
    interface Modules {
        "components/atoms/icons": {
            cross: Macro.Template<"atoms/icons/cross">;
            square: Macro.Template<"atoms/icons/square">;
            line: Macro.Template<"atoms/icons/line">;
        }
    }
}

declare namespace Atoms.Icons {
    interface ArrowDown extends SVGElement {
    }
}

RHU.module(new Error(), "components/atoms/icons", { 
    cross: "components/atoms/icons/cross",
    square: "components/atoms/icons/square",
    line: "components/atoms/icons/line",
}, function(icons) {
    return icons;
});