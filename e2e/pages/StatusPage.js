//Status Page
const expect = require('chai').expect;
const TD = require('../test_data/testData.json')
const BasePage = require('../pages/BasePage.js')

class StatusPage extends BasePage.constructor {

    get machineText() {
        return ('//div[contains(text(), "Machine")]')
    }

    get backendText() {
        return ('//div[contains(text(), "Backend")]')
    }

    get mantisWalletText() {
        return ('//div[contains(text(), "Mantis Wallet") and @class="title"]')
    }

    get closeModalButton() {
        return ('//span[@aria-label="close"]')
    }

    async checkIfYouAreOnStatusPage() {
        await this.checkForMachineText()
        await this.checkForBackendText()
        await this.checkForMantisWalletText()
        await this.checkStatusOptions()
    }

    async checkForMachineText() {
        expect(await this.getText(this.machineText))
            .to.equal('MACHINE')
    }

    async checkForBackendText() {
        expect(await this.getText(this.backendText)
        )
            .to.equal('BACKEND')
    }

    async checkForMantisWalletText() {
        expect(await this.getText(this.mantisWalletText))
            .to.equal('MANTIS WALLET')
    }

    async checkStatusOptions() {
        for (let i = 0; i < TD.StatusInfo.length; i++) {

            const statusInfoText = await this.getText('//div[text()="' + TD.StatusInfo[i] + '"]')

            expect(statusInfoText)
                .to.equal(TD.StatusInfo[i])
        }
    }

    async closeStatusPage() {
        await this.click(this.closeModalButton)
    }

}

module.exports = new StatusPage()