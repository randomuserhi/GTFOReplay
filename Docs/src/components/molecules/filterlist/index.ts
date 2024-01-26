declare namespace RHU {
    interface Modules {
        "components/molecules/filterlist": Macro.Template<"molecules/filterlist">;
    }

    namespace Macro {
        interface TemplateMap {
            "molecules/filterlist": Molecules.Filterlist;
            "atoms/filteritem": Atoms.Filteritem;
        }
    }
}

declare namespace Atoms {
    interface Filteritem extends HTMLDivElement {
        set(page: Page): void;
    
        page?: Page;
        path: string;
        name: string;
        items: Atoms.Filteritem[];
        fuse: any; // Fuse object but no typing for Fuse kekw
        owner: Molecules.Filterlist;

        body: HTMLDivElement;
        label: HTMLDivElement;
        list: HTMLDivElement;
        dropdown: HTMLSpanElement;
    }
}

declare namespace Molecules {
    interface Filterlist extends HTMLDivElement {
        load(version: string): void;
        setPath(path?: string): void;
        setActive(path: string, seek?: boolean): void;
        
        items: Atoms.Filteritem[];
        fuse: any; // Fuse object but no typing for Fuse kekw
        fuseall: any; // Fuse object but no typing for Fuse kekw
        fuseallname: any; // Fuse object but no typing for Fuse kekw
        activePath?: string;
        lastActive?: Atoms.Filteritem;
        root?: string;
        currentVersion: string;

        version: Atoms.Dropdown;
        search: HTMLInputElement;
        path: HTMLDivElement;
        list: HTMLDivElement;
        body: HTMLDivElement;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GlobalEventHandlersEventMap {
    "view": CustomEvent<{ target: unknown }>;
}

RHU.module(new Error(), "components/molecules/filterlist", { 
    Macro: "rhu/macro", style: "components/molecules/filterlist/style",
    dropdown: "components/atoms/dropdown",
    docs: "docs",
}, function({ 
    Macro, style,
    dropdown,
    docs,
}) {
    const filteritem = Macro((() => {
        const filteritem = function(this: Atoms.Filteritem) {
            this.classList.toggle(`${style.filteritem.expanded}`, true);
            this.label.addEventListener("click", (e) => {
                this.dispatchEvent(RHU.CustomEvent("view", { target: this.page }));
                e.preventDefault(); // stop redirect
            });
            this.dropdown.addEventListener("click", () => {
                this.classList.toggle(`${style.filteritem.expanded}`);
            });
        } as RHU.Macro.Constructor<Atoms.Filteritem>;

        filteritem.prototype.set = function(page) {
            this.label.innerHTML = page.name;
            const url = new URL(window.location.origin + window.location.pathname);
            url.searchParams.set("version", page.version);
            url.searchParams.set("page", page.fullPath());
            this.label.setAttribute("href", url.toString());

            this.page = page;
            this.path = this.page.fullPath();
            this.name = this.page.name;
            this.items = [];

            const fragment = new DocumentFragment();
            for (const p of page.sortedKeys()) {
                const item = document.createMacro("atoms/filteritem");
                item.owner = this.owner;
                this.owner.items.push(item);
                this.items.push(item);
                item.set(page.subDirectories.get(p)!);
                item.addEventListener("view", (e) => {
                    this.dispatchEvent(RHU.CustomEvent("view", e.detail));
                });
                page.get(p)!.dom = item;
                fragment.append(item);
            }
            if (fragment.childElementCount > 0) {
                this.dropdown.classList.toggle(`${style.filteritem.nochildren}`, false);
            } else {
                this.dropdown.classList.toggle(`${style.filteritem.nochildren}`, true);
            }
            this.list.replaceChildren(fragment);

            const Fuse = (window as any).Fuse;
            this.fuse = new Fuse(this.items, {
                keys: ["name"],
                threshold: 0.4,
            });
        };

        return filteritem;
    })(), "atoms/filteritem", //html
    `
            <div rhu-id="body" class="${style.filteritem.content}">
                <div class="${style.filteritem.align}">
                    <span rhu-id="dropdown" class="${style.filteritem.nochildren} ${style.dropdown}"></span>
                </div>
                <a class="${style.filteritem}" rhu-id="label"></a>
            </div>
            <ol rhu-id="list" class="${style.filteritem.children}">
            </ol>
        `, {
        element: //html
            `<li></li>`
    });

    const filterlist = Macro((() => {
        const filterlist = function(this: Molecules.Filterlist) {
            this.classList.add(`${style.wrapper}`);

            this.version.setOptions(docs.sort([...docs.versions.keys()], "desc").map(k => ({
                label: k,
                value: k,
            })));

            this.version.addEventListener("change", () => {
                this.load(this.version.value);
            });

            this.search.addEventListener("input", () => {
                const clean = this.search.value.trim();
                if (clean === "") {
                    for (const item of this.items) {
                        item.classList.toggle(`${style.hide}`, false);
                    }
                    return;
                }
                const matches = clean.split("/");
                for (const item of this.items) {
                    item.classList.toggle(`${style.hide}`, true);
                }
                if (matches.length === 1) {
                    for (const result of this.fuseall.search(matches[0])) {
                        const item: Atoms.Filteritem = result.item;
                        item.classList.toggle(`${style.hide}`, false);
                        let page = item.page!.parent as Page;
                        while (page) {
                            if (page!.dom) {
                                page.dom.classList.toggle(`${style.hide}`, false);
                                page.dom.classList.toggle(`${style.filteritem.expanded}`, true);
                            }
                            page = page.parent as Page;
                        }
                    }
                } else {
                    const recursive = (item: Atoms.Filteritem, index: number) => {
                        if (!matches[index]) {
                            for (const i of item.items) {
                                i.classList.toggle(`${style.hide}`, false);
                            }
                            return;
                        }
                        for (const result of item.fuse.search(matches[index])) {
                            const item: Atoms.Filteritem = result.item;
                            item.classList.toggle(`${style.hide}`, false);
                            recursive(item, index + 1);
                        }
                    };

                    for (const result of this.fuseallname.search(matches[0])) {
                        const item: Atoms.Filteritem = result.item;
                        item.classList.toggle(`${style.hide}`, false);
                        let page = item.page!.parent as Page;
                        while (page) {
                            if (page!.dom) {
                                page.dom.classList.toggle(`${style.hide}`, false);
                                page.dom.classList.toggle(`${style.filteritem.expanded}`, true);
                            }
                            page = page.parent as Page;
                        }

                        recursive(item, 1);
                    }
                }
            });

            this.lastActive = undefined;
            this.root = undefined;
            this.setPath(this.root);

            this.load(this.version.value);
        } as RHU.Macro.Constructor<Molecules.Filterlist>;

        filterlist.prototype.load = function(versionStr) {
            this.items = [];
            const subitems = [];
            this.currentVersion = versionStr;
            const version = docs.get(versionStr);
            if (!RHU.exists(version)) {
                this.list.replaceChildren();
                return;   
            }
            const fragment = new DocumentFragment();
            const root: Directory | undefined = this.root ? version.get(this.root) : version;
            if (!root) {
                // TODO(randomuserhi): Root not found error
                return;
            }
            for (const page of root.sortedKeys()) {
                const item = document.createMacro(filteritem);
                item.owner = this;
                this.items.push(item);
                subitems.push(item);
                const view = root.subDirectories.get(page)!;
                item.addEventListener("view", (e) => {
                    //this.setPath(e.detail.page.fullPath()); // -> TODO(randomuserhi): Add a button (similar to dropdown button) on right side that sets path instead of every click.
                    this.dispatchEvent(RHU.CustomEvent("view", e.detail));
                });
                item.set(view);
                view.dom = item;
                fragment.append(item);
            }
            this.list.replaceChildren(fragment);

            if (this.activePath) {
                this.setActive(this.activePath);
            }

            const Fuse = (window as any).Fuse;
            this.fuseall = new Fuse(this.items, {
                keys: ["path", "name"],
                threshold: 0.4,
            });
            this.fuseallname = new Fuse(this.items, {
                keys: ["name"],
                threshold: 0.4,
            });
            this.fuse = new Fuse(subitems, {
                keys: ["name"],
                threshold: 0.4,
            });
        };

        // TODO(randomuserhi): Path functionality is the exact same as the path displayed above page title, only difference is styles
        //                     - move into an Atom and use rhu-macro here instead
        filterlist.prototype.setPath = function(path) {
            const version = docs.get(this.currentVersion);

            if (!path || !version) {
                this.path.replaceChildren();
            } else {
                
                const frag = new DocumentFragment();
                if (path) {
                    const item = document.createElement("a");
                    item.innerHTML = "~";
                    item.addEventListener("click", (e) => {
                        this.setPath();
                        e.preventDefault();
                    });

                    const url = new URL(window.location.origin + window.location.pathname);
                    url.searchParams.set("version", this.currentVersion);
                    item.setAttribute("href", url.toString());

                    item.classList.toggle(`${style.path.item}`);
                    const wrapper = document.createElement("li");
                    wrapper.append(item);
                    frag.append(wrapper);
                }
                const builtPath: string[] = [];
                for (const directory of docs.split(path)) {
                    const item = document.createElement("a");
                    item.innerHTML = directory;
                    
                    builtPath.push(directory);
                    const p = [...builtPath].join("/");
                    item.addEventListener("click", (e) => {
                        this.setPath(builtPath.slice(0, builtPath.length - 1).join("/"));
                        e.preventDefault();
                    });
                    const page = version.get(p);
                    if (page) {
                        const url = new URL(window.location.origin + window.location.pathname);
                        url.searchParams.set("version", page.version);
                        url.searchParams.set("page", p);
                        item.setAttribute("href", url.toString());
                    }

                    item.classList.toggle(`${style.path.item}`);
                    const wrapper = document.createElement("li");
                    wrapper.append(item);
                    frag.append(wrapper);
                }
                this.path.replaceChildren(frag);
            }
            
            this.root = path;
            this.load(this.currentVersion);
        };

        filterlist.prototype.setActive = function(path, seek) {
            this.activePath = path;

            // Sets filterlist path to seeked location => deprecated behaviour
            /*if (seek) {
                const parts = docs.split(path);
                if (parts.length > 1) {
                    this.setPath(parts.slice(0, parts.length - 1).join("/"));
                } else {
                    this.setPath();
                }
            }*/

            if (this.lastActive) {
                this.lastActive.body.classList.toggle(`${style.filteritem.active}`, false); // TODO(randomuserhi): Make into a filteritem function called "toggleActive" or something
            }

            const version = docs.get(this.currentVersion);
            if (version) {
                const directory = version.get(path);
                if (directory && directory.dom) {
                    directory.dom.body.classList.toggle(`${style.filteritem.active}`, true); // TODO(randomuserhi): Make into a filteritem function called "toggleActive" or something
                    this.lastActive = directory.dom;
                    let page = directory.parent as Page;
                    while (page) {
                        if (page && page.dom) {
                            page.dom.classList.toggle(`${style.filteritem.expanded}`, true); // TODO(randomuserhi): Make into a filteritem function called "toggleExpand" or something
                        }
                        page = page.parent as Page;
                    }
                    if (seek) {
                        setTimeout(() => {
                            let scroll: boolean = false;
                            if (this.body.scrollTop > 0) {
                                scroll = true;
                            } else {
                                this.body.scrollTop = 1;
                                if (this.body.scrollTop > 0) {
                                    scroll = true;
                                    this.body.scrollTop = 0;
                                }
                            }
                            if (scroll) {
                                this.body.scroll(0, directory.dom!.offsetTop - this.body.offsetTop);
                            }
                        }, 100);
                    }
                }
            }
        };

        return filterlist;
    })(), "molecules/filterlist", //html
    `
        <div rhu-id="body" class="${style.content}">
            <div style="font-weight: 800; font-size: 1.125rem;">Version</div>
            ${dropdown`rhu-id="version" style="
                width: 100%;
                border: solid 1px #eee;
                padding: 0.125rem 0.3rem;
            "`}
            <input spellcheck="false" rhu-id="search" type="text" style="
                width: 100%;
                border: solid 1px #eee;
                padding: 0.125rem 0.3rem;
            "/>
            <div style="
                width: 100%;
                overflow-x: auto;
            ">
                <ol rhu-id="path" class="${style.path}"></ol>
            </div>
            <div style="
                width: 100%;
                height: 1px;
                background-color: #eee;
            "></div>
            <ol rhu-id="list"></ol>
        </div>
        `, {
        element: //html
            `<div></div>`
    });

    return filterlist;
});