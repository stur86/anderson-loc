function AndersonModel(container) {
    this.cont = d3.select(container);

    this.size = 10;
    this.J = 2.0;
    this.omegaAvg = 5.0;
    this.omegaSpread = 2.0;

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