RHU.module(new Error(), "docs", {}, function () {
    const versions = new Map();
    const split = (path) => {
        const paths = path.split(/[/\\]/g);
        if (paths.length > 0 && paths[paths.length - 1].trim() === "") {
            return paths.slice(0, paths.length - 1);
        }
        return paths;
    };
    const Directory = function (version, name, parent) {
        this.version = version;
        this.name = name;
        this.parent = parent;
        this.subDirectories = new Map();
    };
    Directory.prototype.get = function (path) {
        const paths = split(path);
        let current = this;
        for (const p of paths) {
            if (!current)
                break;
            current = current.subDirectories.get(p);
        }
        return current;
    };
    Directory.prototype.set = function (path, page, index) {
        const paths = split(path);
        let current = this;
        for (const p of paths) {
            if (!current.subDirectories.has(p)) {
                current.subDirectories.set(p, new Directory(this.version, p, current));
            }
            current = current.subDirectories.get(p);
        }
        if (page) {
            current.page = {
                path: page,
            };
        }
        else {
            current.page = undefined;
        }
        current.index = index;
    };
    Directory.prototype.setCache = function (path, cache) {
        const paths = split(path);
        let current = this;
        for (const p of paths) {
            if (!current.subDirectories.has(p)) {
                current.subDirectories.set(p, new Directory(this.version, p, current));
            }
            current = current.subDirectories.get(p);
        }
        current.page = {
            path: path,
            cache,
        };
    };
    Directory.prototype.fullPath = function () {
        const path = [];
        for (let current = this; RHU.exists(current); current = current.parent) {
            if (current.name) {
                path.push(current.name);
            }
        }
        return path.reverse().join("/");
    };
    Directory.prototype.sortedKeys = function () {
        return [...this.subDirectories.keys()].sort((a, b) => {
            const dirA = this.subDirectories.get(a);
            const dirB = this.subDirectories.get(b);
            if (dirA.index !== undefined && dirB.index !== undefined && dirA.index !== dirB.index) {
                return dirA.index - dirB.index;
            }
            else if (dirA.index !== undefined) {
                return -1;
            }
            else if (dirB.index !== undefined) {
                return 1;
            }
            return a.localeCompare(b);
        });
    };
    Directory.prototype.walk = function (job) {
        for (const dir of this.subDirectories.values()) {
            job(dir);
            dir.walk(job);
        }
    };
    const Docs = function (version, defaultPage) {
        this.version = version;
        this.defaultPage = defaultPage;
        this.subDirectories = new Map();
    };
    RHU.inherit(Docs, Directory);
    return {
        versions,
        get(version) {
            return versions.get(version);
        },
        create(version, defaultPage) {
            const docs = new Docs(version, defaultPage ? defaultPage : "home");
            versions.set(version, docs);
            return docs;
        },
        sort(data, opt) {
            function isNumber(v) {
                return (+v).toString() === v;
            }
            const sort = {
                asc: function (a, b) {
                    let i = 0;
                    const l = Math.min(a.value.length, b.value.length);
                    while (i < l && a.value[i] === b.value[i])
                        i++;
                    if (i === l)
                        return a.value.length - b.value.length;
                    if (isNumber(a.value[i]) && isNumber(b.value[i]))
                        return a.value[i] - b.value[i];
                    return a.value[i].localeCompare(b.value[i]);
                },
                desc: function (a, b) {
                    return sort.asc(b, a);
                }
            };
            const mapped = data.map((el, i) => {
                return {
                    index: i,
                    value: el.split('.')
                };
            });
            mapped.sort(sort[opt] || sort.asc);
            return mapped.map(function (el) {
                return data[el.index];
            });
        },
        split,
    };
});
