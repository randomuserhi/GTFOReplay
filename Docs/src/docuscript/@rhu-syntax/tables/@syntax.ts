declare namespace RHU {
    interface Modules {
        "docuscript/tables": RHUDocuscript.Tables.Parser;
    }
}

declare namespace RHUDocuscript.Tables {
    interface NodeMap {
        table: never;
        "table:wrapper": {
            widths?: string[];
        };
        "table:row": {};
        "table:cell": {};
        "table:smart": never;
    }
    type Language = keyof NodeMap;

    interface FuncMap extends Docuscript.NodeFuncMap<Language> {
        table: (widths: string[] | undefined, ...content: (string | Node)[][]) => Node<"table:wrapper">;
        "table:smart": <T>( options: { 
            widths?: string[],
            headings?: string[]
        }, headings: (string | ((i: T) => any))[], ...objects: T[]) => Node<"table:wrapper">;
        "table:wrapper": (widths: string[] | undefined, ...content: (string | Node<"table:row">)[]) => Node<"table:wrapper">;
        "table:row": (...content: (string | Node<"table:cell">)[]) => Node<"table:row">;
        "table:cell": (...content: (string | Node)[]) => Node<"table:cell">;
    }

    type Parser = Docuscript.Parser<Language, FuncMap>;
}

(() => { 
    const _module_ = "docuscript/tables";

    RHU.module(new Error(), `${_module_}`, {
        helper: "docuscript/@helper", root: "docuscript/@style"
    }, function({
        helper, root
    }) {
        type context = RHUDocuscript.Context;
        type node<T extends RHUDocuscript.Language | undefined = undefined> = RHUDocuscript.Node<T>;

        return {
            "table:smart": {
                create: function<T>(this: context, options: { 
                    widths?: string[],
                    headings?: string[],
                    default?: string
                }, headings: (string | ((i: T) => any))[], ...objects: T[]): node<"table:wrapper"> {
                    const node: node<"table:wrapper"> = {
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
                                return td((obj as any)[h] === undefined ? options.default ? options.default : (obj as any)[h] : (obj as any)[h]);
                            } else {
                                return td(h(obj));
                            }
                        })), node);
                    }

                    return node;
                },
            },
            "table": {
                create: function(this: context, widths, ...content) {
                    const node: node<"table:wrapper"> = {
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
                create: function(this: context, widths, ...children) {
                    const node: node<"table:wrapper"> = {
                        __type__: "table:wrapper",
                        widths
                    };

                    helper.mountChildrenText(this, node, children);

                    return node;
                },
                parse: function(children, node) {
                    for (const row of children) {
                        if (node.widths) {
                            for (let i = 0; i < node.widths.length && i < row.childNodes.length; ++i) {
                                (row.childNodes[i] as HTMLElement).style.width = node.widths[i];
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
                create: function(this: context, ...children) {
                    const node: node<"table:row"> = {
                        __type__: "table:row"
                    };

                    helper.mountChildrenText(this, node, children);

                    return node;
                },
                parse: function(children) {
                    const dom = document.createElement("tr");
                    dom.append(...children);
                    return dom;
                }
            },
            "table:cell": {
                create: function(this: context, ...children) {
                    const node: node<"table:cell"> = {
                        __type__: "table:cell"
                    };

                    helper.mountChildrenText(this, node, children);

                    return node;
                },
                parse: function(children) {
                    const dom = document.createElement("td");
                    dom.append(...children);
                    return dom;
                }
            },
        };
    });
})();