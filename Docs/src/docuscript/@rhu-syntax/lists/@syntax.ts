declare namespace RHU {
    interface Modules {
        "docuscript/lists": RHUDocuscript.Lists.Parser;
    }
}

declare namespace RHUDocuscript.Lists {
    interface NodeMap {
        ol: {};
        ul: {};
    }
    type Language = keyof NodeMap;

    interface FuncMap extends Docuscript.NodeFuncMap<Language> {
        ol: (...children: (string | Node)[]) => Node<"ol">;
        ul: (...children: (string | Node)[]) => Node<"ul">;
    }

    type Parser = Docuscript.Parser<Language, FuncMap>;
}

(() => { 
    const _module_ = "docuscript/lists";

    RHU.module(new Error(), `${_module_}`, {
        helper: "docuscript/@helper", root: "docuscript/@style", style: `${_module_}/@style`,
    }, function({
        helper, root,
    }) {
        type context = RHUDocuscript.Context;
        type node<T extends RHUDocuscript.Language | undefined = undefined> = RHUDocuscript.Node<T>;

        return {
            ul: {
                create: function(this: context, ...children) {
                    const node: node<"ul"> = {
                        __type__: "ul",
                    };
    
                    helper.mountChildrenText(this, node, children);
    
                    return node;
                },
                parse: function(children) {
                    const dom = document.createElement("ul");
                    dom.classList.toggle(`${root.block}`, true);
                    for (const child of children) {
                        const li = document.createElement("li");
                        li.classList.toggle(`${root.block}`, true);
                        const wrapper = document.createElement("div");
                        wrapper.classList.toggle(`${root.block}`, true);
                        wrapper.append(child);
                        li.append(wrapper);
                        dom.append(li);
                    }
                    return dom;
                }
            },
            ol: {
                create: function(this: context, ...children) {
                    const node: node<"ol"> = {
                        __type__: "ol",
                    };
    
                    helper.mountChildrenText(this, node, children);
    
                    return node;
                },
                parse: function(children) {
                    const dom = document.createElement("ol");
                    dom.classList.toggle(`${root.block}`, true);
                    for (const child of children) {
                        const li = document.createElement("li");
                        li.classList.toggle(`${root.block}`, true);
                        const wrapper = document.createElement("div");
                        wrapper.classList.toggle(`${root.block}`, true);
                        wrapper.append(child);
                        li.append(wrapper);
                        dom.append(li);
                    }
                    return dom;
                }
            },
        };
    });
})();