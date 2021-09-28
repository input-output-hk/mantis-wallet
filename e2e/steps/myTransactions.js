const {Given, When, Then} = require('@cucumber/cucumber');
const myTransactionsPage = require('../pages/MyTransactionPage.js')
const loggedInPage = require('../pages/LoggedInPage')

When(/^I click on transactions button on main page$/, async () => {
    await loggedInPage.goToTransactions()
});
Then(/^I expect to see my transactions page$/, async () => {
    await myTransactionsPage.IsMyTransactionsDisplayed()
});
Then(/^I check if sent transaction is displayed in My transactions$/, async () => {
    await myTransactionsPage.checkSentIfTransactionIsDisplayed()
});
Then(/^I check if received transaction is displayed in My transactions$/, async () => {
    await myTransactionsPage.checkIfReceivedTransactionIsDisplayed()
});
Given(/^I check my transactions$/, async () => {
    await myTransactionsPage.IsTransactionsShown()
  });