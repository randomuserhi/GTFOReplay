declare namespace RHU {
    interface Modules {
        "docs": {
            sort(data: string[], opt?: "asc" | "desc"): string[];
            get(version: string): Docs | undefined;
            create(version: string, defaultPage?: string): Docs;
            versions: Map<string, Docs>;
            split(path: string): string[];
            jit?: (version: string, path: string) => RHUDocuscript.Page;
            // jit => Just In Time => catches the page onload just in time to cache it
        };
    }
}

interface PageLink {
    path: string;
    cache?: RHUDocuscript.Page;
    script?: HTMLScriptElement;
}

interface Directory {
    get(path: string): Page | undefined;
    set(path: string, page?: string, index?: number): void;
    setCache(path: string, page: RHUDocuscript.Page): void;
    fullPath(): string;
    sortedKeys(): string[];
    walk(job: (directory: Directory) => void): void; //NOTE(randomuserhi): Walks all children including nested, excluding current directory (the one you called walk on) -> maybe rename to walkChildren?

    index?: number;
    version: string;
    parent?: Directory;
    subDirectories: Map<string, Page>;
}

interface Docs extends Directory {
    defaultPage: string;
}

interface Page extends Directory  {
    name: string;
    page?: PageLink;
    dom?: Atoms.Filteritem;
}

RHU.module(new Error(), "docs", { 
}, function() {

    const versions = new Map<string, Docs>();

    interface DirectoryConstructor {
        new(version: string, name: string, parent?: Directory): Page;
        prototype: Page;
    }

    const split = (path: string): string[] => {
        const paths = path.split(/[/\\]/g);
        if (paths.length > 0 && paths[paths.length - 1].trim() === "") {
            return paths.slice(0, paths.length - 1);
        }
        return paths;
    };

    const Directory = function(this: Page, version: string, name: string, parent?: Directory) {
        this.version = version;
        this.name = name;
        this.parent = parent;
        this.subDirectories = new Map();
    } as unknown as DirectoryConstructor;
    Directory.prototype.get = function(path) {
        const paths = split(path);
        let current: Page | undefined = this;
        for (const p of paths) {
            if (!current) break;
            current = current.subDirectories.get(p);
        }
        return current;
    };
    Directory.prototype.set = function(path, page, index) {
        const paths = split(path);
        let current: Page = this;
        for (const p of paths) {
            if (!current.subDirectories.has(p)) {
                current.subDirectories.set(p, new Directory(this.version, p, current));
            }
            current = current.subDirectories.get(p)!;
        }
        if (page) {
            current.page = {
                path: page,
            };
        } else {
            current.page = undefined;
        }
        current.index = index;
    };
    Directory.prototype.setCache = function(path, cache) {
        const paths = split(path);
        let current: Page = this;
        for (const p of paths) {
            if (!current.subDirectories.has(p)) {
                current.subDirectories.set(p, new Directory(this.version, p, current));
            }
            current = current.subDirectories.get(p)!;
        }
        current.page = {
            path: path,
            cache,
        };
    };
    Directory.prototype.fullPath = function() {
        const path: string[] = [];
        for (let current: Directory | undefined = this; RHU.exists(current); current = current.parent) {
            if ((current as Page).name) {
                path.push((current as Page).name);
            }
        }
        return path.reverse().join("/");
    };
    Directory.prototype.sortedKeys = function() {
        return [...this.subDirectories.keys()].sort((a, b) => {
            const dirA = this.subDirectories.get(a)!;
            const dirB = this.subDirectories.get(b)!;
            if (dirA.index !== undefined && dirB.index !== undefined && dirA.index !== dirB.index) {
                return dirA.index - dirB.index;
            } else if (dirA.index !== undefined) {
                return -1;
            } else if (dirB.index !== undefined) {
                return 1;
            }
            return a.localeCompare(b);
        });
    };
    Directory.prototype.walk = function(job) {
        for (const dir of this.subDirectories.values()) {
            job(dir);
            dir.walk(job);
        }
    };

    interface DocsConstructor {
        new(version: string, defaultPage: string): Docs;
        prototype: Docs;
    }

    const Docs = function(this: Docs, version: string, defaultPage: string) {
        this.version = version;
        this.defaultPage = defaultPage;
        this.subDirectories = new Map();
    } as unknown as DocsConstructor;
    RHU.inherit(Docs, Directory);

    return {
        versions,
        get(version) {
            return versions.get(version);
        },
        create(version, defaultPage) {
            // TODO(randomuserhi): convert to object constructor
            const docs: Docs = new Docs(version, defaultPage ? defaultPage : "home");
            versions.set(version, docs);
            return docs;
        },
        sort(data, opt) {
            function isNumber(v: any): v is number {
                return (+v).toString() === v;
            }
        
            const sort = {
                asc: function (a: { index: number, value: string[] }, b: { index: number, value: string[] }) {
                    let i = 0;
                    const l = Math.min(a.value.length, b.value.length);
        
                    while (i < l && a.value[i] === b.value[i]) i++;
        
                    if (i === l) return a.value.length - b.value.length;
                    if (isNumber(a.value[i]) && isNumber(b.value[i])) return (a.value[i] as any) - (b.value[i] as any);
                    return a.value[i].localeCompare(b.value[i]);
                },
                desc: function (a: { index: number, value: string[] }, b: { index: number, value: string[] }) {
                    return sort.asc(b, a);
                }
            };
            const mapped = data.map((el, i) => {
                return {
                    index: i,
                    value: el.split('.')
                };
            });
        
            mapped.sort(sort[opt as keyof typeof sort] || sort.asc);
        
            return mapped.map(function (el) {
                return data[el.index];
            });
        },
        split,
    };
});