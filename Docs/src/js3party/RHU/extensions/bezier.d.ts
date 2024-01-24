declare namespace RHU {
    interface Modules
    {
        "x-rhu/bezier": (x0: number, y0: number, x1: number, y1: number) => ((t: number) => number);
    }
}