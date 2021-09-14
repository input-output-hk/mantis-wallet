//Setting Page
const expect = require('chai').expect;
const configFilePath = require('../config/appConfig')[process.env.ENV].APP_CONF_PATH
const TD = require('../test_data/testData.json')
const helpers = require('../support/helpers')
const BasePage = require('../pages/BasePage.js')

class SettingsPage extends BasePage.constructor {

    get mySettingsText() {
        return ('//div[contains(text(),"My settings")]')
    }

    get enableDarkModeText() {
        return ('//div[contains(text(),"Enable Dark")]')
    }

    get enableDarkModeSwitch() {
        return ('//div[contains(text(),"Enable Dark")]/..//button')
    }

    get colorThemeAtribute() {
        return ('//*[@id="Mantis"]')
    }

    get languageText() {
        return ('//div[contains(text(),"Language")]')
    }

    get languageDropDown() {
        return ('//div[contains(text(),"Language")]/../div[@class="settings-input"]')
    }

    get dateFormatText() {
        return ('//div[contains(text(),"Date Format")]')
    }

    get dateFormatDropDown() {
        return ('//div[contains(text(),"Date Format")]/../div[@class="settings-input"]')
    }

    get timeFormatText() {
        return ('//div[contains(text(),"Time Format")]')
    }

    get timeFormatDropDown() {
        return ('//div[contains(text(),"Time Format")]/../div[@class="settings-input"]')
    }

    get networkText() {
        return ('//div[contains(text(),"Network")]')
    }

    get networkDropDown() {
        return ('//div[contains(text(),"Network")]/../div[@class="settings-input"]')
    }

    get exportPrivateKeyButton() {
        return ('//button[contains(text(),"Export")]')
    }

    get exportPrivateKeyText() {
        return ('//div[contains(text(),"Export")]')
    }

    get enterYourPasswordText() {
        return ('//div[contains(text(),"Enter your pass")]')
    }

    get enterYourPasswordField() {
        return ('//div[contains(text(),"Enter your pass")]/../..//input')
    }

    get closeButton() {
        return ('//span[contains(text(),"Close")]')
    }

    get unlockButton() {
        return ('//span[contains(text(),"Unlock")]')
    }

    get revealPrivateKeyText() {
        return ('//div[contains(text(),"Reveal")]')
    }

    get errorMessageText() {
        return ('//div[@class="DialogError"]')
    }

    get securityInfoText() {
        return ('//div[contains(text(),"Please, make sure your screen")]')
    }

    get revealPrivateKeyButton() {
        return ('//button[@title="Reveal Private Key"]')
    }

    get blurredPrivateKey() {
        return ('//div[contains(@class,"DialogQRCode")]')
    }

    get privateKeyValue() {
        return ('//div[@class="qr-content"]')
    }

    get downloadPrivateKeyButton() {
        return ('//button[contains(text(), "Download")]')
    }

    get saganoNetwork() {
        return ('//div[@class="ant-select-item-option-content" and contains(text(),"Sagano")]')
    }

    get mainnetNetwork() {
        return ('//div[@class="ant-select-item-option-content" and contains(text(),"Mainnet")]')
    }

    get mordorNetwork() {
        return ('//div[@class="ant-select-item-option-content" and contains(text(),"Mordor")]')
    }

    get customNetwork() {
        return ('//div[@class="ant-select-item-option-content" and contains(text(),"Custom")]')
    }

    get confirmButton() {
        return ('//button[@data-testid="right-button"]')
    }

    get confirmMainnetText() {
        return ('//input[@class="ant-input input"]')
    }

    get mantisDataDirectoryText() {
        return ('//div[text()="Mantis data directory"]')
    }

    get mantisDataDirectoryValue() {
        return ('//div[text()="Mantis data directory"]/..//input')
    }

    async checkIfYouAreOnSettingsPage() {
        expect(await this.getText(this.mySettingsText))
            .to.equal('My settings')
    }

    async darkModeToggle() {
        await this.checkDarkModeText()
        await this.checkDarkModeClass()
        await this.clickToggleSwitch()
    }

    async checkDarkModeText() {
        expect(await this.getText(this.enableDarkModeText))
            .to.equal('Enable Dark Mode')
    }

    async checkDarkModeClass() {
        expect(await this.getAttributeClass(this.colorThemeAtribute))
            .to.equal('theme-dark')
    }

    async clickToggleSwitch() {
        await this.click(this.enableDarkModeSwitch)
    }

    async checkLightModeClass() {
        expect(await this.getAttributeClass(this.colorThemeAtribute))
            .to.equal('theme-light')
    }

    async checkColorThemeChanges() {
        await this.checkLightModeClass()
        await this.clickToggleSwitch()
    }

    async checkLanguageText() {
        expect(await this.getText(this.languageText))
            .to.equal('Language')
    }

    async checkLanguageOptions() {
        await this.checkLanguageText()
        await this.pickLanguageFormat()
    }

    async clickLanguageDropdown() {
        await this.click(this.languageDropDown)
    }

    async pickLanguageFormat() {
        for (let i = 0; i < TD.LanguageFormat.length; i++) {
            await this.clickLanguageDropdown()
            await this.click('//div[@class="ant-select-item-option-content" and text()="' + TD.LanguageFormat[i] + '"]')
            expect(
                helpers.readJSONFile(configFilePath).settings.language)
                .to.equal('en')
        }
    }

    async clickDateFormatDropdown() {
        await this.click(this.dateFormatDropDown)
    }

    async pickDateFormat() {
        for (let i = 0; i < TD.DateFormat.length; i++) {
            await this.clickDateFormatDropdown()
            await this.click('//div[@class="ant-select-item-option-content" and text()="' + TD.DateFormat[i] + '"]')
            expect(
                helpers.readJSONFile(configFilePath).settings.dateFormat)
                .to.equal(TD.DateFormat[i])
        }
    }

    async clickTimeFormatDropdown() {
        await this.click(this.timeFormatDropDown)
    }

    async pickTimeFormat() {
        for (let i = 0; i < TD.TimeFormat.length; i++) {
            await this.clickTimeFormatDropdown()
            await this.click('//div[@class="ant-select-item-option-content" and text()="' + TD.TimeFormat[i] + '"]')
            expect(
                helpers.readJSONFile(configFilePath).settings.timeFormat)
                .to.equal(TD.TimeFormat[i])
        }

    }

    async checkDateFormatText() {
        expect(await this.getText(this.dateFormatText))
            .to.equal('Date Format')
    }

    async checkDateOptions() {
        await this.checkDateFormatText()
        await this.pickDateFormat()
    }

    async checkTimeFormatText() {
        expect(await this.getText(this.timeFormatText))
            .to.equal('Time Format')
    }

    async checkTimeOptions() {
        await this.checkTimeFormatText()
        await this.pickTimeFormat()
    }

    async clickConfirmButton() {
        await this.click(this.confirmButton);
    }

    async getSelectedNetworkText() {
        return this.getText(this.networkDropDown);

    }

    async clickNetworkDropdown() {
        await this.click(this.networkDropDown);

    }

    async clickOnNetwork(network) {
        await this.click('//div[@class="ant-select-item-option-content" and contains(text(),"' + network + '")]');
    }

    async typeNetworkNameIntoField(name) {
        await this.typeText(this.confirmMainnetText, name);
    }

    async checkNetworkOptions(network) {

        const selectedNetwork = await this.getSelectedNetworkText()

        switch (network) {
            case "Sagano Testnet":
                if (selectedNetwork !== 'Sagano Testnet') {
                    await this.clickNetworkDropdown()
                    await this.clickOnNetwork("Sagano")
                    await this.clickConfirmButton()
                }

                expect(await this.getSelectedNetworkText())
                    .to.equal(network);

                expect(
                    helpers.readJSONFile(configFilePath).networkName)
                    .to.equal('testnet-internal-nomad')

                break;

            case "Mainnet":
                if (selectedNetwork !== 'Mainnet') {
                    await this.clickNetworkDropdown()
                    await this.clickOnNetwork("Mainnet")
                    await this.typeNetworkNameIntoField("MAINNET")
                    await this.clickConfirmButton()
                }

                expect(await this.getSelectedNetworkText())
                    .to.equal(network);

                expect(
                    helpers.readJSONFile(configFilePath).networkName)
                    .to.equal('etc')

                break;

            case "Mordor":
                if (selectedNetwork !== 'Mordor') {
                    await this.clickNetworkDropdown()
                    await this.clickOnNetwork("Mordor")
                    await this.clickConfirmButton()
                }

                expect(await this.getSelectedNetworkText())
                    .to.equal(network);

                expect(
                    helpers.readJSONFile(configFilePath).networkName)
                    .to.equal('mordor')

                break;

            case "Custom":
                if (selectedNetwork !== 'Custom') {
                    await this.clickNetworkDropdown()
                    await this.clickOnNetwork("Custom")
                    await this.typeNetworkNameIntoField("Custom")
                    await this.clickConfirmButton()
                }

                expect(
                    helpers.readJSONFile(configFilePath).networkName)
                    .to.equal('Custom')

                break;
        }
    }

    async checkMantisDataDirectoryText() {
        expect(await this.getText(this.mantisDataDirectoryText))
            .to.equal('Mantis data directory')
    }

    async checkCurrentDirectory() {
        await this.checkMantisDataDirectoryText()
        const walletDirectory = await this.getValue(this.mantisDataDirectoryValue)
        expect(
            helpers.readJSONFile(configFilePath).settings.mantisDatadir)
            .to.equal(walletDirectory)
    }

    async clickOnExportPrivateKey() {
        await this.click(this.exportPrivateKeyButton)
    }

    async enterPassword(pass) {
        if (pass === "empty") {
            await this.typeText(this.enterYourPasswordField, "")
        } else {
            await this.typeText(this.enterYourPasswordField, pass)
        }
    }

    async clickOnUnlockButton() {
        await this.click(this.unlockButton)
    }

    async checkIfYouAreOnExportPrivateKey() {
        expect(await this.getText(this.revealPrivateKeyText))
            .to.equal('Reveal Private Key')
    }

    async checkIfPrivateKeyIsBlurred(blurred) {
        expect(await this.getAttributeClass(this.blurredPrivateKey))
            .to.equal(blurred)
    }

    async blurredToggle() {
        await this.click(this.revealPrivateKeyButton)
    }

    async clickCloseButton() {
        await this.click(this.closeButton)
    }

    async errorMessageDisplayed() {
        expect(await this.getText(this.errorMessageText)
        ).to.equal(TD.PVKIncorrectPassError)
    }

}

module.exports = new SettingsPage()