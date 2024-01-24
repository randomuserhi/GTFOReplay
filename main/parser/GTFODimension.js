(function () {
    let GTFODimension = window.GTFODimension = function (index, map) {
        this.index = index;
        this.map = map;
    };
    GTFODimension.parse = function (bytes, reader) {
        let index = BitHelper.readByte(bytes, reader);
        let map = GTFOMap.parse(bytes, reader);
        return new GTFODimension(index, map);
    };
})();
