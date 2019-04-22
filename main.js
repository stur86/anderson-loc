function mod(x, size) {
    x = x < 0 ? x + Math.ceil(Math.abs(x) / size) * size : x;
    return x % size;
}

function AndersonModel(container) {
    this.cont = d3.select(container);

    this.size = 10;
    this.J = 2.0;
    this.omegaAvg = 5.0;
    this.omegaSpread = 2.0;

    this.cscales = {
        'Green on wine': {
            'bkg': '#592941', 
            'scale': chroma.scale(['#498467', '#EDE5A6']).mode('lch'),
        },
        'Blue and dark': {
            'bkg': '#4E4B5C',
            'scale': chroma.scale(['#4381C1', '#A37871']).mode('lrgb'),
        },
        'Tropical': {
            'bkg': '#52414C',
            'scale': chroma.scale(['#596157', '#E3655B']).mode('hsl'),
        },
        'Traffic light': {
            'bkg': '#362939',
            'scale':  chroma.scale(['#54BC61', '#E13D36']).mode('hsl'),
        }
    }
    this.colorScale = 'Traffic light';

    this.init();
}

function Site(i, j) {
    this.i = i;
    this.j = j;
    this.x = 0;
    this.v = 0;
    this.om = 0;
    this.k = 0;
    this.neighs = [];
}

Site.prototype = {
    set_omega: function (w) {
        this.om = Math.max(w, 0);
        this.k = w * w;
    },

    calc_F: function (J) {
        var F = -this.k * this.x;
        for (var i = 0; i < this.neighs.length; ++i) {
            F += J * (this.neighs[i].x - this.x);
        }

        return F;
    }, 
}

AndersonModel.prototype = {
    init: function () {
        // Initialise model
        this.csize = 100.0 / (this.size - 1) * 0.2;
        // Create nodes
        var matrix = [];
        for (var i = 0; i < this.size; ++i) {
            matrix.push([]);
            for (var j = 0; j < this.size; ++j) {
                var s = new Site(i, j);
                matrix[i].push(s);
            }
        }

        // Now assign the neighbours and frequencies
        var dn = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        this.sites = [];
        for (var i = 0; i < this.size; ++i) {
            for (var j = 0; j < this.size; ++j) {
                var n = matrix[i][j];
                for (var k = 0; k < 4; ++k) {
                    var i2 = mod(i + dn[k][0], this.size);
                    var j2 = mod(j + dn[k][1], this.size);
                    n.neighs.push(matrix[i2][j2]);
                }
                // Now assign the frequency
                n.set_omega(this.omegaAvg + this.omegaSpread * 2 * (Math.random() - 0.5));
                this.sites.push(n);
            }
        }

        // Create the visualisation
        this.set_cscale(this.colorScale);
        this.cont.html('');

        var spacing = 100.0 / (this.size - 1);
        var oA = this.omegaAvg;
        var oS = this.omegaSpread;
        var cscale = this.cscale;

        this.cont.selectAll("circle").data(this.sites)
            .enter()
            .append("circle")
            .attr('cx', function (d) {
                return d.i * spacing - 50;
            })
            .attr('cy', function (d) {
                return d.j * spacing - 50;
            })
            .attr('r', this.csize)
            .attr('fill', function (d) {
                if (oS > 0) 
                    return cscale((d.om - oA) / oS + 0.5).hex();
                else
                    return cscale(0.5).hex();                
            })
            .on('click', function(d) {
                d.x = 0.8;
            });
    },

    set_cscale: function(name) {
        this.cont.style('background-color', this.cscales[name].bkg);
        this.cscale = this.cscales[name].scale;
    },

    restart: function () {
        // Just an alias
        this.init();
        this.start(0.05);
    },

    start: function(dt) {
        var that = this;
        this.interval = setInterval(function() {
            that.evolve(dt/2); // x2 slowdown factor for clarity
        }, dt*1000); 
    },

    stop: function() {
        clearInterval(this.interval);
    },

    evolve: function (dt) {
        for (var i = 0; i < this.sites.length; ++i) {
            this.sites[i].x += this.sites[i].v*dt/2.0;
        }
        var forces = [];
        for (var i = 0; i < this.sites.length; ++i) {
            forces.push(this.sites[i].calc_F(this.J));
        }
        for (var i = 0; i < this.sites.length; ++i) {
            this.sites[i].v += forces[i]*dt;
        }
        for (var i = 0; i < this.sites.length; ++i) {
            this.sites[i].x += this.sites[i].v*dt/2.0;
        }

        var csize = this.csize;
        this.cont.selectAll("circle").data(this.sites).attr('r', function (d) {
            return csize * (1 + d.x);
        });

    }
}

var model = new AndersonModel('#main_plot');
model.restart()


var gui = new dat.GUI();
var csize = gui.add(model, 'size', 5, 15).step(1);
var cJ = gui.add(model, 'J', 0, 5.0);
var cOmAvg = gui.add(model, 'omegaAvg', 1.0, 10.0);
var cOmSpr = gui.add(model, 'omegaSpread', 0.0, 5.0);
var cScale = gui.add(model, 'colorScale', Object.keys(model.cscales));
gui.add(model, 'restart');

csize.onFinishChange(function () {
    model.restart();
});
cJ.onFinishChange(function () {
    model.restart();
});
cOmAvg.onFinishChange(function () {
    model.restart();
});
cOmSpr.onFinishChange(function () {
    model.restart();
});
cScale.onFinishChange(function() {
    model.restart();
});