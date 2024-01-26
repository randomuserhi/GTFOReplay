declare namespace RHU {
    interface Modules {
        "components/atoms/icons": {
            arrowDown: Macro.Template<"atoms/icons/arrowDown">;
        }
    }

    namespace Macro {
        interface TemplateMap {
            "atoms/icons/arrowDown": Atoms.Icons.ArrowDown;
        }
    }
}

declare namespace Atoms.Icons {
    interface ArrowDown extends SVGElement {
    }
}

RHU.module(new Error(), "components/atoms/icons", { 
    arrowDown: "components/atoms/icons/arrowDown"
}, function({ 
    arrowDown,
}) {
    return {
        arrowDown
    };
});