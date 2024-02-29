declare namespace RHU {
    interface Modules {
        "components/organisms/winNav": Macro.Template<"organisms/winNav">;
    }

    namespace Macro {
        interface TemplateMap {
            "organisms/winNav": Organisms.winNav;
        }
    }
}

declare namespace Organisms {
    interface winNav extends HTMLDivElement {
        close: HTMLButtonElement;
        max: HTMLButtonElement;
        min: HTMLButtonElement;
    }
}

RHU.module(new Error(), "components/organisms/winNav", { 
    Macro: "rhu/macro", style: "components/organisms/winNav/style",
    icons: "components/atoms/icons"
}, function({ 
    Macro, style,
    icons
}) {
    const winNav = Macro((() => {
        const winNav = function(this: Organisms.winNav) {
            this.close.onclick = () => {
                window.api.closeWindow();
            };
            this.max.onclick = () => {
                window.api.maximizeWindow();
            };
            this.min.onclick = () => {
                window.api.minimizeWindow();
            };
        } as RHU.Macro.Constructor<Organisms.winNav>;

        return winNav;
    })(), "organisms/winNav", //html
    `
        <div rhu-id="close" class="${style.button}" tabindex="-1" role="button" aria-label="Close">
            ${icons.cross}
        </div>
        <div rhu-id="max" class="${style.button}" tabindex="-1" role="button" aria-label="Maximize">
            ${icons.square}
        </div>
        <div rhu-id="min" class="${style.button}" tabindex="-1" role="button" aria-label="Minimize">
            ${icons.line}
        </div>
        <div class="${style.text}">
            GTFO Replay Viewer
        </div>
        `, {
        element: //html
            `<nav class="${style.wrapper}"></nav>`
    });

    return winNav;
});