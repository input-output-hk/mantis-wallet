const {When, Then} = require('@cucumber/cucumber');
const sendPage = require('../pages/SendTransactionsPage.js');

When(/^I click send button on main page$/, async () => {
    await sendPage.clickSendButton();
});
Then(/^I click send$/, async () => {
    await sendPage.sendTransaction();
});
Then(/^I click advanced button$/, async () => {
    await sendPage.clickAdvancedButton();
});
Then(/^I enter receiving address "([^"]*)"$/, async (address)=> {
    await sendPage.enterReceivingAddress(address);
});
Then(/^I enter amount to send "([^"]*)"$/, async (amount)=>  {
    await sendPage.enterAmountToSend(amount);
});
Then(/^I enter password "([^"]*)"$/, async (pass)=> {
    await sendPage.enterPassword(pass);
});
Then(/^I confirm transaction$/, async ()=> {
    await sendPage.confirmTransaction();
});
Then(/^I should see incorrect pass error$/, async ()=> {
    await sendPage.passErrorCheck();
});
Then(/^I should close send transaction window$/, async ()=> {
    await sendPage.closeSendTransaction();
});
Then(/^I should see pass not provided error$/, async ()=> {
    await sendPage.passNotProvided();
});
Then(/^I should see address not set error$/, async ()=> {
    await sendPage.addressNotSet();
});
Then(/^I should see invalid address error$/, async ()=> {
    await sendPage.invalidAddress();
});
Then(/^should see must be grater than zero error$/, async ()=> {
    await sendPage.graterThanZero();
});
Then(/^I choose a fee "([^"]*)"$/, async (fee)=> {
    await sendPage.chooseFee(fee);
});