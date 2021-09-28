const APP_CONF = require('../config/appConfig.js')[process.env.ENV];
const {Given, When, Then} = require('@cucumber/cucumber');
const helpers = require('../support/helpers.js');
const startPage = require('../pages/StartPage.js');
const homePage = require('../pages/HomePage.js');
const statusPage = require('../pages/StatusPage.js');
const restorePage = require('../pages/RestorePage.js');
const basePage = require('../pages/BasePage.js')

Given(/^I open the Mantis wallet app$/, async () => {
    await helpers.timeout(5000);
    await basePage.start()
});
When(/^I choose the available Network "([^"]*)" in Mantis Wallet$/, async (network) => {
    await startPage.login(network);
});
Then(/^I should see that I am syncing or connecting to the selected Network "([^"]*)"$/, async (network) => {
    await homePage.isMantisStartedForTheSelectedNetwork(network);
});
Then(/^I should close the Mantis Wallet application$/, async () => {
    await basePage.stop()
});
Then(/^I choose Sagano Network in Mantis Wallet$/, async () => {
    await startPage.login("Sagano Testnet");
});
Given(/^I reset Mantis Wallet config\.json$/, async () => {
    await helpers.resetMantisConfig(APP_CONF.TEST_CONF_PATH, APP_CONF.APP_CONF_PATH);
});
Then(/^I can see details of system$/, async () => {
    await startPage.clickOnShowDetails()
    await statusPage.checkIfYouAreOnStatusPage()
    await statusPage.closeStatusPage()
});
Given(/^I restore Mantis Wallet on "([^"]*)"$/, async (network) => {
    await helpers.resetMantisConfig(APP_CONF.TEST_CONF_PATH, APP_CONF.APP_CONF_PATH);
    await helpers.timeout(5000);
    await basePage.start()
    await startPage.login(network);
    await homePage.acceptTermsAndConditions();
    await homePage.clickRestoreWalletButton();
    await restorePage.enterRestoreDetails();
});
Given(/^I restore backup Mantis Wallet on "([^"]*)"$/, async (network) => {
    await helpers.resetMantisConfig(APP_CONF.TEST_CONF_PATH, APP_CONF.APP_CONF_PATH);
    await helpers.timeout(5000);
    await basePage.start()
    await startPage.login(network);
    await homePage.acceptTermsAndConditions();
    await homePage.clickRestoreWalletButton();
    await restorePage.enterBackupRestoreDetails();
});
Given(/^I restore specific Mantis Wallet on "([^"]*)"$/, async (network) => {
    await helpers.resetMantisConfig(APP_CONF.TEST_CONF_PATH, APP_CONF.APP_CONF_PATH);
    await helpers.timeout(5000);
    await basePage.start()
    await startPage.login(network);
    await homePage.acceptTermsAndConditions();
    await homePage.clickRestoreWalletButton();
    await restorePage.enterWalletRestoreDetails();
});
Then(/^I close Mantis Wallet$/, async () => {
    await basePage.stop()
    await helpers.resetMantisConfig(APP_CONF.TEST_CONF_PATH, APP_CONF.APP_CONF_PATH);
});
Given(/^I start creation of a wallet on "([^"]*)"$/, async (network) => {
    await helpers.resetMantisConfig(APP_CONF.TEST_CONF_PATH, APP_CONF.APP_CONF_PATH);
    await helpers.timeout(5000);
    await basePage.start()
    await startPage.login(network);
    await homePage.acceptTermsAndConditions();
    await homePage.createWallet();
});
Given(/^I start Mantis Wallet on "([^"]*)" and accept terms and conditions$/, async (network) => {
    await helpers.resetMantisConfig(APP_CONF.TEST_CONF_PATH, APP_CONF.APP_CONF_PATH);
    await helpers.timeout(5000);
    await basePage.start();
    await startPage.login(network);
    await homePage.acceptTermsAndConditions();
});
Given(/^I start restoring a wallet on "([^"]*)"$/, async (network) => {
    await helpers.resetMantisConfig(APP_CONF.TEST_CONF_PATH, APP_CONF.APP_CONF_PATH);
    await helpers.timeout(5000);
    await basePage.start();
    await startPage.login(network);
    await homePage.acceptTermsAndConditions();
    await homePage.clickRestoreWalletButton();
});
Given(/^I start Mantis wallet on "([^"]*)"$/, async (network) => {
    await helpers.resetMantisConfig(APP_CONF.TEST_CONF_PATH, APP_CONF.APP_CONF_PATH);
    await helpers.timeout(5000);
    await basePage.start();
    await startPage.login(network);
    await homePage.isMantisStartedForTheSelectedNetwork(network);
});