//Logged in page
const BasePage = require('../pages/BasePage.js')

class LoggedInPage extends BasePage.constructor {

    get addressBookLink() {
        return ('//div[text()="Address book"]')
    }

    get transactionsLink() {
        return ('//div[text()="Transactions"]')
    }

    get receiveButton() {
        return ('//button[contains(text(), "Receive")]')
    }

    get settingsLink() {
        return ('//div[@class="link settings"]')
    }

    get statusLink() {
        return ('//span[text()="Status"]')
    }

    get supportLink() {
        return ('//span[text()="Support"]')
    }

    async goToAddressBook() {
        await this.click(this.addressBookLink)
    }

    async goToTransactions() {
        await this.click(this.transactionsLink)
    }

    async goToReceiveAddress() {
        await this.click(this.receiveButton)
    }

    async goToSettings() {
        await this.click(this.settingsLink)
    }

    async goToSupport() {
        await this.click(this.supportLink)
    }

    async goToStatus() {
        await this.click(this.statusLink)
    }

}

module.exports = new LoggedInPage()