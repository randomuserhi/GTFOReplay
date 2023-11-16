interface RHU
{

    Bezier?: (x0: number, y0: number, x1: number, y1: number) => ((t: number) => number);
}