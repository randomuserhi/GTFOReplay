module.manual = true;
export const __header__ = "__header___"; 

const headers = [
    import("../modules/datablocks/enemy/animation.js"),
    import("../modules/datablocks/enemy/enemy.js"),
    import("../modules/datablocks/enemy/handles.js"),
    import("../modules/datablocks/enemy/model.js"),
    import("../modules/datablocks/gear/animation.js"),
    import("../modules/datablocks/gear/models.js"),
    import("../modules/datablocks/items/item.js"),
    import("../modules/datablocks/items/models.js"),
    import("../modules/datablocks/lib.js"),
    import("../modules/datablocks/player/animation.js"),
    import("../modules/datablocks/player/model.js"),
    import("../modules/datablocks/player/player.js"),
    import("../modules/datablocks/stickfigure.js"),
];
Promise.all(headers).then(() => {
    const datablocks = [ 
        import("./datablocks/enemy/enemy.js"),
        import("./datablocks/enemy/model.js"),
        import("./datablocks/gear/models.js"),
        import("./datablocks/items/item.js"),
        import("./datablocks/items/models.js"),
        import("./datablocks/stickfigure.js"),
    ];
    return Promise.all(datablocks);
}).then(() => {
    module.ready();
});