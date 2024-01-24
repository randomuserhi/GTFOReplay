RHU.module(new Error(), "docuscript/pages", {
    rhuDocuscript: "docuscript",
}, function ({ rhuDocuscript, }) {
    const loadingPage = docuscript(({ h }) => {
        h(1, "Page is loading.");
    }, rhuDocuscript);
    const failedToLoadPage = docuscript(({ h }) => {
        h(1, "Page failed to load.");
    }, rhuDocuscript);
    const pageNotFound = docuscript(({ h }) => {
        h(1, "Page not found.");
    }, rhuDocuscript);
    const versionNotFound = docuscript(({ h }) => {
        h(1, "Version not found.");
    }, rhuDocuscript);
    const directoryPage = (directory) => {
        return docuscript(({ pl, br }) => {
            for (const subDir of directory.sortedKeys()) {
                const dir = directory.subDirectories.get(subDir);
                pl([dir.fullPath()], subDir);
                br();
            }
        }, rhuDocuscript);
    };
    return {
        loadingPage,
        failedToLoadPage,
        pageNotFound,
        versionNotFound,
        directoryPage,
    };
});
