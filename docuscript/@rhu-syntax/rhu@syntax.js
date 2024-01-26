RHU.module(new Error(), "docuscript", {
    Macro: "rhu/macro", helper: "docuscript/@helper", style: "docuscript/@style",
    tables: "docuscript/tables",
    code: "docuscript/code",
    images: "docuscript/images",
    lists: "docuscript/lists",
}, function ({ Macro, helper, style, code, tables, images, lists, }) {
    const includes = {
        ...tables,
        ...code,
        ...images,
        ...lists,
    };
    return {
        ...includes,
        center: {
            create: function (...children) {
                const node = {
                    __type__: "center"
                };
                helper.mountChildrenText(this, node, children);
                return node;
            },
            parse: function (children) {
                const dom = document.createElement("div");
                dom.classList.toggle(`${style.center}`, true);
                dom.append(...children);
                return dom;
            }
        },
        i: {
            create: function (...children) {
                const node = {
                    __type__: "i",
                };
                helper.mountChildrenText(this, node, children);
                return node;
            },
            parse: function (children) {
                const dom = document.createElement("i");
                dom.append(...children);
                return dom;
            }
        },
        b: {
            create: function (...children) {
                const node = {
                    __type__: "b",
                };
                helper.mountChildrenText(this, node, children);
                return node;
            },
            parse: function (children) {
                const dom = document.createElement("b");
                dom.append(...children);
                return dom;
            }
        },
        link: {
            create: function (href, ...children) {
                const node = {
                    __type__: "link",
                    href,
                };
                helper.mountChildrenText(this, node, children);
                return node;
            },
            parse: function (children, node) {
                const dom = document.createElement("a");
                dom.target = "blank";
                dom.href = node.href;
                dom.append(...children);
                return dom;
            }
        },
        pl: {
            create: function ([path, index], ...children) {
                const node = {
                    __type__: "pl",
                    path,
                    index,
                };
                helper.mountChildrenText(this, node, children);
                return node;
            },
            parse: function (children, node) {
                const pl = node;
                const dom = document.createElement(`a`);
                dom.style.textDecoration = "inherit";
                if (pl.link) {
                    dom.href = pl.link;
                    dom.addEventListener("click", (e) => {
                        e.preventDefault();
                        if (pl.onclick) {
                            pl.onclick();
                        }
                    });
                }
                dom.append(...children);
                return dom;
            }
        },
        text: {
            create: function (text) {
                return {
                    __type__: "text",
                    text: text.toString(),
                };
            },
            parse: function (_, node) {
                return document.createTextNode(node.text);
            }
        },
        br: {
            create: function () {
                return {
                    __type__: "br",
                };
            },
            parse: function () {
                const dom = document.createElement("br");
                return dom;
            }
        },
        p: {
            create: function (...children) {
                const node = {
                    __type__: "p",
                };
                helper.mountChildrenText(this, node, children);
                return node;
            },
            parse: function (children) {
                const dom = document.createElement("p");
                dom.classList.toggle(`${style.block}`, true);
                dom.append(...children);
                return dom;
            }
        },
        h1: {
            create: function (label, ...children) {
                return this.nodes.h(1, label, ...children);
            },
        },
        h2: {
            create: function (label, ...children) {
                return this.nodes.h(2, label, ...children);
            },
        },
        h3: {
            create: function (label, ...children) {
                return this.nodes.h(3, label, ...children);
            },
        },
        h4: {
            create: function (label, ...children) {
                return this.nodes.h(4, label, ...children);
            },
        },
        h5: {
            create: function (label, ...children) {
                return this.nodes.h(5, label, ...children);
            },
        },
        h6: {
            create: function (label, ...children) {
                return this.nodes.h(6, label, ...children);
            },
        },
        h: {
            create: function (heading, label, ...children) {
                const node = {
                    __type__: "h",
                    heading,
                    label,
                };
                if (children.length === 0) {
                    this.remount(this.nodes.text(label), node);
                }
                else {
                    helper.mountChildrenText(this, node, children);
                }
                return node;
            },
            parse: function (children, node) {
                const h = node;
                const tag = `h${h.heading}`;
                const dom = Macro.anon(`
                    <${tag} rhu-id="heading" style="display: flex; gap: 8px; align-items: center;" class="${style.block}">
                    </${tag}>
                    `)[0];
                let linkDom = undefined;
                const linkHandle = (e) => {
                    e.preventDefault();
                    if (h.onclick) {
                        h.onclick();
                    }
                };
                if (h.link) {
                    const anon = Macro.anon(`
                        <div style="align-self: stretch; flex-shrink: 0; padding-top: 0.8rem; display: flex;">
                            <a rhu-id="link" href="${h.link}" style="font-family: 'docons'; font-size: 1rem; text-decoration: inherit; color: inherit;"></a>
                        </div>
                        `);
                    linkDom = anon[0].link;
                    linkDom.addEventListener("click", linkHandle);
                    dom.heading.append(anon[1]);
                }
                dom.heading.append(...children);
                return [dom.heading, { dom: linkDom, handle: linkHandle }];
            },
            destructor: function (data) {
                if (data.dom) {
                    data.dom.removeEventListener("click", data.handle);
                }
            }
        },
        div: {
            create: function (...children) {
                const node = {
                    __type__: "div",
                };
                helper.mountChildrenP(this, node, children);
                return node;
            },
            parse: function (children) {
                const dom = document.createElement("div");
                dom.classList.toggle(`${style.block}`, true);
                dom.append(...children);
                return dom;
            }
        },
        frag: {
            create: function (...children) {
                const node = {
                    __type__: "frag",
                };
                helper.mountChildrenText(this, node, children);
                return node;
            },
            parse: function (children) {
                const dom = new DocumentFragment();
                dom.append(...children);
                return dom;
            },
        },
    };
});
