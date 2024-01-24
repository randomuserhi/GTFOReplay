declare namespace RHU {
    interface Modules {
        "docuscript/code/@style": {
            inlineCode: Style.ClassName;
        };
    }
}

(() => { 
    const _module_ = "docuscript/code";

    RHU.module(new Error(), `${_module_}/@style`,
        { Style: "rhu/style", root: "docuscript/@style" },
        function({ Style, root }) {
            const style = Style(({ style }) => {
                // INLINE CODE
                const inlineCode = style.class`
                padding: 0 3px;
                border-radius: 3px;
                `;

                // CODE
                style`
                ${root.body} code {
                    border-radius: 8px;
                    margin: 8px auto;
                }
                `;

                return {
                    inlineCode,
                };
            });

            return style;
        }
    );
})();