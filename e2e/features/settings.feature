#
# Mantis Wallet settings feature
# Steps in: ../steps/settings.js & ../steps/login.js
#

@Settings
@Regression
Feature: Settings on Mantis wallet

  As a regular user
  I want to see my settings
  Because I want to customize my settings

  @Settings01
  Scenario Outline: I see my settings page on Mantis wallet
    Given I restore Mantis Wallet on "<network>"
    And I click on settings button on main page
    Then I expect to see my settings page
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

  @Settings02
  Scenario Outline: I change Mantis Wallet color theme
    Given I restore Mantis Wallet on "<network>"
    And I click on settings button on main page
    When I click enable dark mode
    Then I expect to see color theme changed
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

  @Settings03
  Scenario Outline: I can change language, date format and time format
    Given I restore Mantis Wallet on "<network>"
    And I click on settings button on main page
    Then I can change language, date format and time format
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

  @Settings04
  Scenario Outline: I can change Network
    Given I restore Mantis Wallet on "<network>"
    And I click on settings button on main page
    Then I change "<networkChange>" in Settings
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | networkChange  |
      | Sagano Testnet | Mainnet        |
      | Sagano Testnet | Mordor         |
      | Sagano Testnet | Custom         |

    @Mainnet
    Examples:
      | network        | networkChange  |
      | Mainnet        | Sagano Testnet |
      | Mainnet        | Mordor         |
      | Mainnet        | Custom         |

    @Mordor
    Examples:
      | network        | networkChange  |
      | Mordor         | Sagano Testnet |
      | Mordor         | Mainnet        |
      | Mordor         | Custom         |

    @Custom
    Examples:
      | network        | networkChange  |
      | Custom         | Sagano Testnet |
      | Custom         | Mordor         |
      | Custom         | Mainnet        |

  @Settings05
  Scenario Outline: Check wallet directory
    Given I restore Mantis Wallet on "<network>"
    And I click on settings button on main page
    Then I can check wallet directory
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

  @Settings06
  Scenario Outline: Export private key
    Given I restore Mantis Wallet on "<network>"
    And I click on settings button on main page
    Then I click Export private key button
    Then I enter my password and click unlock
    Then I expect to see export private key and it is blurred
    When I click on switch
    Then I should see private key
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

  @Settings07
  Scenario Outline: Export private key password
    Given I restore Mantis Wallet on "<network>"
    And I click on settings button on main page
    Then I click Export private key button
    Then I enter "<password>" and click unlock
    Then I should see error message for wrong pass
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | password  |
      | Sagano Testnet | Qwerty123 |
      | Sagano Testnet | empty     |

    @Mordor
    Examples:
      | network        | password  |
      | Mordor         | Qwerty123 |
      | Mordor         | empty     |

    @Mainnet
    Examples:
      | network        | password  |
      | Mainnet        | Qwerty123 |
      | Mainnet        | empty     |