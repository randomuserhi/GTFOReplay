declare namespace RHU {
    interface Modules {
        "components/atoms/icons/arrowLeft": Macro.Template<"atoms/icons/arrowLeft">;
    }

    namespace Macro {
        interface TemplateMap {
            "atoms/icons/arrowLeft": Atoms.Icons.ArrowLeft;
        }
    }
}

declare namespace Atoms.Icons {
    interface ArrowLeft extends SVGElement {
    }
}

// TODO(randomuserhi): Update once RHU svg parse bug is fixed.

RHU.module(new Error(), "components/atoms/icons/arrowLeft", { 
    Macro: "rhu/macro"
}, function({ Macro }) {
    const icon = Macro((() => {
        const icon = function(this: Atoms.Icons.ArrowLeft) {
        } as RHU.Macro.Constructor<Atoms.Icons.ArrowLeft>;

        return icon
    })(), "atoms/icons/arrowLeft", //html
        `
        <path fill-rule="evenodd" clip-rule="evenodd" d="M 4.4697 11.4697 C 4.1768 11.7626 4.1768 12.2374 4.4697 12.5303 L 9.4697 17.5303 C 9.7626 17.8232 10.2374 17.8232 10.5303 17.5303 C 10.8232 17.2374 10.8232 16.7626 10.5303 16.4697 L 5.5303 11.4697 C 5.2374 11.1768 4.7626 11.1768 4.4697 11.4697 Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M 19.75 12 C 19.75 11.5858 19.4142 11.25 19 11.25 H 5 C 4.5858 11.25 4.25 11.5858 4.25 12 C 4.25 12.4142 4.5858 12.75 5 12.75 H 19 C 19.4142 12.75 19.75 12.4142 19.75 12 Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M 10.5303 6.4697 C 10.2374 6.1768 9.7626 6.1768 9.4697 6.4697 L 4.4697 11.4697 C 4.1768 11.7626 4.1768 12.2374 4.4697 12.5303 C 4.7626 12.8232 5.2374 12.8232 5.5303 12.5303 L 10.5303 7.5303 C 10.8232 7.2374 10.8232 6.7626 10.5303 6.4697 Z" fill="currentColor"/>
        `, {
            element: //html
            `<svg viewBox="0 0 24 24" fill="currentColor"></svg>`
        });

    return icon;
});