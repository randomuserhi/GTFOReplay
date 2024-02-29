declare namespace RHU {
    interface Modules {
        "components/atoms/icons/square": Macro.Template<"atoms/icons/square">;
    }

    namespace Macro {
        interface TemplateMap {
            "atoms/icons/square": Atoms.Icons.square;
        }
    }
}

declare namespace Atoms.Icons {
    interface square extends SVGElement {
    }
}

// TODO(randomuserhi): Update once RHU svg parse bug is fixed.

RHU.module(new Error(), "components/atoms/icons/square", { 
    Macro: "rhu/macro"
}, function({ Macro }) {
    const icon = Macro((() => {
        const icon = function(this: Atoms.Icons.square) {
        } as RHU.Macro.Constructor<Atoms.Icons.square>;

        return icon;
    })(), "atoms/icons/square", //html
    `
        <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor"></rect>
        `, {
        element: //html
            `<svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12"></svg>`
    });

    return icon;
});