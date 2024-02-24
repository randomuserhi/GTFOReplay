declare namespace RHU {
    interface Modules {
        "components/atoms/icons/line": Macro.Template<"atoms/icons/line">;
    }

    namespace Macro {
        interface TemplateMap {
            "atoms/icons/line": Atoms.Icons.line;
        }
    }
}

declare namespace Atoms.Icons {
    interface line extends SVGElement {
    }
}

// TODO(randomuserhi): Update once RHU svg parse bug is fixed.

RHU.module(new Error(), "components/atoms/icons/line", { 
    Macro: "rhu/macro"
}, function({ Macro }) {
    const icon = Macro((() => {
        const icon = function(this: Atoms.Icons.line) {
        } as RHU.Macro.Constructor<Atoms.Icons.line>;

        return icon;
    })(), "atoms/icons/line", //html
    `
        <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
        `, {
        element: //html
            `<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12"></svg>`
    });

    return icon;
});