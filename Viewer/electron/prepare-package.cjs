const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');

// Forge packages build/, so its runtime dependencies must be staged there too.
// Copy the already installed dependency tree to preserve the lockfile versions.
module.exports = async function preparePackage() {
    const modules = path.join(__dirname, 'node_modules');
    const target = path.join(__dirname, 'build', 'node_modules');
    const manifest = require('./forge/package.json');
    const visited = new Set();
    async function copy(name, from) {
        const resolve = createRequire(from);
        let entry;
        try { entry = resolve.resolve(`${name}/package.json`); }
        catch { entry = resolve.resolve(name); }
        let dir = path.dirname(entry), pkg;
        while (true) {
            try { pkg = JSON.parse(await fs.readFile(path.join(dir, 'package.json'), 'utf8')); }
            catch (error) { if (error.code !== 'ENOENT') throw error; }
            if (pkg?.name === name) break;
            const parent = path.dirname(dir);
            if (dir === parent) throw new Error(`Cannot locate installed dependency ${name}`);
            dir = parent;
        }
        if (visited.has(dir)) return;
        visited.add(dir);
        const relative = path.relative(modules, dir);
        if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Dependency is outside node_modules: ${name}`);
        await fs.cp(dir, path.join(target, relative), { recursive: true, filter: source => source === dir || path.basename(source) !== 'node_modules' });
        for (const dependency of Object.keys(pkg.dependencies ?? {})) await copy(dependency, path.join(dir, 'package.json'));
    }
    for (const name of Object.keys(manifest.dependencies)) await copy(name, path.join(__dirname, 'package.json'));
    console.log(`Staged ${visited.size} installed runtime packages.`);
};
