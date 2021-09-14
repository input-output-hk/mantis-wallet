const {When, Then} = require('@cucumber/cucumber');
const receiveAddressPage = require('../pages/ReceiveTransactionPage.js')
const loggedInPage = require('../pages/LoggedInPage.js')

When(/^I click on receive button on main page on Mantis wallet$/, async () => {
    await loggedInPage.goToReceiveAddress()
});
Then(/^I expect to see my address on Mantis wallet$/, async () => {
    await receiveAddressPage.checkIfYouAreOnReceiveAddressPage()
});