(function() {
    var QuakeLayer = {
        quakes: [],
        colors: [
            $.Color('rgba(0,0,255,0.5)'),   // from blue, the oldest
            $.Color('rgba(255,255,0,0.5)'), // to yellow
            $.Color('rgba(255,0,0,0.5)')    // to red, the most recent
        ],

        initialize: function (map) {
            var that = this;
            var layerOpts = {
                map: map,
                animate: false,
                resizeHandler: function () {},
                updateHandler: function () { that.update(); }
            };

            this.map = map;
            this.layer = new CanvasLayer(layerOpts);
            this.context = this.layer.canvas.getContext('2d');
            this.getData();
        },

        update: function () {
            var that = this;
            var canvasWidth = this.layer.canvas.width;
            var canvasHeight = this.layer.canvas.height;
            var projection = this.map.getProjection();
            var circle = function (point, radius, progress) {
                that.context.fillStyle = that.getColor(progress).toRgbaString();
                that.context.beginPath();
                that.context.arc(point.x, point.y, radius/50, 0, 2 * Math.PI, false);
                that.context.fill();
                that.context.lineWidth = 0.001;
                that.context.strokeStyle = '#333333';
                that.context.stroke();
                that.context.closePath();
            };

            this.context.clearRect(0, 0, canvasWidth, canvasHeight);
            this.context.setTransform(1, 0, 0, 1, 0, 0);

            var scale = Math.pow(2, this.map.zoom);
            this.context.scale(scale, scale);

            var offset = projection.fromLatLngToPoint(this.layer.getTopLeft());
            this.context.translate(-offset.x, -offset.y);

            this.quakes.forEach(function (quake, i, a) {
                var lat = parseFloat(quake.lat.replace(',', '.'));
                var lng = parseFloat(quake.lon.replace(',', '.'));
                var mag = parseFloat(quake.s.replace(',', '.'));
                var latLng = new google.maps.LatLng(lat, lng);
                var point = projection.fromLatLngToPoint(latLng);

                circle(point, mag, i/a.length);
            });
        },

        getColor: function (progress) {
            if (progress === 0) progress = 0.00001;
            var index = progress * (this.colors.length - 1);
            var color1 = this.colors[Math.ceil(index) - 1];
            var color2 = this.colors[Math.ceil(index)];

            return color1.transition(color2, index - Math.floor(index));
        },

        getData: function () {
            var that = this;

            $.get('http://www.vedur.is/skjalftar-og-eldgos/jardskjalftar')
            .done(function (data) {
                if (!data || data.results.length !== 1)
                    return;

                var start = data.results[0].indexOf('VI.quakeInfo = [') + 15;
                var end = data.results[0].indexOf(']', start) + 1;

                if (start === -1)
                    return;

                // Never do this
                that.quakes = eval(data.results[0].substring(start, end)); // jshint ignore:line
                that.update();
            });
        }
    };

    $(document).ready(function () {
        var container = $('#map')[0];

        var map = new google.maps.Map(container, {
            zoom: 7,
            mapTypeControl: false,
            center: new google.maps.LatLng(64.8167, -18.8167),
            mapTypeId: google.maps.MapTypeId.SATELLITE,
        });

        QuakeLayer.initialize(map);
    });
})();
