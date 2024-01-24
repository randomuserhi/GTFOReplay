(() => {
    const _module_ = "docuscript/images";
    RHU.module(new Error(), `${_module_}`, {
        helper: "docuscript/@helper", root: "docuscript/@style", style: `${_module_}/@style`,
    }, function () {
        return {
            img: {
                create: function (src, width) {
                    return {
                        __type__: "img",
                        src,
                        width
                    };
                },
                parse: function (_, node) {
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
