//Create Page
const helpers = require('../support/helpers.js');
const TD = require('../test_data/testData.json');
const expect = require('chai').expect;
const BasePage = require('../pages/BasePage.js')

class CreatePage extends BasePage.constructor{

    get createWalletText() {
        return ('//div[text()="Create New Wallet" and @class="title"]')
    }

    get createWalletInfoText() {
        return ('//div[text()="Create New Wallet"]/../div[@class="note"]')
    }

    get walletNameText() {
        return ('//label[text()="Wallet Name"]')
    }

    get walletNameField() {
        return ('//input[@id="wallet-name"]')
    }

    get enterPasswordText() {
        return ('//div[text()="Enter Password"]')
    }

    get enterPasswordField() {
        return ('//input[@id="password"]')
    }

    get repeatPasswordField() {
        return ('//input[@id="re-password"]')
    }

    get noteForPasswordText() {
        return ('//div[@class="criteria"]')
    }

    get cancelButton() {
        return ('//span[text()="Cancel"]/..')
    }

    get nextButton() {
        return ('//span[text()="Next"]/..')
    }

    get backButton() {
        return ('//span[text()="Back"]/..')
    }

    get securityText() {
        return ('//div[text()="Security"]')
    }

    get recoveryPhraseText() {
        return ('//div[text()="Recovery Phrase"]')
    }

    get recoverPhraseInfoText() {
        return ('//div[@class="description"]')
    }

    get privateKeyText() {
        return ('//div[text()="Private Key"]')
    }

    get privateKeySecurityText() {
        return ('//div[text()="Private Key"]/../div[@class="switch"]/div')
    }

    get showPrivateKeyButton() {
        return ('//button[@title="Private Key"]')
    }

    get privateKeyValue() {
        return ('//div[@class="qr-content"]')
    }

    get downloadTxtButton() {
        return ('//button[text()="Download txt"]')
    }

    get writtenDownText() {
        return ('//input[@id="written-down"]/../../span[not(@class="ant-checkbox")]')
    }

    get writtenDownBox() {
        return ('//input[@id="written-down"]')
    }

    get reInputRecoveryText() {
        return ('//div[@class="instructions"]')
    }

    get clearRecoveryPhraseButton() {
        return ('//span[@class="clear"]')
    }

    get recoveryWordsText() {
        return ('//div[@class="word"]')
    }

    get conditionsLocallyText() {
        return ('//input[@id="checkbox-local-only"]/../../span[not(@class="ant-checkbox")]')
    }

    get conditionsLocallyBox() {
        return ('//input[@id="checkbox-local-only"]/..')
    }

    get conditionsLocallyBoxSpan() {
        return ('//input[@id="checkbox-local-only"]/../span')
    }

    get conditionRecoveryText() {
        return ('//input[@id="checkbox-recovery"]/../../span[not(@class="ant-checkbox")]')
    }

    get conditionRecoveryBox() {
        return ('//input[@id="checkbox-recovery"]/..')
    }

    get conditionRecoveryBoxSpan() {
        return ('//input[@id="checkbox-recovery"]/../span')
    }

    get finishButton() {
        return ('//span[text()="Finish"]/..')
    }

    get errorMessageText() {
        return ('//div[@class="DialogPassword"]/div[2]/div[2]//div[@role="alert"]')
    }

    get errorMessageBox() {
        return ('//div[@class="DialogError"]')
    }

    get errorMessageWalletNameText() {
        return ('//div[@class="DialogInput"]//div[contains(@class,"ant-form-item-explain")]/div')
    }

    get errorMessagePhrases() {
        return ('//div[@class="error-message"]')
    }

    get reinputBox() {
        return ('//div[@class="InlineError input"]')
    }

    async enterWalletName(name){
        await this.typeText(this.walletNameField, name);
    }

    async enterWalletPassword(pass){
        await this.typeText(this.enterPasswordField, pass);
    }

    async repeatWalletPassword( pass){
        await this.typeText(this.repeatPasswordField, pass);
    }

    async clickNextButton(){
        await this.click(this.nextButton);
    }

    async enterWalletNameAndPasswords() {
        await this.enterWalletName(TD.CreateWallet.WalletName)
        await this.enterWalletPassword(TD.CreateWallet.WalletPass)
        await this.repeatWalletPassword(TD.CreateWallet.WalletPass)
        await this.clickNextButton()
    }

    async enterWalletNameAndPasswordValidations(pass, confirmPass) {
        await this.enterWalletName(TD.CreateWallet.WalletName)

        if (pass === "empty") {
            await this.enterWalletPassword("")
            await this.repeatWalletPassword("")
        } else {
            await this.enterWalletPassword(pass)
            await this.repeatWalletPassword(confirmPass)
        }
        await this.clickNextButton()
    }

    async enterWalletNameAndPasswordNameValidations(name) {
        if (name === "empty") {
            await this.enterWalletName("")
        } else {
            await this.enterWalletName(name)
        }
        await this.enterWalletPassword(TD.CreateWallet.WalletPass);
        await this.repeatWalletPassword(TD.CreateWallet.WalletPass);
        await this.clickNextButton()
    }

    async clickOnShowPrivateKey(){
        await this.click(this.showPrivateKeyButton);
    }

    async getPrivateKeyText(){
        await this.getText(this.privateKeyValue);
    }

    async getPrivateKey() {
        await this.clickOnShowPrivateKey()
        const privateKey = await this.getPrivateKeyText()
        await this.clickNextButton()
        return privateKey;
    }

    async getRecoveryWordText(){
        return  this.getText(this.recoveryWordsText);
    }

    async clickOnWrittenDownText(){
        await this.click(this.writtenDownText);
    }

    async getRecoveryPhrase() {
        const recoveryPhrase = await this.getRecoveryWordText()
        await this.clickOnWrittenDownText()
        await this.clickNextButton()
        return recoveryPhrase.toString().replace(/[^A-Za-z]+/g, '\n');
    }

    async clickOnFinishButton(){
        await this.click(this.finishButton);
    }

    async clickOnConditionLocallyBox(){
        await this.click(this.conditionsLocallyBox);
    }

    async clickOnConditionRecoveryBox(){
        await this.click(this.conditionRecoveryBox);
    }

    async reInputRecoveryPhrase(phrase) {
        const words = phrase.split("\n");
        for (let i = 1; i < words.length; i++) {
            await helpers.timeout(300)
            await this.click("//div[@class='word' and text()='" + words[i] + "']");
        }
        await this.clickOnConditionLocallyBox()
        await this.clickOnConditionRecoveryBox()
        await this.clickOnFinishButton()
    }

    async getErrorMessageBoxText(){
        return this.getText(this.errorMessageBox)
    }

    async reInputRecoveryPhraseWithoutConfirmationConditionsLocally(phrase) {
        const words = phrase.split("\n");
        for (let i = 1; i < words.length; i++) {
            await helpers.timeout(300)
            await this.click("//div[@class='word' and text()='" + words[i] + "']");
        }
        await this.clickOnConditionRecoveryBox()
        await this.clickOnFinishButton()
        await helpers.timeout(2000);
        const color = await this.getBackgroundColor(this.conditionsLocallyBoxSpan)
        expect(color.value).to.equal(TD.ErrorColor);
        expect(await this.getErrorMessageBoxText())
            .to.equal(TD.AdditionalActionError);
    }

    async reInputRecoveryPhraseWithoutConditionsRecovery(phrase) {
        const words = phrase.split("\n");
        for (let i = 1; i < words.length; i++) {
            await helpers.timeout(300)
            await this.click("//div[@class='word' and text()='" + words[i] + "']");
        }
        await this.clickOnConditionLocallyBox()
        await this.clickOnFinishButton()
        await helpers.timeout(2000);
        const color = await this.getBackgroundColor(this.conditionRecoveryBoxSpan)
        expect(color.value).to.equal(TD.ErrorColor);
        expect(await this.getErrorMessageBoxText())
            .to.equal(TD.AdditionalActionError);
    }

    async getErrorMessageText(){
        return this.getText(this.errorMessageText)
    }

    async getErrorMessageWalletNameText(){
        return this.getText(this.errorMessageWalletNameText)
    }

    async validateErrorMessages(message) {
        const errMsg = await this.getErrorMessageText()
        try {
            expect('"' + errMsg + '"')
                .to.equal(message)
        } catch (err) {
            expect(errMsg)
                .to.equal(message)
        }

        expect(await this.getErrorMessageBoxText())
            .to.equal(TD.AdditionalActionError);
    }

    async validateWalletNameErrorMessages(message) {
        expect(await this.getErrorMessageWalletNameText())
            .to.equal(message);
        expect(await this.getErrorMessageBoxText())
            .to.equal(TD.AdditionalActionError);
    }

    async isDownloadButtonDisplayedAndClickable() {
        expect(await this.isDownloadButtonVisible())
            .to.equal(true);

        expect(await this.getDownloadButtonText())
            .to.equal("DOWNLOAD TXT");

        expect(await this.isDownloadButtonEnabled()
        )
            .to.equal(true);
    }

    async isDownloadButtonVisible(){
        return this.isVisible(this.downloadTxtButton)
    }

    async isDownloadButtonEnabled(){
        return this.isEnabled(this.downloadTxtButton)
    }

    async getDownloadButtonText(){
        return this.getText(this.downloadTxtButton)
    }

    async cancelWalletCreation() {
        await this.click(this.cancelButton);
    }

    async clickBack() {
        await this.click(this.backButton);
    }

    async reinputWordPhrasesIncorrectOrder(phrase) {
        const words = phrase.split("\n");
        for (let i = words.length - 1; i >= 1; i--) {
            await helpers.timeout(300)
            await this.click("//div[@class='word' and text()='" + words[i] + "']");
        }

        await this.clickOnConditionLocallyBox()
        await this.clickOnConditionRecoveryBox()
        await this.clickOnFinishButton()
        expect(await this.getErrorMessagePhrases())
            .to.equal(TD.ErrorPhrases);
    }

    async getErrorMessagePhrases() {
        return this.getText(this.errorMessagePhrases)
    }

    async reinputWordPhrasesAndIClickBack(phrase) {
        const words = phrase.split("\n");
        for (let i = 1; i < words.length; i++) {
            await helpers.timeout(300)
            await this.click("//div[@class='word' and text()='" + words[i] + "']");
        }

        await this.clickOnConditionLocallyBox()
        await this.clickOnConditionRecoveryBox()
        await this.clickBack()
    }

    async clickClearRecoveryPhrase(){
        await this.click(this.clearRecoveryPhraseButton);
    }

    async reinputWordPhrasesAndIClickClear(phrase) {
        const words = phrase.split("\n");
        for (let i = 1; i < words.length; i++) {
            await helpers.timeout(300)
            await this.click("//div[@class='word' and text()='" + words[i] + "']");
        }

        await this.clickClearRecoveryPhrase()
        expect(await this.getTextFromReinputBox())
            .to.equal("");
    }

    async getTextFromReinputBox(){
        return this.getText(this.reinputBox)
    }

    async verifyFinishIsDisabled() {
        expect(await this.isEnabled(this.finishButton))
            .to.equal(false);
    }

}

module.exports = new CreatePage();