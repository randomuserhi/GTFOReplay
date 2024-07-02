/// === START TYPESCRIPT BOILERPLATE ===

import type { ASLModule, Exports, Require } from "./async-script-loader";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const require: Require;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const exports: Exports;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const __ASLModule__: ASLModule;

/// === END TYPESCRIPT BOILERPLATE ===

exports.c = "c";

__ASLModule__.destructor = () => {
    console.log("destruct c");
};