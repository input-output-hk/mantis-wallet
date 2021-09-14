//Support Page
const expect = require('chai').expect;
const TD = require('../test_data/testData.json')
const BasePage = require('../pages/BasePage.js')

class SupportPage extends BasePage.constructor {

    get supportText() {
        return ('//div[contains(text(), "Support")]')
    }

    get exportLogsButton() {
        return ('//span[contains(text(), "Export Logs")]')
    }

    get openTicketButton() {
        return ('//span[contains(text(), "Open Ticket")]')
    }

    get supportDescriptionText() {
        return ('//div[@class="description"]')
    }

    get closeModalButton() {
        return ('//span[@aria-label="close"]')
    }

    async checkIfYouAreOnSupportPage() {
        await this.checkForSupportTitleText()
        await this.checkForExportLogs()
        await this.checkForOpenTicket()
        await this.checkForSupportText()

    }

    async checkForSupportText() {
        expect(await this.getText(this.supportText))
            .to.equal('Support')
    }

    async checkForExportLogs() {
        expect(await this.getText(this.exportLogsButton))
            .to.equal('Export Logs')
    }

    async checkForOpenTicket() {
        expect(await this.getText(this.openTicketButton))
            .to.equal('Open Ticket')
    }

    async checkForSupportTitleText() {
        expect(await this.getText(this.supportDescriptionText))
            .to.equal(TD.SupportDescription)
    }

    async closeSupportPage() {
        await this.click(this.closeModalButton)
    }

}

module.exports = new SupportPage()