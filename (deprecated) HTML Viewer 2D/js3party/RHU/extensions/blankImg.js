(function () {
    let RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    RHU.import(RHU.module({ trace: new Error(),
        name: "x-rhu/blankImg", hard: [],
        callback: function () {
            if (RHU.exists(RHU.blankImg))
                console.warn("Overwriting RHU.blankImg...");
            RHU.blankImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
        }
    }));
})();
