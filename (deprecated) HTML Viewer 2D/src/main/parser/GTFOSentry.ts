declare var GTFOSentry: GTFOSentryConstructor;
interface Window
{
    GTFOSentry: GTFOSentryConstructor;
}

interface GTFOSentry
{
    instance: number;
    owner: bigint;
}
interface GTFOSentryConstructor
{
    new(instance: number, owner: bigint): GTFOSentry;
    prototype: GTFOSentry;
}

(function() {

    let GTFOSentry: GTFOSentryConstructor = window.GTFOSentry = function(this: GTFOSentry, instance: number, owner: bigint)
    {
        this.instance = instance;
        this.owner = owner;
    } as Function as GTFOSentryConstructor;

})();