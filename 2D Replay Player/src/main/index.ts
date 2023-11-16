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
    replayPlayer: "components/molecules/replayPlayer"
}, function({ 
    Macro, Style, theme,
    replayPlayer
}) {
    const style = Style(({ style }) => {
        const wrapper = style.class`
        width: 100%;
        height: 100%;
        `;
        return {
            wrapper,
        };
    });

    Macro((() => {
        const appmount = function(this: App) {
            this.classList.toggle(`${theme}`, true);
            this.classList.toggle(`${style.wrapper}`, true);
        } as RHU.Macro.Constructor<App>;

        return appmount
    })(), "App", //html
        `
        ${replayPlayer}
        `, {
            element: //html
            `<div class="${theme} ${style.wrapper}"></div>`
        });
});