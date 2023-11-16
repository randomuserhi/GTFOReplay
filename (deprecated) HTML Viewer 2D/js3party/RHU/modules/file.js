(function () {
    let RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    RHU.import(RHU.module({ trace: new Error(),
        name: "rhu/file", hard: ["FileReader", "Promise"],
        callback: function () {
            if (RHU.exists(RHU.File))
                console.warn("Overwriting RHU.File...");
            let File = RHU.File = {
                Type: {
                    unknown: "unknown",
                    png: "png",
                    gif: "gif",
                    jpg: "jpg",
                    txt: "txt",
                    js: "text/javascript",
                    mp4: "video/mp4",
                    mkv: "video/x-matroska",
                    toType: function (blobType) {
                        let type;
                        switch (blobType) {
                            case "text/javascript":
                                type = this.js;
                                break;
                            case "video/mp4":
                                type = this.mp4;
                                break;
                            case "image/png":
                                type = this.png;
                                break;
                            case "video/x-matroska":
                                type = this.mkv;
                                break;
                            default:
                                console.warn(`Unknown blob type: ${blobType}`);
                                type = this.unknown;
                                break;
                        }
                        return type;
                    }
                },
            };
            let Type = RHU.File.Type;
            File.getType = function (blob) {
                return new Promise((resolve, reject) => {
                    let fr = new FileReader();
                    fr.onloadend = function (e) {
                        let arr = (new Uint8Array(e.target.result)).subarray(0, 4);
                        let header = "";
                        for (let i = 0; i < arr.length; i++)
                            header += arr[i].toString(16);
                        let type;
                        switch (header) {
                            case "89504e47":
                                type = Type.png;
                                break;
                            case "47494638":
                                type = Type.gif;
                                break;
                            case "ffd8ffe0":
                            case "ffd8ffe1":
                            case "ffd8ffe2":
                            case "ffd8ffe3":
                            case "ffd8ffe8":
                                type = Type.jpg;
                                break;
                            default:
                                type = Type.unknown;
                                break;
                        }
                        resolve([Type.toType(blob.type), type]);
                    };
                    fr.onerror = function (e) {
                        reject(e);
                    };
                    fr.readAsArrayBuffer(blob);
                });
            };
        }
    }));
})();
