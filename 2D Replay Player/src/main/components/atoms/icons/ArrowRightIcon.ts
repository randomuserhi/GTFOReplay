declare namespace RHU {
    interface Modules {
        "components/atoms/icons/arrowRight": Macro.Template<"atoms/icons/arrowRight">;
    }

    namespace Macro {
        interface TemplateMap {
            "atoms/icons/arrowRight": Atoms.Icons.ArrowRight;
        }
    }
}

declare namespace Atoms.Icons {
    interface ArrowRight extends SVGElement {
    }
}

// TODO(randomuserhi): Update once RHU svg parse bug is fixed.

RHU.module(new Error(), "components/atoms/icons/arrowRight", { 
    Macro: "rhu/macro"
}, function({ Macro }) {
    const icon = Macro((() => {
        const icon = function(this: Atoms.Icons.ArrowRight) {
        } as RHU.Macro.Constructor<Atoms.Icons.ArrowRight>;

        return icon
    })(), "atoms/icons/arrowRight", //html
        `
        <path fill-rule="evenodd" clip-rule="evenodd" d="M19.5303 11.4697C19.8232 11.7626 19.8232 12.2374 19.5303 12.5303L14.5303 17.5303C14.2374 17.8232 13.7626 17.8232 13.4697 17.5303C13.1768 17.2374 13.1768 16.7626 13.4697 16.4697L18.4697 11.4697C18.7626 11.1768 19.2374 11.1768 19.5303 11.4697Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.25 12C4.25 11.5858 4.58579 11.25 5 11.25H19C19.4142 11.25 19.75 11.5858 19.75 12C19.75 12.4142 19.4142 12.75 19 12.75H5C4.58579 12.75 4.25 12.4142 4.25 12Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4697 6.46967C13.7626 6.17678 14.2374 6.17678 14.5303 6.46967L19.5303 11.4697C19.8232 11.7626 19.8232 12.2374 19.5303 12.5303C19.2374 12.8232 18.7626 12.8232 18.4697 12.5303L13.4697 7.53033C13.1768 7.23744 13.1768 6.76256 13.4697 6.46967Z" fill="currentColor"/>
        `, {
            element: //html
            `<svg viewBox="0 0 24 24" fill="currentColor"></svg>`
        });

    return icon;
});