const {When, Then} = require('@cucumber/cucumber');
const logoutPage = require('../pages/LogoutPage.js');
const homePage = require('../pages/HomePage.js');
const TD = require('../test_data/testData.json');

When(/^I click Log out button on main page$/, async () => {
    await logoutPage.logout();
});
When(/^I enter my password and check checkbox on remove wallet page$/, async () => {
    await logoutPage.enterPasswordAndCheckCheckbox(TD.RestoreWallet.Password);
});
When(/^I click on remove wallet button on remove wallet page$/, async () => {
    await logoutPage.removeWallet();
});
Then(/^I expect to be logged out of Mantis wallet$/, async () => {
    await homePage.verifyLogout();
});
Then(/^I log out$/, async () => {
    await logoutPage.logout();
    await logoutPage.enterPasswordAndCheckCheckbox(TD.RestoreWallet.Password);
    await logoutPage.removeWallet();
});
When(/^I try to log out without password$/, async () => {
    await logoutPage.logout();
    await logoutPage.checkCheckbox();
    await logoutPage.removeWallet();
});
Then(/^I should see invalid key error$/, async () => {
    await logoutPage.invalidPass();
});
When(/^I try to log out without confirmation$/, async ()=> {
    await logoutPage.logout();
    await logoutPage.enterPassword(TD.RestoreWallet.Password);
    await logoutPage.removeWallet();
});
Then(/^I should see Additional Action Error$/, async ()=> {
    await logoutPage.additionalActionError();
});
When(/^I try to log out with wrong password$/, async ()=> {
    await logoutPage.logout();
    await logoutPage.enterPassword("TestPass123123!");
    await logoutPage.checkCheckbox();
    await logoutPage.removeWallet();
});
When(/^I try to logout and I cancel$/, async ()=> {
    await logoutPage.logout();
    await logoutPage.enterPassword(TD.RestoreWallet.Password);
    await logoutPage.checkCheckbox();
    await logoutPage.cancelLogout();
});