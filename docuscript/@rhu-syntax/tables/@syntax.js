(() => {
    const _module_ = "docuscript/tables";
    RHU.module(new Error(), `${_module_}`, {
        helper: "docuscript/@helper", root: "docuscript/@style"
    }, function ({ helper, root }) {
        return {
            "table:smart": {
                create: function (options, headings, ...objects) {
                    const node = {
                        __type__: "table:wrapper",
                        widths: options.widths
                    };
                    const { td, tr, b, i } = helper.include(this, {
                        td: "table:cell",
                        tr: "table:row",
                        b: "b",
                        i: "i"
                    });
                    if (options.headings) {
                        this.remount(tr(...options.headings.map(h => td(b(i(h))))), node);
                    }
                    for (const obj of objects) {
                        this.remount(tr(...headings.map(h => {
                            if (typeof h === "string") {
                                return td(obj[h] === undefined ? options.default ? options.default : obj[h] : obj[h]);
                            }
                            else {
                                return td(h(obj));
                            }
                        })), node);
                    }
                    return node;
                },
            },
            "table": {
                create: function (widths, ...content) {
                    const node = {
                        __type__: "table:wrapper",
                        widths
                    };
                    const { td, tr } = helper.include(this, {
                        td: "table:cell",
                        tr: "table:row"
                    });
                    for (const row of content) {
                        this.remount(tr(...row.map(r => td(r))), node);
                    }
                    return node;
                },
            },
            "table:wrapper": {
                create: function (widths, ...children) {
                    const node = {
                        __type__: "table:wrapper",
                        widths
                    };
                    helper.mountChildrenText(this, node, children);
                    return node;
                },
                parse: function (children, node) {
                    for (const row of children) {
                        if (node.widths) {
                            for (let i = 0; i < node.widths.length && i < row.childNodes.length; ++i) {
                                row.childNodes[i].style.width = node.widths[i];
                            }
                        }
                    }
                    const wrapper = document.createElement("table");
                    if (node.widths) {
                        wrapper.classList.toggle(`${root.block}`, true);
                    }
                    const dom = document.createElement("tbody");
                    dom.append(...children);
                    wrapper.append(dom);
                    return wrapper;
                }
            },
            "table:row": {
                create: function (...children) {
                    const node = {
                        __type__: "table:row"
                    };
                    helper.mountChildrenText(this, node, children);
                    return node;
                },
                parse: function (children) {
                    const dom = document.createElement("tr");
                    dom.append(...children);
                    return dom;
                }
            },
            "table:cell": {
                create: function (...children) {
                    const node = {
                        __type__: "table:cell"
                    };
                    helper.mountChildrenText(this, node, children);
                    return node;
                },
                parse: function (children) {
                    const dom = document.createElement("td");
                    dom.append(...children);
                    return dom;
                }
            },
        };
    });
})();
