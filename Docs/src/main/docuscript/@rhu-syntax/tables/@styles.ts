declare namespace RHU {
    interface Modules {
        "docuscript/tables/@style": void;
    }
}

(() => { 
    const _module_ = "docuscript/tables";

    RHU.module(new Error(), `${_module_}/@style`,
        { Style: "rhu/style", root: "docuscript/@style" },
        function({ Style, root }) {
            const style = Style(({ style }) => {
                // TABLES
                style`
                ${root.body} table {
                    word-wrap: break-word;
                    border: 1px solid #333;
                    border-collapse: collapse;
                }
                ${root.body} td {
                    vertical-align: top;
                    padding: 0.5rem;
                    border-block-start: 1px solid #333;
                }
                `;
            });

            return style;
        }
    );
})();