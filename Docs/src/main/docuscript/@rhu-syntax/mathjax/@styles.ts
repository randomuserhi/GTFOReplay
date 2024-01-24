declare namespace RHU {
    interface Modules {
        "docuscript/mathjax/@style": void;
    }
}

(() => { 
    const _module_ = "docuscript/mathjax";

    RHU.module(new Error(), `${_module_}/@style`,
        { Style: "rhu/style", root: "docuscript/@style" },
        function({ Style }) {
            const style = Style(() => {
            });

            return style;
        }
    );
})();