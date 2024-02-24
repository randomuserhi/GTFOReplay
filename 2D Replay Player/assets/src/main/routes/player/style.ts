declare namespace RHU {
    interface Modules {
        "routes/player/style": {
            wrapper: Style.ClassName;
            body: Style.ClassName;
            canvas: Style.ClassName;
        };
    }
}

RHU.module(new Error(), "routes/player/style", { 
    Style: "rhu/style", theme: "main/theme" 
}, function({ Style }) {
    const style = Style(({ style }) => {
        const wrapper = style.class`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        `;

        const body = style.class`
        flex: 1;
        `;

        const canvas = style.class`
        display: block;
        width: 100%;
        height: 100%;
        `;

        return {
            wrapper,
            body,
            canvas
        };
    });

    return style;
});