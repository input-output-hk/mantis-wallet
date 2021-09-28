#
# Mantis Wallet receive address feature
# Steps in: ../steps/receiveAddress.js & ../steps/login.js
#

@Receive
@Regression
Feature: Receive address on Mantis wallet

  As a regular user
  I want to see my address
  Because I want to send my address to another user

  @Receive01
  @Smoke
  Scenario Outline: My address on Mantis wallet
    Given I restore Mantis Wallet on "<network>"
    When I click on receive button on main page on Mantis wallet
    Then I expect to see my address on Mantis wallet
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