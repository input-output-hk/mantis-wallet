//Restore Page
const TD = require('../test_data/testData.json');
const expect = require('chai').expect;
const BasePage = require('../pages/BasePage.js')

class RestorePage extends BasePage.constructor {

    get restoreWalletText() {
        return ('//div[text()="Restore Wallet" and @class="title"]')
    }

    get restoreWalletInfoText() {
        return ('//div[text()="Restore Wallet"]/../div[@class="note"]')
    }

    get walletNameText() {
        return ('//label[text()="Wallet Name"]')
    }

    get walletNameField() {
        return ('//input[@id="wallet-name"]')
    }

    get privateKeyButton() {
        return ('//div[contains(text(),"Private Key") and @role="button"]')
    }

    get privateKeyField() {
        return ('//input[@id="private-key"]')
    }

    get recoveryPhraseButton() {
        return ('//div[contains(text(),"Recovery Phrase") and @role="button"]')
    }

    get recoveryPhraseField() {
        return ('//input[@id="rc_select_1"]')
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

    get walletNameError() {
        return ('//div[@role="alert"]')
    }

    get errorMessageBox() {
        return ('//div[@class="DialogError"]')
    }

    get pvkError() {
        return ('//div[contains(@class,"ant-form-item-explain")]/div')
    }

    async enterRestoreDetails() {
        await this.typeText(this.walletNameField, TD.RestoreWallet.WalletName);
        await this.typeText(this.privateKeyField, TD.RestoreWallet.PVTKey);
        await this.typeText(this.enterPasswordField, TD.RestoreWallet.Password);
        await this.typeText(this.repeatPasswordField, TD.RestoreWallet.Password);
        await this.click(this.nextButton);
    }

    async enterBackupRestoreDetails() {
        await this.typeText(this.walletNameField, TD.BackupWallet.WalletName);
        await this.typeText(this.privateKeyField, TD.BackupWallet.PVTKey);
        await this.typeText(this.enterPasswordField, TD.BackupWallet.Password);
        await this.typeText(this.repeatPasswordField, TD.BackupWallet.Password);
        await this.click(this.nextButton);
    }

    async enterWalletRestoreDetails() {
        await this.typeText(this.walletNameField, TD.TransactionWallet.WalletName);
        await this.typeText(this.privateKeyField, TD.TransactionWallet.PVTKey);
        await this.typeText(this.enterPasswordField, TD.TransactionWallet.Password);
        await this.typeText(this.repeatPasswordField, TD.TransactionWallet.Password);
        await this.click(this.nextButton);
    }

    async enterRestorePhrasesDetails() {
        await this.typeText(this.walletNameField, TD.RestoreWallet.WalletName);
        await this.click(this.recoveryPhraseButton);

        for (let i = 0; i < TD.RestoreWallet.Phrases.length; i++) {
            if (i !== TD.RestoreWallet.Phrases.length - 1) {
                await this.typeText(this.recoveryPhraseField, TD.RestoreWallet.Phrases[i] + " ");
            } else {
                await this.typeText(this.recoveryPhraseField, TD.RestoreWallet.Phrases[i]);
            }
        }

        await this.typeText(this.enterPasswordField, TD.RestoreWallet.Password);
        await this.typeText(this.repeatPasswordField, TD.RestoreWallet.Password);
        await this.click(this.nextButton);
    }

    async enterRestorePhrasesDetailsWithoutWalletName() {
        await this.click(this.recoveryPhraseButton);

        for (let i = 0; i < TD.RestoreWallet.Phrases.length; i++) {
            if (i !== TD.RestoreWallet.Phrases.length - 1) {
                await this.typeText(this.recoveryPhraseField, TD.RestoreWallet.Phrases[i] + " ");
            } else {
                await this.typeText(this.recoveryPhraseField, TD.RestoreWallet.Phrases[i]);
            }
        }

        await this.typeText(this.enterPasswordField, TD.RestoreWallet.Password);
        await this.typeText(this.repeatPasswordField, TD.RestoreWallet.Password);
        await this.click(this.nextButton);

        const errMsg = await this.getText(this.walletNameError)
        expect(errMsg[0])
            .to.equal(TD.WalletNameErrorMessage);

        expect(await this.getText(this.errorMessageBox)
        )
            .to.equal(TD.AdditionalActionError);
    }

    async enterRestoreDetailsWithoutPVK() {
        await this.typeText(this.walletNameField, TD.RestoreWallet.WalletName);
        await this.typeText(this.enterPasswordField, TD.RestoreWallet.Password);
        await this.typeText(this.repeatPasswordField, TD.RestoreWallet.Password);
        await this.click(this.nextButton);

        const errMsg = await this.getText(this.pvkError)
        expect(errMsg[0])
            .to.equal(TD.PVKErrorMessage);

        expect(await this.getText(this.errorMessageBox)
        )
            .to.equal(TD.AdditionalActionError);
    }

    async enterRestoreDetailsWrongPVK() {
        await this.typeText(this.walletNameField, TD.RestoreWallet.WalletName);
        await this.typeText(this.privateKeyField, TD.RestoreWallet.IncorrectPVTKey);
        await this.typeText(this.enterPasswordField, TD.RestoreWallet.Password);
        await this.typeText(this.repeatPasswordField, TD.RestoreWallet.Password);
        await this.click(this.nextButton);
        const errMsg = await this.getText(this.pvkError)
        expect(errMsg[0])
            .to.equal(TD.IncorrectPVKErrorMessage);

        expect(await this.getText(this.errorMessageBox)
        )
            .to.equal(TD.AdditionalActionError);
    }

    async enterRestoreDetailsInvalidPass(pass, confirmPass) {
        await this.typeText(this.walletNameField, TD.RestoreWallet.WalletName);
        await this.typeText(this.privateKeyField, TD.RestoreWallet.PVTKey);
        await this.typeText(this.enterPasswordField, pass);
        await this.typeText(this.repeatPasswordField, confirmPass);
        await this.click(this.nextButton);
    }

    async clickRecoveryPhrases() {
        await this.click(this.recoveryPhraseButton);
    }

    async enterRestoreDetailsWithoutWordPhrases() {
        await this.typeText(this.walletNameField, TD.RestoreWallet.WalletName);
        await this.click(this.recoveryPhraseButton);
        await this.typeText(this.enterPasswordField, TD.RestoreWallet.Password);
        await this.typeText(this.repeatPasswordField, TD.RestoreWallet.Password);
        await this.click(this.nextButton);
        expect(await this.getText(this.errorMessageBox)
        )
            .to.equal(TD.InvalidSeedPhrase);
    }

    async enterRestoreIncorrectPhrasesDetails() {
        await this.typeText(this.walletNameField, TD.RestoreWallet.WalletName);
        await this.click(this.recoveryPhraseButton);

        for (let i = TD.RestoreWallet.Phrases.length - 1; i > 1; i--) {
            if (i !== TD.RestoreWallet.Phrases.length - 1) {
                await this.typeText(this.recoveryPhraseField, TD.RestoreWallet.Phrases[i] + " ");
            } else {
                await this.typeText(this.recoveryPhraseField, TD.RestoreWallet.Phrases[i]);
            }
        }
        await this.typeText(this.enterPasswordField, TD.RestoreWallet.Password);
        await this.typeText(this.repeatPasswordField, TD.RestoreWallet.Password);
        await this.click(this.nextButton);
        expect(await this.getText(this.errorMessageBox))
            .to.equal(TD.InvalidSeedPhrase);
    }
}

module.exports = new RestorePage()