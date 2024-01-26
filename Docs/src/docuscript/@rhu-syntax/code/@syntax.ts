declare namespace RHU {
    interface Modules {
        "docuscript/code": RHUDocuscript.Code.Parser;
    }
}

declare namespace RHUDocuscript.Code {
    interface NodeMap {
        "code:block": {
            language?: string;
        };
        "code:inline": {
            language?: string;  
        };
    }
    type Language = keyof NodeMap;

    interface FuncMap extends Docuscript.NodeFuncMap<Language> {
        "code:block": (params: [language?: string], ...content: (string)[]) => Node<"code:block">;
        "code:inline": (params: [language?: string], ...content: (string)[]) => Node<"code:inline">;
    }

    type Parser = Docuscript.Parser<Language, FuncMap>;
}

(() => { 
    const _module_ = "docuscript/code";

    RHU.module(new Error(), `${_module_}`, {
        helper: "docuscript/@helper", root: "docuscript/@style", style: `${_module_}/@style`,
        codeblock: `${_module_}/@components/molecules/codeblock`,
    }, function({
        helper, root, style,
        codeblock
    }) {
        type context = RHUDocuscript.Context;
        type node<T extends RHUDocuscript.Language | undefined = undefined> = RHUDocuscript.Node<T>;

        return {
            "code:inline": {
                create: function(this: context, [language], ...children) {
                    const node: node<"code:inline"> = {
                        __type__: "code:inline",
                        language,
                    };

                    helper.mountChildrenText(this, node, children);

                    return node;
                },
                parse: function(children, node) {
                    const dom = document.createElement("span");
                    dom.classList.toggle(`${style.inlineCode}`, true);
                    dom.append(...children);
                    if (node.language) {
                        dom.classList.toggle(node.language, true);
                    } else {
                        dom.classList.toggle("language-plaintext", true);
                    }
                    hljs.highlightElement(dom);
                    return dom;
                },
            },
            "code:block": {
                create: function(this: context, [language], ...children) {
                    const node: node<"code:block"> = {
                        __type__: "code:block",
                        language,
                    };

                    this.remount(this.nodes.text(children.join("\n")), node);

                    return node;
                },
                parse: function(children, node) {
                    const dom = document.createMacro(codeblock);
                    dom.classList.toggle(`${root.block}`, true);
                    dom.append(...children);
                    dom.setLanguage(node.language);
                    return dom;
                },
            },
        };
    });
})();