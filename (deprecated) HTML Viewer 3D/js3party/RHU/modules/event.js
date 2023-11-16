(function () {
    let RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    RHU.import(RHU.module({ trace: new Error(),
        name: "rhu/event", hard: [],
        callback: function () {
            if (RHU.exists(RHU.eventTarget))
                console.warn("Overwriting RHU.EventTarget...");
            let isEventListener = function (callback) {
                return callback instanceof Function;
            };
            RHU.eventTarget = function (target) {
                let node = document.createTextNode("");
                let addEventListener = node.addEventListener.bind(node);
                target.addEventListener = function (type, callback, options) {
                    let context = target;
                    if (isEventListener(callback))
                        addEventListener(type, ((e) => { callback.call(context, e.detail); }), options);
                    else
                        addEventListener(type, ((e) => { callback.handleEvent.call(context, e.detail); }), options);
                };
                target.removeEventListener = node.removeEventListener.bind(node);
                target.dispatchEvent = node.dispatchEvent.bind(node);
            };
        }
    }));
})();
