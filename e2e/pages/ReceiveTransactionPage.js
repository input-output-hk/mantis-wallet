//Receive Transaction Page
const expect = require('chai').expect;
const BasePage = require('../pages/BasePage.js')

class ReceiveTransactionPage extends BasePage.constructor {

    get yourAddressText() {
        return ('//div[contains(text(), "Your Address")]')
    }

    get qrCode() {
        return ('//div[@class="qr-code"]')
    }

    get myAddressValue() {
        return ('.qr-content')
    }

    get copyAddressButton() {
        return ('//button[contains(text(), "Copy Address")]')
    }

    async checkIfYouAreOnReceiveAddressPage() {
        expect(await this.getText(this.yourAddressText))
            .to.equal('Your Address')
    }

}

module.exports = new ReceiveTransactionPage();