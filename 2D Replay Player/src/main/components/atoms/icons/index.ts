declare namespace RHU {
    interface Modules {
        "components/atoms/icons": {
            arrowDown: Macro.Template<"atoms/icons/arrowDown">;
            arrowRight: Macro.Template<"atoms/icons/arrowRight">;
            arrowLeft: Macro.Template<"atoms/icons/arrowLeft">;
        }
    }
}

RHU.module(new Error(), "components/atoms/icons", { 
    arrowDown: "components/atoms/icons/arrowDown",
    arrowLeft: "components/atoms/icons/arrowLeft",
    arrowRight: "components/atoms/icons/arrowRight"
}, function(icons) {
    return icons;
});