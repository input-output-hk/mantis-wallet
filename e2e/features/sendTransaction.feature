#
# Mantis Wallet send transaction feature
# Steps in: ../steps/sendTransaction.js & ../steps/login.js
#

@SendTransaction
@Regression
Feature: Send transaction on Mantis wallet

  As a regular user
  I want send ETC on Mantis Wallet
  Because I want to send ETC to my friends

  @Smoke
    @SendTransaction01
  Scenario Outline: I send ETC to another wallet
    Given I restore Mantis Wallet on "<network>"
    When I click send button on main page
    Then I enter receiving address "<address>"
    And I enter amount to send "<amount>"
    And I click send
    And I enter password "<pass>"
    And I confirm transaction
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | address                                    | amount | pass         |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292 | 0.001  | TestPass123! |

#    @Mainnet
#    Examples:
#      | network        | address                                    | amount | pass         |
#      |Mainnet         |                                            |        |              |

#    @Mordor
#    Examples:
#      | network        | address                                    | amount | pass         |
#      |Mordor          |                                            |        |              |

  @SendTransaction02
  Scenario Outline: I send with incorrect pass
    Given I restore Mantis Wallet on "<network>"
    When I click send button on main page
    Then I enter receiving address "<address>"
    And I enter amount to send "<amount>"
    And I click send
    And I enter password "<pass>"
    And I confirm transaction
    Then I should see incorrect pass error
    Then I should close send transaction window
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | address                                    | amount | pass          |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292 | 0.001  | TestPass123!1 |

#    @Mainnet
#    Examples:
#      | network        | address                                    | amount | pass          |
#      |Mainnet         |                                            |        |               |

#    @Mordor
#    Examples:
#      | network        | address                                    | amount | pass          |
#      |Mordor          |                                            |        |               |

  @SendTransaction03
  Scenario Outline: I send without pass
    Given I restore Mantis Wallet on "<network>"
    When I click send button on main page
    Then I enter receiving address "<address>"
    And I enter amount to send "<amount>"
    And I click send
    And I confirm transaction
    Then I should see pass not provided error
    And I should see Additional Action Error
    Then I should close send transaction window
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | address                                    | amount |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292 | 0.001  |

#    @Mainnet
#    Examples:
#      | network        | address                                    | amount |
#      |Mainnet         |                                            |        |
#
#    @Mordor
#    Examples:
#      | network        | address                                    | amount |
#      |Mordor          |                                            |        |

  @SendTransaction04
  Scenario Outline: I send without address
    Given I restore Mantis Wallet on "<network>"
    When I click send button on main page
    And I enter amount to send "<amount>"
    And I click send
    Then I should see address not set error
    And I should see Additional Action Error
    Then I should close send transaction window
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | amount |
      | Sagano Testnet | 0.001  |

#    @Mainnet
#    Examples:
#      | network        | amount |
#      |Mainnet         |        |
#
#    @Mordor
#    Examples:
#      | network        | amount |
#      |Mordor          |        |

  @SendTransaction05
  Scenario Outline: I send with invalid address
    Given I restore Mantis Wallet on "<network>"
    When I click send button on main page
    Then I enter receiving address "<address>"
    And I enter amount to send "<amount>"
    And I click send
    Then I should see invalid address error
    And I should see Additional Action Error
    Then I should close send transaction window
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | address                                       | amount |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292154 | 0.001  |

#    @Mainnet
#    Examples:
#      | network        | address                                       | amount |
#      |Mainnet         |                                               |        |
#
#    @Mordor
#    Examples:
#      | network        | address                                       | amount |
#      |Mordor          |                                               |        |

  @SendTransaction06
  Scenario Outline: I send amount 0
    Given I restore Mantis Wallet on "<network>"
    When I click send button on main page
    Then I enter receiving address "<address>"
    And I enter amount to send "<amount>"
    And I click send
    Then should see must be grater than zero error
    And I should see Additional Action Error
    Then I should close send transaction window
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | address                                    | amount |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292 | 0      |

#    @Mainnet
#    Examples:
#      | network        | address                                    | amount |
#      |Mainnet         |                                            |        |
#
#    @Mordor
#    Examples:
#      | network        | address                                    | amount |
#      |Mordor          |                                            |        |

  @SendTransaction07
  Scenario Outline: I send ETC to another wallet
    Given I restore Mantis Wallet on "<network>"
    When I click send button on main page
    Then I enter receiving address "<address>"
    And I enter amount to send "<amount>"
    And I choose a fee "<fee>"
    And I click send
    And I enter password "<pass>"
    And I confirm transaction
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | address                                    | amount | pass         | fee     |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292 | 0.001  | TestPass123! | Fast    |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292 | 0.001  | TestPass123! | Average |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292 | 0.001  | TestPass123! | Slow    |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292 | 0.001  | TestPass123! | Custom  |

#    @Mainnet
#    Examples:
#      | network        | address                                    | amount | pass         | fee     |
#      |Mainnet         |                                            |        |              |         |
#
#    @Mordor
#    Examples:
#      | network        | address                                    | amount | pass         | fee     |
#      |Mordor          |                                            |        |              |         |

 @SendTransaction08
  Scenario Outline: I send ETC to another wallet Advanced options
    Given I restore Mantis Wallet on "<network>"
    When I click send button on main page
    Then I click advanced button
    Then I enter receiving address "<address>"
    And I enter amount to send "<amount>"
    And I click send
    And I enter password "<pass>"
    And I confirm transaction
    Then I log out
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | address                                    | amount | pass         |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292 | 0.001  | TestPass123! |

#    @Mainnet
#    Examples:
#      | network        | address                                    | amount | pass         |
#      |Mainnet         |                                            |        |              |

#    @Mordor
#    Examples:
#      | network        | address                                    | amount | pass         |
#      |Mordor          |                                            |        |              |

@SendTransaction09
  Scenario Outline: I send ETC to another wallet and check if transaction is received
    Given I restore Mantis Wallet on "<network>"
    When I click send button on main page
    Then I enter receiving address "<address>"
    And I enter amount to send "<amount>"
    And I click send
    And I enter password "<pass>"
    And I confirm transaction
    And I check if sent transaction is displayed in My transactions
    Then I log out
    And I close Mantis Wallet
    And I restore backup Mantis Wallet on "<network>"
    And I check if received transaction is displayed in My transactions
    And I close Mantis Wallet

    @Sagano
    Examples:
      | network        | address                                    | amount | pass         |
      | Sagano Testnet | 0xec49c61786376007494af082b02fac4adb4e4292 | 0.001  | TestPass123! |

#    @Mainnet
#    Examples:
#      | network        | address                                    | amount | pass         |
#      |Mainnet         |                                            |        |              |

#    @Mordor
#    Examples:
#      | network        | address                                    | amount | pass         |
#      |Mordor          |                                            |        |              |