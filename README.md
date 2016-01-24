# Hands-on Bluetooth Low Energy Workshop
## PhoneGap Day 2016

Projects require [TI CC2650 SensorTag](http://ti.com/sensortag).

Projects are intended to be run with [PhoneGap Developer App](http://app.phonegap.com). See the workshop book for detailed instructions.

Template Project

  * [Template](template/)

Solutions

 * [Scan](scan/)
 * [Connect](connect/)
 * [Button](button/)
 * [Button v2](button_v2/)
 * [LED](led/)
 * [LED v2](led_v2/)
 * [Thermometer](thermometer/)

Projects can be run with Cordova

    $ cd path/to/project
    $ cordova platform add ios android
    $ cordova plugin add cordova-plugin-ble-central
    $ cordova plugin add cordova-plugin-dialogs
