const {When, Then} = require('@cucumber/cucumber');
const addressBook = require('../pages/AddressBookPage.js');
const loggedInPage = require('../pages/LoggedInPage')
const TD = require('../test_data/testData.json');

When(/^I click on address book button on main page$/, async () => {
    await loggedInPage.goToAddressBook()
});
Then(/^I expect to see address book page on Mantis wallet$/, async () => {
    await addressBook.checkIfYouAreOnAddressBookPage()
});
Then(/^I choose add new button$/, async () => {
    await addressBook.clickOnAddNewContact()
});
Then(/^I enter new contact address and label$/, async () => {
    await addressBook.addNewContactAddress(TD.Addresses.WalletAddress)
    await addressBook.addNewContactLabel(TD.Addresses.WalletName)
    await addressBook.clickSaveNewContact()
});
Then(/^I expect to see new contact in my address book$/, async () => {
    await addressBook.checkForNewContact(TD.Addresses.WalletName)
});
Then(/^I enter new contact with empty address and label$/, async () => {
    await addressBook.addNewContactAddress(TD.Addresses.EmptyWalletAddress)
    await addressBook.addNewContactLabel(TD.Addresses.WalletName)
});
Then(/^Save button should be non\-clickable$/, async () => {
    await addressBook.saveButtonIsNonClickable()
    await addressBook.closeAddNewContact()
});
Then(/^I enter new contact with address and empty label$/, async () => {
    await addressBook.addNewContactAddress(TD.Addresses.WalletAddress)
    await addressBook.addNewContactLabel(TD.Addresses.EmptyWalletName)
});
Then(/^I enter new contact with invalid address and label$/, async () => {
    await addressBook.addNewContactAddress(TD.Addresses.InvalidWalletAddress)
    await addressBook.addNewContactLabel(TD.Addresses.WalletName)
    await addressBook.clickSaveNewContact()
});
Then(/^I should see error message$/, async () => {
    await addressBook.saveInvalidContactErrorMessage()
    await addressBook.closeAddNewContact()
});
Then(/^I edit existing contact$/, async () => {
    await addressBook.clickEditContact()
    await addressBook.addNewContactLabel(TD.Addresses.EditedWalletName)
    await addressBook.clickSaveNewContact()
});
When(/^I expect to see edited contact$/, async () => {
    await addressBook.checkForNewContact(TD.Addresses.WalletName + TD.Addresses.EditedWalletName)
});
Then(/^I delete existing contact$/, async () => {
    await addressBook.deleteExistingContact()
});
When(/^I should have empty address book$/, async () => {
    await addressBook.checkIfAddressBookIsEmpty()
});