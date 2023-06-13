interface GTFOTimeline<T = unknown>
{
    type: "event" | "dynamic";
    time: number;
    tick: number;
    detail: T;
}

interface GTFODynamic
{
    position: Vector;
    rotation: Quaternion;
}

interface GTFOEvent<T extends keyof GTFOEventMap = "unknown"> 
{
    type: GTFOEventType;
    detail: GTFOEventMap[T];
}

interface GTFOEventMap
{
    "unknown": unknown;

    "playerJoin": GTFOEventPlayerJoin;
    "playerLeave": GTFOEventPlayerLeave;
}

type GTFOEventType = "playerJoin" | "playerLeave";
interface Window
{
    eventMap: GTFOEventType[];
}
let eventMap: GTFOEventType[] = [
    "playerJoin", 
    "playerLeave"
];

interface GTFOEventPlayerJoin
{
    player: bigint;
    instance: number;
}

interface GTFOEventPlayerLeave
{
    player: bigint;
    instance: number;
}