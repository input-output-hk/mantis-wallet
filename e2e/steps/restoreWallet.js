const {Then, When} = require('@cucumber/cucumber');
const homePage = require('../pages/HomePage.js');
const restorePage = require('../pages/RestorePage.js');

When(/^I choose Restore wallet button$/, async () => {
    await homePage.clickRestoreWalletButton();
});
Then(/^I enter wallet name, private key and passwords$/, async () => {
    await restorePage.enterRestoreDetails();
});
Then(/^I enter wallet name, recovery phrase and passwords$/, async () => {
    await restorePage.enterRestorePhrasesDetails();
});
Then(/^I enter private key and passwords without the wallet name$/, async () => {
    await restorePage.enterRestorePhrasesDetailsWithoutWalletName();
});
Then(/^I dont enter private key and I enter passwords and wallet name$/, async () => {
    await restorePage.enterRestoreDetailsWithoutPVK();
});
Then(/^I enter passwords wallet name and incorrect PVK$/, async () => {
    await restorePage.enterRestoreDetailsWrongPVK();
});
When(/^I enter "([^"]*)" and "([^"]*)" wallet name and PVK$/, async (pass, confirmPass) => {
    await restorePage.enterRestoreDetailsInvalidPass(pass, confirmPass)
});
When(/^I choose recovery phrases$/, async ()=> {
    await restorePage.clickRecoveryPhrases()
});
When(/^I enter wallet name and passwords without word phrases$/, async ()=> {
    await restorePage.enterRestoreDetailsWithoutWordPhrases();
});
Then(/^I enter wallet name, incorrect recovery phrase and passwords$/, async ()=> {
    await restorePage.enterRestoreIncorrectPhrasesDetails();
});