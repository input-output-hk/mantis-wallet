//Address Book Page
const expect = require('chai').expect;
const TD = require('../test_data/testData.json');
const BasePage = require('../pages/BasePage.js');

class AddressBookPage extends BasePage.constructor {

    get myAddressBookText() {
        return ('//div[@class="main-title"]')
    }

    get firstContactText() {
        return ('//div[@class="row"][1]/span[@class="label"]')
    }

    get firstContactAddress() {
        return ('//div[@class="row"][1]/span[@class="address"]')
    }

    get firstContactRecycleBin() {
        return ('//div[@class="row"][1]/span[@class="actions"]/span[@class="delete"]')
    }

    get firstContactEdit() {
        return ('//div[@class="row"][1]/span[@class="actions"]/span[@class="edit"]')
    }

    get firstContactCopy() {
        return ('//div[@class="row"][1]/span[@class="address"]/span')
    }

    get deleteContact() {
        return ('//span[@class="delete"]')
    }

    get deleteContactText() {
        return ('//div[text()="Delete Contact"]')
    }

    get areYouSureDeleteContactText() {
        return ('//p[contains(text(),"Are you sure")]')
    }

    get deleteButtonOnPopup() {
        return ('//span[text()="Delete"]')
    }

    get noSavedContactText() {
        return ('//div[text()="No saved contacts"]')
    }

    get editContact() {
        return ('//span[@class="edit"]')
    }

    get addNewButton() {
        return ('//button[text()="Add new"]')
    }

    get newContactText() {
        return ('//div[@class="title" and contains(text(),"New Contact") ]')
    }

    get addressText() {
        return ('//label[contains(text(),"Address")]')
    }

    get addressField() {
        return ('//input[@id="contact-address"]')
    }

    get labelText() {
        return ('//label[contains(text(),"Label")]')
    }

    get labelField() {
        return ('//input[@id="contact-label"]')
    }

    get saveContactButton() {
        return ('//span[contains(text(),"Save Contact")]/..')
    }

    get cancelButton() {
        return ('//span[contains(text(),"Cancel")]')
    }

    get addressMustBeSetText() {
        return ('//div[contains(@class,"ant-form-item-explain")]')
    }

    get labelMustBeSetText() {
        return ('//div[text()="Label must be set"]')
    }

    get errorMessage() {
        return ('//*[@class="DialogError"]')
    }

    get cancelModalX() {
        return ('//button[@class="ant-modal-close"]')
    }

    async checkIfYouAreOnAddressBookPage() {
        expect(await this.getText(this.myAddressBookText))
            .to.equal('My contacts')
    }

    async clickOnAddNewContact() {
        await this.click(this.addNewButton)
    }

    async addNewContactAddress(address) {
        await this.typeText(this.addressField, address)
    }

    async addNewContactLabel(label) {
        await this.typeText(this.labelField, label)
    }

    async clickSaveNewContact() {
        await this.click(this.saveContactButton)
    }

    async checkForNewContact(label) {
        await this.checkForContactLabel(label)
        await this.checkForContactAddress()
    }

    async checkForContactLabel(label) {
        expect(await this.getText(this.firstContactText))
            .to.equal(label)
    }

    async checkForContactAddress() {
        expect(await this.getText(this.firstContactAddress))
            .to.equal(TD.Addresses.WalletAddress)
    }

    async saveButtonIsNonClickable() {
        expect(await this.getHTML(this.saveContactButton))
            .to.include('disabled')
    }

    async closeAddNewContact() {
        await this.click(this.cancelModalX)
    }

    async saveInvalidContactErrorMessage() {
        await this.someFieldsError()
        await this.invalidAddressError()

    }

    async someFieldsError() {
        expect(await this.getText(this.errorMessage))
            .to.equal(TD.Addresses.NewContactError)
    }

    async invalidAddressError() {
        expect(await this.getText(this.addressMustBeSetText))
            .to.equal(TD.Addresses.InvalidAddressError)
    }

    async clickEditContact() {
        await this.click(this.editContact)
    }

    async deleteExistingContact() {
        await this.clickDeleteContact()
        await this.checkDeleteContactText()
        await this.checkAreYouSureText()
        await this.clickDeleteButtonOnPopup()
    }

    async clickDeleteContact() {
        await this.click(this.deleteContact)
    }

    async checkDeleteContactText() {
        expect(await this.getText(this.deleteContactText))
            .to.equal(TD.Addresses.DeleteContactText)
    }

    async checkAreYouSureText() {
        expect(await this.getText(this.areYouSureDeleteContactText))
            .to.equal(TD.Addresses.AreYouSureText)
    }

    async clickDeleteButtonOnPopup() {
        await this.click(this.deleteButtonOnPopup)
    }

    async checkIfAddressBookIsEmpty() {
        expect(await this.getText(this.noSavedContactText))
            .to.equal(TD.Addresses.NoSavedContactText)
    }
}

module.exports = new AddressBookPage()