(function () {
    let GTFOTongue = window.GTFOTongue = function (instance, dimensionIndex) {
        this.dimensionIndex = dimensionIndex;
        this.instance = instance;
        this.lerp = 0;
        this.spline = [];
    };
    GTFOTongue.clone = function (tongue) {
        let t = new GTFOTongue(tongue.instance, tongue.dimensionIndex);
        t.lerp = tongue.lerp;
        t.spline = tongue.spline;
        return t;
    };
})();
