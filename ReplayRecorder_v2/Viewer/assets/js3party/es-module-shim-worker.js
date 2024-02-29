self.addEventListener('message', function(e) {
    if(typeof e.data.worker === "string" && typeof e.data.importMap === "string") {
        const importMapString = e.data.importMap;
        const importMap = JSON.parse(importMapString);
        importScripts("../js3party/es-module-shim.js");
        (importShim).addImportMap(importMap);
        importShim(e.data.worker)
            .then(() => {
                this.postMessage("es-module-shim-ready");
            })
            .catch(e => setTimeout(() => { throw e; }));
    }
});