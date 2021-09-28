//Logout Page
const helpers = require('../support/helpers.js');
const TD = require('../test_data/testData.json');
const expect = require('chai').expect;
const BasePage = require('../pages/BasePage.js');

class LogoutPage extends BasePage.constructor{

    get logoutButton() {
        return ('//span[contains(text(),"Log out")]')
    }

    get removeWalletText() {
        return ('//div[contains(text(),"Remove Wallet")]')
    }

    get enterYourPasswordText() {
        return ('//div[@class="description"]')
    }

    get passwordField() {
        return ('//input[@type="password"]')
    }

    get restoreWarningBox() {
        return ('//input[@id="restore-warning"]')
    }

    get restoreWarningText() {
        return ('//input[@id="restore-warning"]/../../span[not(@class="ant-checkbox")]')
    }

    get deleteDataWarningBox() {
        return ('//input[@id="delete-data-warning"]')
    }

    get deleteDataWarningText() {
        return ('//input[@id="delete-data-warning"]/../../span[not(@class="ant-checkbox")]')
    }

    get cancelButton() {
        return ('//span[contains(text(),"Cancel")]/..')
    }

    get removeWalletButton() {
        return ('//span[contains(text(),"Remove Wallet")]/..')
    }

    get errorMessageBox() {
        return ('//div[@class="DialogError"]')
    }

    async logout() {
        await helpers.timeout(2000);
        await this.click(this.logoutButton)
    }

    async enterPasswordAndCheckCheckbox(pass) {
        await this.typeText(this.passwordField, pass)
        await this.click(this.restoreWarningText)
        await this.click(this.deleteDataWarningText)
    }

    async removeWallet() {
        await this.click(this.removeWalletButton);
    }

    async checkIfLogoutButtonIsDisabled() {
        expect(await this.getHTML(this.logoutButton))
            .to.include('disabled')
    }

    async checkCheckbox() {
        await this.click(this.restoreWarningText);
        await this.click(this.deleteDataWarningText);
    }

    async invalidPass() {
        expect(await this.getText(this.errorMessageBox))
            .to.equal(TD.PVKIncorrectPassError);
    }

    async enterPassword(pass) {
        await this.typeText(this.passwordField, pass);
    }

    async additionalActionError() {
        expect(await this.getText(this.errorMessageBox))
            .to.equal(TD.AdditionalActionError);
    }

    async cancelLogout(){
        await this.click(this.cancelButton);
    }
}

module.exports = new LogoutPage()