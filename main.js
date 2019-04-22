function mod(x, size) {
    x = x < 0? x + Math.ceil(Math.abs(x)/size)*size : x;
    return x%size;
}

function AndersonModel(container) {
    this.cont = d3.select(container);

    this.size = 10;
    this.J = 2.0;
    this.omegaAvg = 5.0;
    this.omegaSpread = 2.0;

    this.init();
}

function Site() {
    this.x = 0;
    this.v = 0;
    this.k = 0;
    this.neighs = [];
}

AndersonModel.prototype = {
    init: function() {
        // Initialise model
        this.csize = 100.0/(this.size-1)*0.2;
        // Create nodes
        var matrix = [];
        for (var i = 0; i < this.size; ++i) {
            matrix.push([]);
            for (var j = 0; j < this.size; ++j) {
                var s = new Site();
                matrix[i].push(s);
            }
        }

        // Now assign the neighbours and frequencies
        var dn = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        this.sites = [];
        for (var i = 0; i < this.size; ++i) {
            for (var j = 0; j < this.size; ++j) {
                var n = matrix[i][j];
                for (var k = 0; k < 4; ++k) {
                    var i2 = mod(i + dn[k][0], this.size);
                    var j2 = mod(j + dn[k][1], this.size);
                    n.neighs.push(matrix[i2][j2]);
                }
                this.sites.push(n);
            }
        }
    }
}

var model = new AndersonModel();


var gui = new dat.GUI();
var csize = gui.add(model, 'size', 5, 15).step(1);
var cJ = gui.add(model, 'J', 0, 5.0);
var cOmAvg = gui.add(model, 'omegaAvg', 1.0, 10.0);
var cOmSpr = gui.add(model, 'omegaSpread', 1.0, 5.0);

csize.onFinishChange(function() {
    console.log(model);
});