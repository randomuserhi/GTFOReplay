RHU.module(new Error(), "docuscript/@helper", {}, function () {
    const include = function (context, imports) {
        const nodes = {};
        for (const key in imports) {
            nodes[key] = context.nodes[imports[key]];
        }
        return nodes;
    };
    const mountChildren = (context, node, children, conversion) => {
        for (const child of children) {
            let childNode;
            if (typeof child === "string") {
                childNode = conversion(child);
            }
            else {
                childNode = child;
            }
            context.remount(childNode, node);
        }
    };
    const mountChildrenText = (context, node, children) => {
        mountChildren(context, node, children, (text) => context.nodes.text(text));
    };
    const mountChildrenP = (context, node, children) => {
        mountChildren(context, node, children, (text) => context.nodes.p(text));
    };
    return {
        mountChildren,
        mountChildrenText,
        mountChildrenP,
        include,
    };
});
