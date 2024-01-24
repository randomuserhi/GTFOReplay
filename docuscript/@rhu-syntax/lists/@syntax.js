(() => {
    const _module_ = "docuscript/lists";
    RHU.module(new Error(), `${_module_}`, {
        helper: "docuscript/@helper", root: "docuscript/@style", style: `${_module_}/@style`,
    }, function ({ helper, root, }) {
        return {
            ul: {
                create: function (...children) {
                    const node = {
                        __type__: "ul",
                    };
                    helper.mountChildrenText(this, node, children);
                    return node;
                },
                parse: function (children) {
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
                create: function (...children) {
                    const node = {
                        __type__: "ol",
                    };
                    helper.mountChildrenText(this, node, children);
                    return node;
                },
                parse: function (children) {
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
