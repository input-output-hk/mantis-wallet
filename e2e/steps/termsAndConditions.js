const {When, Then} = require('@cucumber/cucumber');
const homePage = require('../pages/HomePage.js');

Then(/^I should be able to accept Terms and conditions$/, async () => {
    await homePage.verifyTermsAndConditions();
    await homePage.acceptTermsAndConditions();
});
Then(/^I should see Create new Wallet and Restore Wallet options$/, async () => {
    await homePage.verifyWalletOptionsAreDisplayed();
});
When(/^I do not accept Terms and conditions$/, async () => {
    await homePage.verifyTermsAndConditions();
    await homePage.doNotAcceptTermsAndConditions();
});
Then(/^I should see Error Message on TOS$/, async () => {
    await homePage.verifyErrorMessageWhenTermsAreNotAccepted();
});