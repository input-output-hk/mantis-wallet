const {When, Then} = require('@cucumber/cucumber');
const settingsPage = require('../pages/SettingsPage')
const loggedInPage = require('../pages/LoggedInPage.js')
const TD = require('../test_data/testData.json')

When(/^I click on settings button on main page$/, async () => {
    await loggedInPage.goToSettings()
});
Then(/^I expect to see my settings page$/, async () => {
    await settingsPage.checkIfYouAreOnSettingsPage()
});
Then(/^I click enable dark mode$/, async () => {
    await settingsPage.darkModeToggle()
});
Then(/^I expect to see color theme changed$/, async () => {
    await settingsPage.checkColorThemeChanges()
});
Then(/^I can change language, date format and time format$/, async () => {
    await settingsPage.checkLanguageOptions()
    await settingsPage.checkDateOptions()
    await settingsPage.checkTimeOptions()
});
Then(/^I change "([^"]*)" in Settings$/, async (network) => {
    await settingsPage.checkNetworkOptions(network)
});
Then(/^I can check wallet directory$/, async () => {
    await settingsPage.checkCurrentDirectory()
});
Then(/^I click Export private key button$/, async ()=> {
    await settingsPage.clickOnExportPrivateKey()
});
Then(/^I enter my password and click unlock$/, async ()=> {
    await settingsPage.enterPassword(TD.RestoreWallet.Password)
    await settingsPage.clickOnUnlockButton()
});
Then(/^I expect to see export private key and it is blurred$/, async ()=> {
    await settingsPage.checkIfYouAreOnExportPrivateKey()
    await settingsPage.checkIfPrivateKeyIsBlurred(TD.PVKBlurred.True)
});
When(/^I click on switch$/, async ()=> {
    await settingsPage.blurredToggle()
});
Then(/^I should see private key$/, async ()=> {
    await settingsPage.checkIfPrivateKeyIsBlurred(TD.PVKBlurred.False)
    await settingsPage.clickCloseButton()
});
Then(/^I enter "([^"]*)" and click unlock$/, async (pass)=>  {
    await settingsPage.enterPassword(pass)
    await settingsPage.clickOnUnlockButton()
});
Then(/^I should see error message for wrong pass$/, async ()=>  {
    await settingsPage.errorMessageDisplayed()
    await settingsPage.clickCloseButton()
});