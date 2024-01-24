(() => {
    const _module_ = "docuscript/code";
    RHU.module(new Error(), `${_module_}`, {
        helper: "docuscript/@helper", root: "docuscript/@style", style: `${_module_}/@style`,
        codeblock: `${_module_}/@components/molecules/codeblock`,
    }, function ({ helper, root, style, codeblock }) {
        return {
            "code:inline": {
                create: function ([language], ...children) {
                    const node = {
                        __type__: "code:inline",
                        language,
                    };
                    helper.mountChildrenText(this, node, children);
                    return node;
                },
                parse: function (children, node) {
                    const dom = document.createElement("span");
                    dom.classList.toggle(`${style.inlineCode}`, true);
                    dom.append(...children);
                    if (node.language) {
                        dom.classList.toggle(node.language, true);
                    }
                    else {
                        dom.classList.toggle("language-plaintext", true);
                    }
                    hljs.highlightElement(dom);
                    return dom;
                },
            },
            "code:block": {
                create: function ([language], ...children) {
                    const node = {
                        __type__: "code:block",
                        language,
                    };
                    this.remount(this.nodes.text(children.join("\n")), node);
                    return node;
                },
                parse: function (children, node) {
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
