// Require
var sensorLib = require('node-dht-sensor');
var express = require('express');
var app = express();
var piREST = require('pi-arest')(app);
// Configure app
// app.set('views', __dirname + '/views');
// app.set('view engine', 'jade');
// app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Serve interface
app.get('/interface', function(req, res){
    res.render('interface');
});

// Set Pi properties
piREST.set_id('l4dgx9');
piREST.set_name('Lab-RPi');

// Make measurements from sensors
function sensorObj(errors, isValid, temperature, humidity){
    this.errors = errors;
    this.isValid = isValid;
    this.temperature = temperature;
    this.humidity = humidity;
}


var dht_sensor = {
    initialize: function () {
        return sensorLib.initialize(22, 4);
    },
    read: function () {
        var readout = sensorLib.read();
        var temp = readout.temperature.toFixed(2);
        var convertedTemp = temp * 9/5 +32;
        var returnData = new sensorObj(
            readout.errors, 
            readout.isValid,
            convertedTemp,
            readout.humidity.toFixed(1));

        // piREST.variable('temperature',readout.temperature.toFixed(2));
        // piREST.variable('humidity', readout.humidity.toFixed(2));
        piREST.variable('sensorData', returnData);
        
        console.log('Temperature: ' + convertedTemp+ 'F, ' +
            'humidity: ' + readout.humidity.toFixed(2) + '%');
        setTimeout(function () {
            dht_sensor.read();
        }, 2000);
    }
};
if (dht_sensor.initialize()) {
    dht_sensor.read();
} else {
    console.warn('Failed to initialize sensor');
}

piREST.connect();

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});