declare namespace RHU {
    interface Modules {
        "docuscript/images/@style": void;
    }
}

(() => { 
    const _module_ = "docuscript/images";
    
    RHU.module(new Error(), `${_module_}/@style`,
        { Style: "rhu/style", root: "docuscript/@style" },
        function({ Style, root }) {
            const style = Style(({ style }) => {
                style`
                ${root.body} img {
                    border-radius: 8px;
                    margin: 8px auto;
                }
                `;
            });

            return style;
        }
    );
})();