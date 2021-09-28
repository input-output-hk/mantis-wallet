#
# Mantis Wallet address book feature
# Steps in: ../steps/addressBook.js & ../steps/login.js
#

@Address
@Regression
Feature: Address book on Mantis wallet

  As a regular user
  I want to see my address book
  Because I want to see my contacts

  @Address01
  Scenario Outline:I see address book page on Mantis wallet
    Given I restore Mantis Wallet on "<network>"
    When I click on address book button on main page
    Then I expect to see address book page on Mantis wallet
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        |
      | Sagano Testnet |

    @Mainnet
    Examples:
      | network        |
      | Mainnet        |

    @Mordor
    Examples:
      | network        |
      | Mordor         |

  @Address02
  Scenario Outline:I can add new contact address
    Given I restore Mantis Wallet on "<network>"
    When I click on address book button on main page
    Then I choose add new button
    Then I enter new contact address and label
    Then I expect to see new contact in my address book
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        |
      | Sagano Testnet |

    @Mainnet
    Examples:
      | network        |
      | Mainnet        |

    @Mordor
    Examples:
      | network        |
      | Mordor         |

  @Address03
  Scenario Outline:I can not add new contact address with empty address
    Given I restore Mantis Wallet on "<network>"
    When I click on address book button on main page
    Then I choose add new button
    Then I enter new contact with empty address and label
    Then Save button should be non-clickable
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        |
      | Sagano Testnet |

    @Mainnet
    Examples:
      | network        |
      | Mainnet        |

    @Mordor
    Examples:
      | network        |
      | Mordor         |

  @Address04
  Scenario Outline:I can not add new contact address with empty label
    Given I restore Mantis Wallet on "<network>"
    When I click on address book button on main page
    Then I choose add new button
    Then I enter new contact with address and empty label
    Then Save button should be non-clickable
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        |
      | Sagano Testnet |

    @Mainnet
    Examples:
      | network        |
      | Mainnet        |

    @Mordor
    Examples:
      | network        |
      | Mordor         |

  @Address05
  Scenario Outline:I can not add new contact address with invalid address
    Given I restore Mantis Wallet on "<network>"
    When I click on address book button on main page
    Then I choose add new button
    Then I enter new contact with invalid address and label
    Then I should see error message
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        |
      | Sagano Testnet |

    @Mainnet
    Examples:
      | network        |
      | Mainnet        |

    @Mordor
    Examples:
      | network        |
      | Mordor         |

  @Address06
  Scenario Outline:I can edit existing contact address
    Given I restore Mantis Wallet on "<network>"
    When I click on address book button on main page
    Then I choose add new button
    Then I enter new contact address and label
    Then I expect to see new contact in my address book
    Then I edit existing contact
    When I expect to see edited contact
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        |
      | Sagano Testnet |

    @Mainnet
    Examples:
      | network        |
      | Mainnet        |

    @Mordor
    Examples:
      | network        |
      | Mordor         |

  @Address07
  Scenario Outline:I can delete existing contact address
    Given I restore Mantis Wallet on "<network>"
    When I click on address book button on main page
    Then I choose add new button
    Then I enter new contact address and label
    Then I expect to see new contact in my address book
    Then I delete existing contact
    When I should have empty address book
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        |
      | Sagano Testnet |

    @Mainnet
    Examples:
      | network        |
      | Mainnet        |

    @Mordor
    Examples:
      | network        |
      | Mordor         |