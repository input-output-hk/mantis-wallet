const Application = require('spectron').Application;
const electronPath = require('electron');
const path = require('path');
const APP_CONF = require('../config/appConfig.js');
const {setDefaultTimeout} = require('@cucumber/cucumber');
setDefaultTimeout(180 * 1000);

const app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..', '..', '..', 'build.AppImage')],
    startTimeout: APP_CONF.START_TIMEOUT,
})

app.start().then(function () {
    // Check if the window is visible
    console.log(app.browserWindow)
    return app.browserWindow.isVisible()
}).then(function (isVisible) {
    // Verify the window is visible
    console.log(isVisible)
    assert.equal(isVisible, true)
}).then(function () {
    // Get the window's title
    console.log(app.client.getTitle())
}).catch(e => {
    console.log(e)
})

module.exports = {
    app
}
