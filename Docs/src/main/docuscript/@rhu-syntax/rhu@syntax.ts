declare namespace RHU {
    interface Modules {
        "docuscript": RHUDocuscript.Parser;
    }
}

declare namespace RHUDocuscript {
    type NodeMapIncludes = 
        Tables.NodeMap & 
        Code.NodeMap &
        Images.NodeMap &
        Lists.NodeMap &
        MathJax.NodeMap;

    type NodeFuncMapIncludes = 
        Tables.FuncMap &
        Code.FuncMap &
        Images.FuncMap &
        Lists.FuncMap &
        MathJax.FuncMap;

    interface BaseNodeMap
    {
        text: {
            text: string;
        };
        br: {};
        p: {};
        h: {
            heading: number;
            label: string;
            link?: string;
            onclick?: () => void;
        };
        h1: never;
        h2: never;
        h3: never;
        h4: never;
        h5: never;
        h6: never;
        div: {};
        frag: {};
        pl: {
            path: string;
            index?: number;
            link?: string;
            onclick?: () => void;
        };
        link: {
            href: string;
        };
        i: {};
        b: {};
        center: {};
    }
    type NodeMap = BaseNodeMap & NodeMapIncludes;
    
    type BaseLanguage = keyof BaseNodeMap;
    type Language = BaseLanguage | keyof NodeFuncMapIncludes;

    interface BaseFuncMap extends Docuscript.NodeFuncMap<BaseLanguage>
    {
        text: (text: string) => Node<"text">;
        br: () => Node<"br">;
        i: (...children: (string | Node)[]) => Node<"i">;
        b: (...children: (string | Node)[]) => Node<"b">;
        p: (...children: (string | Node)[]) => Node<"p">;
        
        h: (heading: number, label: string, ...children: (string | Node)[]) => Node<"h">;
        h1: (label: string, ...children: (string | Node)[]) => Node<"h">;
        h2: (label: string, ...children: (string | Node)[]) => Node<"h">;
        h3: (label: string, ...children: (string | Node)[]) => Node<"h">;
        h4: (label: string, ...children: (string | Node)[]) => Node<"h">;
        h5: (label: string, ...children: (string | Node)[]) => Node<"h">;
        h6: (label: string, ...children: (string | Node)[]) => Node<"h">;

        div: (...children: (string | Node)[]) => Node<"div">;
        frag: (...children: (string | Node)[]) => Node<"frag">;

        pl: (params: [path: string, index?: number], ...children: (string | Node)[]) => Node<"pl">;
        link: (href: string, ...children: (string | Node)[]) => Node<"link">;

        center: (...content: (string | Node)[]) => Node<"center">;
    }
    type FuncMap = BaseFuncMap & NodeFuncMapIncludes;

    type Page = Docuscript.Page<Language, FuncMap>;
    type Parser = Docuscript.Parser<Language, FuncMap>;
    type Context = Docuscript.Context<Language, FuncMap>;
    type Node<T extends Language | undefined = undefined> = Docuscript.NodeDef<NodeMap, T>;
}

RHU.module(new Error(), "docuscript", {
    Macro: "rhu/macro", helper: "docuscript/@helper", style: "docuscript/@style",
    tables: "docuscript/tables",
    code: "docuscript/code",
    images: "docuscript/images",
    lists: "docuscript/lists",
    mathjax: "docuscript/mathjax",
}, function({
    Macro, helper, style,
    code, 
    tables,
    images,
    lists,
    mathjax,
}) {
    type context = RHUDocuscript.Context;
    type node<T extends RHUDocuscript.Language | undefined = undefined> = RHUDocuscript.Node<T>;

    const includes = {
        ...tables,
        ...code,
        ...images,
        ...lists,
        ...mathjax,
    };

    return {
        ...includes,
        center: {
            create: function(this: context, ...children) {
                const node: node<"center"> = {
                    __type__: "center"
                };

                helper.mountChildrenText(this, node, children);

                return node;
            },
            parse: function(children) {
                const dom = document.createElement("div");
                dom.classList.toggle(`${style.center}`, true);
                dom.append(...children);
                return dom;
            }
        },
        i: {
            create: function(this: context, ...children) {
                const node: node<"i"> = {
                    __type__: "i",
                };

                helper.mountChildrenText(this, node, children);

                return node;
            },
            parse: function(children) {
                const dom = document.createElement("i");
                dom.append(...children);
                return dom;
            }
        },
        b: {
            create: function(this: context, ...children) {
                const node: node<"b"> = {
                    __type__: "b",
                };

                helper.mountChildrenText(this, node, children);

                return node;
            },
            parse: function(children) {
                const dom = document.createElement("b");
                dom.append(...children);
                return dom;
            }
        },
        link: {
            create: function(this: context, href, ...children) {
                const node: node<"link"> = {
                    __type__: "link",
                    href,
                };

                helper.mountChildrenText(this, node, children);

                return node;
            },
            parse: function(children, node) {
                const dom = document.createElement("a");
                dom.target = "blank";
                dom.href = node.href;
                dom.append(...children);
                return dom;
            }
        },
        pl: {
            create: function(this: context, [path, index], ...children) {
                const node: node<"pl"> = {
                    __type__: "pl",
                    path,
                    index,
                };

                helper.mountChildrenText(this, node, children);

                return node;
            },
            parse: function(children, node) {
                const pl = node as node<"pl">;
                const dom = document.createElement(`a`);
                dom.style.textDecoration = "inherit"; // TODO(randomuserhi): style properly with :hover { text-decoration: underline; }
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
            create: function(text) {
                return {
                    __type__: "text",
                    text: text.toString(),
                };
            },
            parse: function(_, node) {
                return document.createTextNode(node.text);
            }
        },
        br: {
            create: function() {
                return {
                    __type__: "br",
                };
            },
            parse: function() {
                const dom = document.createElement("br");
                return dom;
            }
        },
        p: {
            create: function(this: context, ...children) {
                const node: node<"p"> = {
                    __type__: "p",
                };

                helper.mountChildrenText(this, node, children);

                return node;
            },
            parse: function(children) {
                const dom = document.createElement("p");
                dom.classList.toggle(`${style.block}`, true);
                dom.append(...children);
                return dom;
            }
        },
        h1: {
            create: function(this: context, label, ...children) {
                return this.nodes.h(1, label, ...children);
            },
        },
        h2: {
            create: function(this: context, label, ...children) {
                return this.nodes.h(1, label, ...children);
            },
        },
        h3: {
            create: function(this: context, label, ...children) {
                return this.nodes.h(1, label, ...children);
            },
        },
        h4: {
            create: function(this: context, label, ...children) {
                return this.nodes.h(1, label, ...children);
            },
        },
        h5: {
            create: function(this: context, label, ...children) {
                return this.nodes.h(1, label, ...children);
            },
        },
        h6: {
            create: function(this: context, label, ...children) {
                return this.nodes.h(1, label, ...children);
            },
        },
        h: {
            create: function(this: context, heading, label, ...children) {
                const node: node<"h"> = {
                    __type__: "h",
                    heading,
                    label,
                };

                if (children.length === 0) {
                    this.remount(this.nodes.text(label), node);
                } else {
                    helper.mountChildrenText(this, node, children);
                }

                return node;
            },
            parse: function(children, node) {
                const h = node as node<"h">;

                const tag = `h${h.heading}`;
                const dom = Macro.anon<{
                    heading: HTMLHeadingElement
                }>(
                    `
                    <${tag} rhu-id="heading" style="display: flex; gap: 8px; align-items: center;" class="${style.block}">
                    </${tag}>
                    `)[0];

                let linkDom: HTMLAnchorElement | undefined = undefined;
                const linkHandle = (e: MouseEvent) => {
                    e.preventDefault();
                    if (h.onclick) {
                        h.onclick();
                    }
                };
                if (h.link) {
                    const anon = Macro.anon<{
                        link: HTMLAnchorElement;
                    }>(//html
                        `
                        <div style="align-self: stretch; flex-shrink: 0; padding-top: 0.8rem; display: flex;">
                            <a rhu-id="link" href="${h.link}" style="font-family: 'docons'; font-size: 1rem; text-decoration: inherit; color: inherit;"></a>
                        </div>
                        `);
                    linkDom = anon[0].link;
                    linkDom.addEventListener("click", linkHandle);
                    dom.heading.append(anon[1]);
                }
                dom.heading.append(...children);
                return [dom.heading, {dom: linkDom, handle: linkHandle}];
            },
            destructor: function(data: { dom?: HTMLAnchorElement, handle: (e: MouseEvent) => void }) {
                if (data.dom) {
                    data.dom.removeEventListener("click", data.handle);
                }
            }
        },
        div: {
            create: function(this: context, ...children) {
                const node: node<"div"> = {
                    __type__: "div",
                };
                
                helper.mountChildrenP(this, node, children);

                return node;
            },
            parse: function(children) {
                const dom = document.createElement("div");
                dom.classList.toggle(`${style.block}`, true);
                dom.append(...children);
                return dom;
            }
        },
        frag: {
            create: function (this: context, ...children) {
                const node: node<"frag"> = {
                    __type__: "frag",
                };
                
                helper.mountChildrenText(this, node, children);

                return node;
            },
            parse: function(children) {
                const dom = new DocumentFragment();
                dom.append(...children);
                return dom;
            },
        },
    };
});