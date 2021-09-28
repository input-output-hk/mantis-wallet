#
# Mantis Wallet My transactions feature
# Steps in: ../steps/myTransactions.js & ../steps/login.js
#

@Transactions
@Regression
Feature: My Transactions on Mantis Wallet

  As a regular user
  I want to see my transactions
  Because I want to see my transactions

  @Transactions01
  Scenario Outline: I see my transactions page on Mantis wallet
    Given I restore Mantis Wallet on "<network>"
    When I click on transactions button on main page
    Then I expect to see my transactions page
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