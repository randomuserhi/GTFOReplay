RHU.import(RHU.module({ trace: new Error(),
    name: "Main", hard: ["RHU.Macro", "RHU.Bezier"],
    callback: function () {
        let { RHU } = window.RHU.require(window, this);
        let appmount = function () {
        };
        RHU.Macro(appmount, "appmount", `
                <rhu-macro style="position: relative; width: 100%; height: 100%" rhu-type="replay"></rhu-macro>
            `, {
            element: `<div style="position: relative; width: 100%; height: 100%"></div>`
        });
    }
}));
