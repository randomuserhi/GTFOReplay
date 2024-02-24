declare namespace RHU {
    interface Modules {
        "components/atoms/icons/cross": Macro.Template<"atoms/icons/cross">;
    }

    namespace Macro {
        interface TemplateMap {
            "atoms/icons/cross": Atoms.Icons.cross;
        }
    }
}

declare namespace Atoms.Icons {
    interface cross extends SVGElement {
    }
}

// TODO(randomuserhi): Update once RHU svg parse bug is fixed.

RHU.module(new Error(), "components/atoms/icons/cross", { 
    Macro: "rhu/macro"
}, function({ Macro }) {
    const icon = Macro((() => {
        const icon = function(this: Atoms.Icons.cross) {
        } as RHU.Macro.Constructor<Atoms.Icons.cross>;

        return icon;
    })(), "atoms/icons/cross", //html
    `
        <polygon fill="currentColor" fill-rule="evenodd" points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"></polygon>
        `, {
        element: //html
            `<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12"></svg>`
    });

    return icon;
});