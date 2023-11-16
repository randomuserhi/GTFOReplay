interface RHU
{

    eventTarget?<T extends EventTarget>(target: T): void;
}