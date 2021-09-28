#
# Mantis Wallet status feature
# Steps in: ../steps/status.js & ../steps/login.js
#

@Status
@Regression
Feature: Status on Mantis wallet

  As a regular user
  I want to see my status
  Because I want to see my status

  @Status01
  Scenario Outline: Status page on Mantis wallet
    Given I restore Mantis Wallet on "<network>"
    When I click on status button on main page on Mantis wallet
    Then I expect to see status page on Mantis wallet
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