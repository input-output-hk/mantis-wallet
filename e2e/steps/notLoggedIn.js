const {Then} = require('@cucumber/cucumber');
const homePage = require('../pages/HomePage.js');
const logoutPage = require('../pages/LogoutPage')

Then(/^AddressBook should be Unavailable$/, async () => {
    await homePage.addressBookIsUnavailable()
});
Then(/^I should see Create and Restore options$/, async () => {
    await homePage.checkIfCreateButtonIsDisplayed()
    await homePage.checkIfRestoreButtonIsDisplayed()
});
Then(/^Logout button should be disabled$/, async () => {
    await logoutPage.checkIfLogoutButtonIsDisabled()
});