declare namespace RHU {
    interface Modules {
        "main": void;
    }

    namespace Macro {
        interface TemplateMap {
            "App": App;
        }
    }
}

interface App extends HTMLDivElement {
}

RHU.module(new Error(), "main", { 
    Macro: "rhu/macro", Style: "rhu/style", 
    theme: "main/theme",
}, function({ 
    Macro, Style, theme,
}) {
    const style = Style(({ style }) => {
        return {
        };
    });

    Macro((() => {
        const appmount = function(this: App) {
            this.classList.toggle(`${theme}`, true);
        } as RHU.Macro.Constructor<App>;

        return appmount
    })(), "App", //html
        `
        `, {
            element: //html
            `<div class="${theme}"></div>`
        });
});