declare namespace RHU {
    interface Modules {
        "components/atoms/dropdown/style": {
            wrapper: Style.ClassName;
        };
    }
}

RHU.module(new Error(), "components/atoms/dropdown/style",
    { Style: "rhu/style" },
    function({ Style }) {
        const style = Style(({ style }) => {
            const wrapper = style.class`
            
            `;
            
            return {
                wrapper
            };
        });

        return style;
    }
);