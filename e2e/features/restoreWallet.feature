#
# Mantis Restore Wallet  feature
# Steps in: ../steps/restoreWallet.js & ../steps/login.js
#

@RestoreWallet
@Regression
Feature: Create Mantis Wallet

  As a regular user
  I want to restore wallet
  with selected Network

  @RestoreWallet01
  @Smoke
  Scenario Outline: Restore Mantis wallet with private key
    Given I restore Mantis Wallet on "<network>"
    And I log out
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

  @RestoreWallet02
  @Smoke
  Scenario Outline: Restore Mantis wallet with word phrases
    Given I start restoring a wallet on "<network>"
    Then I enter wallet name, recovery phrase and passwords
    And I log out
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

  @RestoreWallet03
  Scenario Outline: Restore Mantis wallet without wallet name
    Given I start restoring a wallet on "<network>"
    Then I enter private key and passwords without the wallet name
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

  @RestoreWallet04
  Scenario Outline: Restore Mantis wallet with empty pvk
    Given I start restoring a wallet on "<network>"
    Then I dont enter private key and I enter passwords and wallet name
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

  @RestoreWallet05
  Scenario Outline: Restore Mantis wallet with incorrect pvk
    Given I start restoring a wallet on "<network>"
    Then I enter passwords wallet name and incorrect PVK
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

  @RestoreWallet06
  Scenario Outline: Restore Mantis wallet - pass validations
    Given I start restoring a wallet on "<network>"
    When I enter "<password>" and "<confirmPass>" wallet name and PVK
    Then I should see an Error <message>
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

  @RestoreWallet07
  Scenario Outline: Restore Mantis wallet without word phrases
    Given I start restoring a wallet on "<network>"
    When I choose recovery phrases
    When I enter wallet name and passwords without word phrases
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

  @RestoreWallet08
  Scenario Outline: Restore Mantis wallet with word phrases
    Given I start restoring a wallet on "<network>"
    Then I enter wallet name, incorrect recovery phrase and passwords
    #And I close Mantis Wallet

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

 @RestoreWallet09
  @Smoke
  Scenario Outline: Restore Mantis wallet and check transactions
    Given I restore specific Mantis Wallet on "<network>"
    And I check my transactions
    And I log out
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