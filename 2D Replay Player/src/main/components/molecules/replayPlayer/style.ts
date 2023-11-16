declare namespace RHU {
    interface Modules {
        "components/molecules/replayPlayer/style": {
            wrapper: Style.ClassName;
        };
    }
}

RHU.module(new Error(), "components/molecules/replayPlayer/style",
    { Style: "rhu/style", theme: "main/theme" },
    function({ Style, theme })
    {
        const style = Style(({ style }) => {
            const wrapper = style.class`
            width: 100%;
            height: 100%;
            `;
            style`
            ${wrapper} canvas {
                display: block;
                width: 100%;
                height: 100%;
            }
            `;
            return {
                wrapper,
            };
        });

        return style;
    }
);