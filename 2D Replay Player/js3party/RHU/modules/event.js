(function () {
    const RHU = window.RHU;
    if (RHU === null || RHU === undefined)
        throw new Error("No RHU found. Did you import RHU before running?");
    RHU.module(new Error(), "rhu/event", {}, function () {
        let isEventListener = function (callback) {
            return callback instanceof Function;
        };
        const eventTarget = function (target) {
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
        return eventTarget;
    });
})();
