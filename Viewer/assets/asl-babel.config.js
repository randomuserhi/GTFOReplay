module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            Object.assign({}, process.env.NODE_ENV === "test"
                ? {
                    "loose": true,
                    "targets": {
                        "node": 8,
                        "browsers": [">0.25%","not IE"]
                    }
                }
                : {
                    "useBuiltIns": "entry", 
                    "corejs": "3.8", 
                    "targets": {
                        "browsers": "defaults, not ie 11, not ie_mob 11"
                    },
                    "modules": false
                }
            )
        ]
    ],
    "plugins": [
        "./asl-babel-plugin"
    ],
};