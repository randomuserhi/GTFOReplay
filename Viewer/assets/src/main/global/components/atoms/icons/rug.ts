import { Constructor, Macro } from "@/rhu/macro.js";

declare module "@/rhu/macro.js" {
    interface TemplateMap {
        "atoms/icons/rug": rug;
    }
}

export interface rug extends SVGElement {
}

export const rug = Macro((() => {
    const rug = function(this: rug) {
    } as Constructor<rug>;

    return rug;
})(), "atoms/icons/rug", //html
`
    <defs><clipPath id="clip0"><rect x="1844" y="586" width="848" height="970"/></clipPath></defs><g clip-path="url(#clip0)" transform="translate(-1844 -586)"><path d="M2615.91 877.272 2614.03 1273.6 2272.35 1470.87 1928.18 1274.33 1930.06 878.004 2271.74 680.734Z" fill="#404040" fill-rule="evenodd"/><path d="M2270.08 681.694 2267.22 1077.3 1925.65 1274.51 1928.5 878.901Z" fill="#595959" fill-rule="evenodd"/><path d="M0 344.952 202.494 0 594.693 0 392.199 344.952Z" fill="#7F7F7F" fill-rule="evenodd" transform="matrix(-0.866025 0.5 0.5 0.866025 2440.53 975.454)"/><path d="M2267.5 856 2457 966.607 2457 1184.39 2267.5 1295 2078 1184.39 2078 966.607Z" fill="#00B0F0" fill-rule="evenodd"/><path d="M2078 968 2267 1078.95 2267 1297 2078 1186.05Z" fill="#0070C0" fill-rule="evenodd"/><path d="M0 191 112.121 0 329 0 216.879 191Z" fill="#002060" fill-rule="evenodd" transform="matrix(6.12323e-17 1 1 -6.12323e-17 2266 967)"/><path d="M1932 1371 1844 1319.61 1844 858 1932 909.389Z" fill="#FFFFFF" fill-rule="evenodd"/><path d="M1907.75 895.349 2226.21 1079.21 2183.51 1153.17 1865.05 969.311Z" fill="#FFFFFF" fill-rule="evenodd"/><path d="M2246 1375 2158 1323.61 2158 1039 2246 1090.39Z" fill="#FFFFFF" fill-rule="evenodd"/><path d="M1898.33 1062.79 2216.79 1246.66 2168.65 1330.04 1850.19 1146.17Z" fill="#FFFFFF" fill-rule="evenodd"/><path d="M2005.42 1125.82 2032.44 1141.42 2246.19 1450.64 2246.19 1553.11 2169.31 1508.72 1937.21 1172.98Z" fill="#FFFFFF" fill-rule="evenodd"/><path d="M513 0 51.5539 0 0 89 462.03 89Z" fill="#FFFFFF" fill-rule="evenodd" transform="matrix(-1.83697e-16 -1 -1 1.83697e-16 2376 1556)"/><path d="M2634.25 894.472 2681.1 975.619 2362.64 1159.48 2315.79 1078.34Z" fill="#FFFFFF" fill-rule="evenodd"/><path d="M159 0 51.2043 0 0 88 108.375 88Z" fill="#FFFFFF" fill-rule="evenodd" transform="matrix(-1.83697e-16 -1 -1 1.83697e-16 2692 1020)"/><path d="M2643.07 1238.28 2689.65 1318.96 2689.65 1322.56 2370.16 1507.02 2322.02 1423.64Z" fill="#FFFFFF" fill-rule="evenodd"/><path d="M0 88 51.3884 0 276 0 224.612 88Z" fill="#FFFFFF" fill-rule="evenodd" transform="matrix(-1.83697e-16 -1 -1 1.83697e-16 2690 1371)"/><path d="M2614 1101.72 2651.81 1167.21 2543.71 1229.63 2505.9 1164.14Z" fill="#FFFFFF" fill-rule="evenodd"/><path d="M168 0 51.4399 0 0 88 117.142 88Z" fill="#FFFFFF" fill-rule="evenodd" transform="matrix(-1.83697e-16 -1 -1 1.83697e-16 2690 1226)"/><path d="M138 0 50.8143 0 0 88 87.1857 88Z" fill="#FFFFFF" fill-rule="evenodd" transform="matrix(-1.83697e-16 -1 -1 1.83697e-16 2554 1274)"/><path d="M1950.99 771.179 2351.74 1002.55 2266.33 1051.86 1865.58 820.486Z" fill="#FFFFFF" fill-rule="evenodd"/><path d="M2584.65 770.559 2670.05 819.867 2267.22 1052.44 2181.82 1003.13Z" fill="#FFFFFF" fill-rule="evenodd"/><path d="M2265.32 586.229 2613.02 786.977 2570.78 860.138 2180.38 634.736Z" fill="#FFFFFF" fill-rule="evenodd"/></g>
    `, {
    element: //html
        `<svg style="width: 100%; height: 100%;" viewbox="0 0 848 970" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" overflow="hidden"></svg>`
});