declare namespace RHU {
    interface Modules {
        "docuscript/images": RHUDocuscript.Images.Parser;
    }
}

declare namespace RHUDocuscript.Images {
    interface NodeMap {
        img: {
            src: string;
            width?: string;
        };
    }
    type Language = keyof NodeMap;

    interface FuncMap extends Docuscript.NodeFuncMap<Language> {
        img: (src: string, width?: string) => Node<"img">;
    }

    type Parser = Docuscript.Parser<Language, FuncMap>;
}

(() => { 
    const _module_ = "docuscript/images";

    RHU.module(new Error(), `${_module_}`, {
        helper: "docuscript/@helper", root: "docuscript/@style", style: `${_module_}/@style`,
    }, function() {
        //type context = RHUDocuscript.Context;
        //type node<T extends RHUDocuscript.Language | undefined = undefined> = RHUDocuscript.Node<T>;

        return {
            img: {
                create: function(src, width) {
                    return {
                        __type__: "img",
                        src,
                        width
                    };
                },
                parse: function(_, node) {
                    const img = document.createElement("img");
                    img.src = node.src;
                    if (node.width) {
                        img.style.width = node.width;
                    }
                    return img;
                }
            },
        };
    });
})();