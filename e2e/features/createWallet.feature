#
# Mantis Create Wallet  feature
# Steps in: ../steps/createWallet.js & ../steps/login.js
#

@CreateWallet
@Regression
Feature: Create Mantis Wallet

  As a regular user
  I want to create new wallet
  with selected Network

  @CreateWallet01
  @Smoke
  Scenario Outline: Create Mantis wallet
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and passwords
    Then I confirm that private key is there
    Then I remember recovery phrase
    Then I re input recovery phrase
    Then I expect to see my transactions page
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

  @CreateWallet02
  Scenario Outline: Create Mantis wallet password validations
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and "<password>" and "<confirmPass>"
    Then I should see an Error "<message>"
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | password | confirmPass | message                                                                         |
      | Sagano Testnet | qwertQ1  | qwertQ1     | Password needs to be at least 8 characters                                      |
      | Sagano Testnet | qwertyu1 | qwertyu1    | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |
      | Sagano Testnet | QWERTYU1 | QWERTYU1    | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |
      | Sagano Testnet | qwertyUQ | qwertyUQ    | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |
      | Sagano Testnet | qwertQ1q | qwertQ1w    | Passwords don't match                                                           |
      | Sagano Testnet | empty    | empty       | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |

    @Mainnet
    Examples:
      | network        | password | confirmPass | message                                                                         |
      | Mainnet        | qwertQ1  | qwertQ1     | Password needs to be at least 8 characters                                      |
      | Mainnet        | qwertyu1 | qwertyu1    | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |
      | Mainnet        | QWERTYU1 | QWERTYU1    | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |
      | Mainnet        | qwertyUQ | qwertyUQ    | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |
      | Mainnet        | qwertQ1q | qwertQ1w    | Passwords don't match                                                           |
      | Mainnet        | empty    | empty       | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |

    @Mordor
    Examples:
      | network        | password | confirmPass | message                                                                         |
      | Mordor         | qwertQ1  | qwertQ1     | Password needs to be at least 8 characters                                      |
      | Mordor         | qwertyu1 | qwertyu1    | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |
      | Mordor         | QWERTYU1 | QWERTYU1    | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |
      | Mordor         | qwertyUQ | qwertyUQ    | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |
      | Mordor         | qwertQ1q | qwertQ1w    | Passwords don't match                                                           |
      | Mordor         | empty    | empty       | Password needs to have at least 1 uppercase, 1 lowercase and 1 number character |

  @CreateWallet03
  Scenario Outline: Create Mantis wallet name validations
    Given I start creation of a wallet on "<network>"
    Then I enter wallet "<name>" and passwords
    Then I should see a wallet name Error "<message>"
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | name  | message                 |
      | Sagano Testnet | empty | Name shouldn't be empty |

    @Mainnet
    Examples:
      | network        | name  | message                 |
      | Mainnet        | empty | Name shouldn't be empty |

    @Mordor
    Examples:
      | network        | name  | message                 |
      | Mordor         | empty | Name shouldn't be empty |

  @CreateWallet04
  Scenario Outline: Create Mantis wallet verify download PVK
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and passwords
    Then I verify download button
    Then I cancel creating wallet
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

  @CreateWallet05
  Scenario Outline: Cancel creating Mantis wallet
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and passwords
    Then I cancel creating wallet
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

  @CreateWallet06
  Scenario Outline: Cancel creating Mantis wallet after getting word phrases
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and passwords
    Then I confirm that private key is there
    Then I remember recovery phrase
    Then I click back
    Then I click back
    Then I cancel creating wallet
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

  @CreateWallet07
  Scenario Outline: Create Mantis wallet and do not accept Recovery Conditions
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and passwords
    Then I confirm that private key is there
    Then I remember recovery phrase
    Then I re input recovery phrase without accepting Recovery conditions
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

  @CreateWallet08
  Scenario Outline: Create Mantis wallet and do not accept Locally Conditions
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and passwords
    Then I confirm that private key is there
    Then I remember recovery phrase
    Then I re input recovery phrase without accepting Locally conditions
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

  @CreateWallet09
  Scenario Outline: Create Mantis wallet with incorrect word phrases order
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and passwords
    Then I confirm that private key is there
    Then I remember recovery phrase
    Then I re input recovery phrase in wrong order
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

  @CreateWallet10
  Scenario Outline: Create Mantis wallet - click back from phrases reinput
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and passwords
    Then I confirm that private key is there
    Then I remember recovery phrase
    Then I re input recovery phrase and I click back
    Then I click back
    Then I cancel creating wallet
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

  @CreateWallet11
  Scenario Outline: Create Mantis wallet - clear input of recovery phrases
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and passwords
    Then I confirm that private key is there
    Then I remember recovery phrase
    Then I reinput recovery phrase and I clear text
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

  @CreateWallet12
  Scenario Outline: Create Mantis wallet - Verify that I cannot create a wallet without reinput
    Given I start creation of a wallet on "<network>"
    Then I enter wallet name and passwords
    Then I confirm that private key is there
    Then I remember recovery phrase
    Then I confirm that wallet cant be created without word phrases
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