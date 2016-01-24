var THERMOMETER_SERVICE = 'f000aa00-0451-4000-b000-000000000000';
var DATA_CHARACTERISTIC = 'f000aa01-0451-4000-b000-000000000000';
var CONFIGURATION_CHARACTERISTIC = 'f000aa02-0451-4000-b000-000000000000';

// Based on code from http://bit.ly/sensortag-temp
var toCelsius = function(rawMeasurement) { // raw number should be unsigned 16 bit
    var SCALE_LSB = 0.03125;
    return (rawMeasurement >> 2) * SCALE_LSB;
};

var toFahrenheit = function(rawMeasurement) {
    var celsius = toCelsius(rawMeasurement);
    return (celsius * 1.8 + 32.0);
};

var app = {
    initialize: function() {
        this.bindEvents();
        this.showMainPage();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('backbutton', this.onBackButton, false);
        deviceList.addEventListener('click', this.connect, false);
        refreshButton.addEventListener('click', this.refreshDeviceList, false);
        disconnectButton.addEventListener('click', this.disconnect, false);
    },
    onDeviceReady: function() {
        FastClick.attach(document.body); // https://github.com/ftlabs/fastclick
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = ''; // empty the list
        ble.scan(['AA80'], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li');
        listItem.innerHTML = device.name + '<br/>' +
            device.id + '<br/>' +
            'RSSI: ' + device.rssi;
        listItem.dataset.deviceId = device.id;
        deviceList.appendChild(listItem);
    },
    connect: function(e) {
        var deviceId = e.target.dataset.deviceId;
        ble.connect(deviceId, app.onConnect, app.onError);
    },
    onConnect: function(peripheral) {
        app.peripheral = peripheral;

        // enable the temperature sensor
        ble.write(
            peripheral.id,
            THERMOMETER_SERVICE,
            CONFIGURATION_CHARACTERISTIC,
            new Uint8Array([1]).buffer,
            app.showDetailPage,
            app.onError
        );

        // subscribe to be notified when the button state changes
        ble.startNotification(
            peripheral.id,
            THERMOMETER_SERVICE,
            DATA_CHARACTERISTIC,
            app.onTemperatureChange,
            app.onError
        );
    },
    onTemperatureChange: function(buffer) {
        // expecting 2 unsigned 16 bit values
        var data = new Uint16Array(buffer);

        var rawInfraredTemp = data[0];
        var rawAmbientTemp = data[1];

        var unit = 'F';
        var infraredTemp = toFahrenheit(rawInfraredTemp);
        var ambientTemp = toFahrenheit(rawAmbientTemp);
        // var unit = 'C';
        // var infraredTemp = toCelsius(rawInfraredTemp);
        // var ambientTemp = toCelsius(rawAmbientTemp);

        var message = 'Infrared: ' + infraredTemp.toFixed(1) + ' &deg;' + unit + '<br/>' +
                      'Ambient:  ' + ambientTemp.toFixed(1) + ' &deg;' + unit + '<br/>';

        statusDiv.innerHTML = message;

    },
    disconnect: function(e) {
        if (app.peripheral && app.peripheral.id) {
            ble.disconnect(app.peripheral.id, app.showMainPage, app.onError);
        }
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onBackButton: function() {
        if (mainPage.hidden) {
            app.disconnect();
        } else {
            navigator.app.exitApp();
        }
    },
    onError: function(reason) {
        navigator.notification.alert(reason, app.showMainPage, 'Error');
    }
};

app.initialize();
