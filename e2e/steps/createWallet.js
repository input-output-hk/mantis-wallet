const {When, Then} = require('@cucumber/cucumber');
const createPage = require('../pages/CreatePage.js');
const homePage = require('../pages/HomePage.js');
const TD = require('../test_data/testData.json');
let recoveryPhrase = "";

When(/^I choose Create wallet button$/, async () => {
    await homePage.createWallet();
});
Then(/^I enter wallet name and passwords$/, async () => {
    await createPage.enterWalletNameAndPasswords();
});
Then(/^I confirm that private key is there$/, async () => {
    TD.CreateWallet.PVK = await createPage.getPrivateKey();
});
Then(/^I remember recovery phrase$/, async () => {
    recoveryPhrase = await createPage.getRecoveryPhrase();
});
Then(/^I re input recovery phrase$/, async () => {
    await createPage.reInputRecoveryPhrase(recoveryPhrase)
});
Then(/^I should see an Error (.*)$/, async (message) => {
    await createPage.validateErrorMessages(message);
});
Then(/^I enter wallet "([^"]*)" and passwords$/, async (name) => {
    await createPage.enterWalletNameAndPasswordNameValidations(name);
});
Then(/^I should see a wallet name Error "([^"]*)"$/, async (message) => {
    await createPage.validateWalletNameErrorMessages(message);
});
Then(/^I enter wallet name and "([^"]*)" and "([^"]*)"$/, async (pass, confirmPass) => {
    await createPage.enterWalletNameAndPasswordValidations(pass, confirmPass);
});
Then(/^I verify download button$/, async () => {
    await createPage.isDownloadButtonDisplayedAndClickable();
});
Then(/^I cancel creating wallet$/, async () => {
    await createPage.cancelWalletCreation();
});
Then(/^I click back$/, async () => {
    await createPage.clickBack();
});
Then(/^I re input recovery phrase without accepting Recovery conditions$/, async () => {
    await createPage.reInputRecoveryPhraseWithoutConditionsRecovery(recoveryPhrase);
});
Then(/^I re input recovery phrase without accepting Locally conditions$/, async () => {
    await createPage.reInputRecoveryPhraseWithoutConfirmationConditionsLocally(recoveryPhrase);
});
Then(/^I re input recovery phrase in wrong order$/, async () => {
    await createPage.reinputWordPhrasesIncorrectOrder(recoveryPhrase);
});
Then(/^I re input recovery phrase and I click back$/, async () => {
    await createPage.reinputWordPhrasesAndIClickBack(recoveryPhrase);
});
Then(/^I reinput recovery phrase and I clear text$/, async () => {
    await createPage.reinputWordPhrasesAndIClickClear(recoveryPhrase);
});
Then(/^I confirm that wallet cant be created without word phrases$/, async () => {
    await createPage.verifyFinishIsDisabled();
});