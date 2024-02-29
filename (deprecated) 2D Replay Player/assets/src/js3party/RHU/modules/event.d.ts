declare namespace RHU {
    interface Modules
    {
        "rhu/event": <T extends EventTarget>(target: T) => void;
    }
}