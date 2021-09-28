//Home Page
const expect = require('chai').expect;
const TD = require('../test_data/testData.json')
const chaiFiles = require('chai-files')
const chai = require('chai')
chai.use(chaiFiles);
const {file} = require("chai-files");
const BasePage = require('../pages/BasePage.js')

class HomePage extends BasePage.constructor {

    get termsOfServiceTitle() {
        return ('//div[@class="title" and contains(text(),"IOHK")]')
    };

    get termsOfServiceText() {
        return ('//div[@class="scrollable"]')
    };

    get acceptTermsAndConditionsButton() {
        return ('div#termsAndConditionsApproval')
    };

    get acceptTermsAndConditionsSpan() {
        return ('//span[@class="ant-checkbox-inner"]')
    };

    get nextButton() {
        return ('//button[@type="submit"]')
    };

    get errorDialog() {
        return ('//div[@class="DialogError"]')
    };

    get createWalletButton() {
        return ('//div[text()="Create"]')
    };

    get restoreWalletButton() {
        return ('//div[text()="Restore"]')
    };

    get connectedNetwork() {
        return ('//div[@class="network"]')
    }

    get addressBookNeedAddressInfo() {
        return ('//div[text()="You need a wallet to continue"]')
    }

    async acceptTermsAndConditions() {
        await this.click(this.acceptTermsAndConditionsButton);
        await this.click(this.nextButton);
    }

    async doNotAcceptTermsAndConditions() {
        await this.click(this.nextButton);
    }

    async verifyTermsAndConditions() {

        expect(await this.isVisible(this.termsOfServiceTitle))
            .to.equal(true);

        expect(await this.getText(this.termsOfServiceTitle))
            .to.equal(TD.TOS.TOSTitle);

        expect(await this.isVisible(this.termsOfServiceText))
            .to.equal(true);

        expect(await this.getText(this.termsOfServiceText))
            .to.equal(file('./test_data/TermsOfServiceAgreement.txt'));

    }

    async verifyWalletOptionsAreDisplayed() {
        expect(await this.isVisible(this.createWalletButton))
            .to.equal(true);

        expect(await this.isVisible(this.restoreWalletButton))
            .to.equal(true);
    }

    async verifyErrorMessageWhenTermsAreNotAccepted() {
        expect(await this.getText(this.errorDialog))
            .to.equal("Some fields require additional action before you can continue.")
    }

    async isMantisStartedForTheSelectedNetwork(network) {
        expect(await this
            .getText(this.connectedNetwork))
            .to.equal(network);
    }

    async clickRestoreWalletButton() {
        await this.click(this.restoreWalletButton);
    }

    async createWallet() {
        await this.click(this.createWalletButton);
    }

    async verifyLogout() {
        expect(await this.getText(this.createWalletButton))
            .to.equal("CREATE");

        expect(await this.getText(this.restoreWalletButton))
            .to.equal("RESTORE");
    }

    async addressBookIsUnavailable() {
        expect(await this.getText(this.addressBookNeedAddressInfo))
            .to.equal(TD.Addresses.NeedWalletToSeeAddressBookText);
    }

    async checkIfCreateButtonIsDisplayed() {
        expect(await this.getText(this.createWalletButton))
            .to.equal('CREATE');
    }

    async checkIfRestoreButtonIsDisplayed() {
        expect(await this.getText(this.restoreWalletButton))
            .to.equal('RESTORE');
    }
}

module.exports = new HomePage()