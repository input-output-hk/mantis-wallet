//Send Transaction Page
const expect = require('chai').expect;
const helpers = require('../support/helpers.js');
const TD = require('../test_data/testData.json');
const BasePage = require('../pages/BasePage.js')

class SendTransactionPage extends BasePage.constructor {

    //Send transaction selectors
    get sendTransactionText() {
        return ('//div[@class="title"]')
    }

    get recipientText() {
        return ('//label[contains(text(),"Recipient")]')
    }

    get recipientField() {
        return ('//*[@id="recipient-address"]')
    }

    get selectAContactText() {
        return ('//label[contains(text(),"Select a Contact")]')
    }

    get amountText() {
        return ('//label[contains(text(),"Amount")]')
    }

    get amountField() {
        return ('//*[@id="tx-amount"]')
    }

    get cancelButton() {
        return ('//span[contains(text(),"Cancel")]')
    }

    get sendButton() {
        return ('//button[contains(text(),"Send")]')
    }

    get feeText() {
        return ('//div[@class="DialogFee"]/label')
    }

    get customFee() {
        return ('//button[contains(text(),"Custom")]')
    }

    get slowFee() {
        return ('//span[contains(text(),"Slow")]')
    }

    get averageFee() {
        return ('//span[contains(text(),"Average")]')
    }

    get fastFee() {
        return ('//span[contains(text(),"Fast")]')
    }

    get totalTransactionAmountText() {
        return (' //div[contains(text(),"Total Transaction")]')
    }

    get remainingBalanceText() {
        return ('//div[contains(text(),"Remaining")]')
    }

    get totalTransactionAmountValue() {
        return ('//div[contains(text(),"Total Transaction")]/..//div[@class="amount"]')
    }

    get remainingBalanceValue() {
        return ('//div[contains(text(),"Remaining")]/..//div[@class="amount"]')
    }

    get transferButton() {
        return ('//span[contains(text(),"Transfer")]')
    }

    get advancedButton() {
        return ('//span[contains(text(),"Advanced")]')
    }

    get closeSendTransactionWindow() {
        return ('//span[@class="anticon anticon-close"]')
    }


    //Send transaction next page selectors
    get recipientAddressValue() {
        return ('//label[contains(text(),"Recipient")]/..//input')
    }

    get amountTextOnNextPage() {
        return ('//div[contains(text(),"Amount")]')
    }

    get amountValue() {
        return ('//div[contains(text(),"Amount")]/../div[@class="container"]/div[@class="amount"]')
    }

    get feeTextOnNextPage() {
        return ('//div[contains(text(), "Fee") and @class="label"]')
    }

    get feeAmount() {
        return ('//div[contains(text(), "Fee")]/../div[@class="container"]/div[@class="amount"]')
    }

    get backButton() {
        return ('//span[contains(text(),"Back")]')
    }

    get confirmButton() {
        return ('//span[contains(text(),"Confirm")]')
    }

    get passwordText() {
        return ('//label[@for="tx-password"]')
    }

    get passwordField() {
        return ('//*[@id="tx-password"]')
    }

    get passError() {
        return ('//div[@class="error-message"]')
    }

    get sendTransactionButton() {
        return ('//button/span[text()=\'Send\']')
    }

    get itemExplain() {
        return ('//div[contains(@class,"ant-form-item-explain")]/div')
    }

    //Send transaction advanced tab selectors
    get amountTextOnAdvanced() {
        return ('//*[@for="tx-amount"]')
    }

    get gasLimitText() {
        return ('//label[contains(text(),"Gas limit")]')
    }

    get gasLimitField() {
        return ('//label[contains(text(),"Gas limit")]/..//input')
    }

    get gasPriceText() {
        return ('//label[contains(text(),"Gas price")]')
    }

    get gasPriceField() {
        return ('//label[contains(text(),"Gas price")]/..//input')
    }

    get dataText() {
        return ('//label[contains(text(),"Data")]')
    }

    get dataField() {
        return ('//textarea[@id="tx-data"]')
    }

    get nonceText() {
        return ('//label[contains(text(),"Data")]')
    }

    get nonceField() {
        return ('//label[contains(text(),"Data")]/..//input')
    }

    async clickSendButton() {
        await this.click(this.sendButton);
    }

    async clickAdvancedButton() {
        await this.click(this.advancedButton);
    }

    async sendTransaction() {
        await this.click(this.sendTransactionButton);
    }

    async enterReceivingAddress(address) {
        await this.typeText(this.recipientField, address);
    }

    async enterAmountToSend(amount) {
        await this.typeText(this.amountField, amount);
    }

    async enterPassword(pass) {
        await this.typeText(this.passwordField, pass);
    }

    async confirmTransaction() {
        await helpers.timeout(1000)
        await this.click(this.confirmButton);
    }

    async passErrorCheck() {
        const err = await this.getText(this.passError);
        expect(err).to.equal(TD.PVKIncorrectPassError)
    }

    async closeSendTransaction() {
        await this.click(this.closeSendTransactionWindow);
    }

    async passNotProvided() {
        const err = await this.getText(this.itemExplain);
        expect(err).to.equal(TD.PassMustBeProvided)
    }

    async addressNotSet() {
        const err = await this.getText(this.itemExplain);
        expect(err).to.equal(TD.AddressNotSet)
    }

    async invalidAddress() {
        const err = await this.getText(this.itemExplain);
        expect(err).to.equal(TD.InvalidAddress)
    }

    async graterThanZero() {
        const err = await this.getText(this.itemExplain);
        expect(err).to.equal(TD.Amount0Error)
    }

    async chooseFee(fee) {
        switch (fee) {
            case "Slow" : {
                await this.click(this.slowFee);
            }
                break;
            case "Average" : {
                await this.click(this.averageFee);
            }
                break;
            case "Fast" : {
                await this.click(this.fastFee);
            }
                break;
        }
    }
}

module.exports = new SendTransactionPage()