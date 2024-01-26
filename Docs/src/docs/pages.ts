declare namespace RHU {
    interface Modules {
        "docuscript/pages": {
            loadingPage: RHUDocuscript.Page;
            failedToLoadPage: RHUDocuscript.Page;
            pageNotFound: RHUDocuscript.Page;
            versionNotFound: RHUDocuscript.Page;
            directoryPage: (directory: Page) => RHUDocuscript.Page;
        };
    }
}

RHU.module(new Error(), "docuscript/pages", {
    rhuDocuscript: "docuscript",
}, function({
    rhuDocuscript,
}) {
   
    const loadingPage = docuscript<RHUDocuscript.Language, RHUDocuscript.FuncMap>(({
        h
    }) => {
        h(1, "Page is loading.");
    }, rhuDocuscript);
    
    const failedToLoadPage = docuscript<RHUDocuscript.Language, RHUDocuscript.FuncMap>(({
        h
    }) => {
        h(1, "Page failed to load.");
    }, rhuDocuscript);
    
    const pageNotFound = docuscript<RHUDocuscript.Language, RHUDocuscript.FuncMap>(({
        h
    }) => {
        h(1, "Page not found.");
    }, rhuDocuscript);
    
    const versionNotFound = docuscript<RHUDocuscript.Language, RHUDocuscript.FuncMap>(({
        h
    }) => {
        h(1, "Version not found.");
    }, rhuDocuscript);
    
    const directoryPage = (directory: Page) => {
        return docuscript<RHUDocuscript.Language, RHUDocuscript.FuncMap>(({
            pl, br
        }) => {
            for (const subDir of directory.sortedKeys()) {
                const dir = directory.subDirectories.get(subDir)!;
                pl([dir.fullPath()], 
                    subDir
                );
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