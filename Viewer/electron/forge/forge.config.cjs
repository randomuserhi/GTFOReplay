// eslint-disable-next-line no-undef
module.exports = {
    hooks: {
        prePackage: require('../prepare-package.cjs'),
        packageAfterCopy: async (_config, buildPath) => {
            const fs = require('node:fs/promises');
            const manifestPath = require('node:path').join(buildPath, 'package.json');
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
            delete manifest.devDependencies;
            delete manifest.config;
            await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        },
    },
    packagerConfig: {
        "dir": "./build",
        // preparePackage stages only production packages at locked versions.
        "prune": false,
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {},
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
};
