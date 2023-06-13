declare var GTFODimension: GTFODimensionConstructor;
interface Window
{
    GTFODimension: GTFODimensionConstructor;
}

interface GTFODimension
{
    index: number;
    map: GTFOMap;
}
interface GTFODimensionConstructor
{
    new(index: number, map: GTFOMap): GTFODimension;
    prototype: GTFODimension;

    parse(bytes: DataView, reader: Reader): GTFODimension;
}

(function() {

    let GTFODimension: GTFODimensionConstructor = window.GTFODimension = function(this: GTFODimension, index: number, map: GTFOMap)
    {
        this.index = index;
        this.map = map;
    } as Function as GTFODimensionConstructor;

    GTFODimension.parse = function(bytes: DataView, reader: Reader): GTFODimension
    {
        let index = BitHelper.readByte(bytes, reader);
        let map = GTFOMap.parse(bytes, reader);
        return new GTFODimension(index, map);
    }

})();