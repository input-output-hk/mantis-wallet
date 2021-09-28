#
# Mantis Wallet support feature
# Steps in: ../steps/support.js & ../steps/login.js
#

@Support
@Regression
Feature: Support on Mantis wallet

  As a regular user
  I want to see support page
  Because I want to send support ticket

  @Support01
  Scenario Outline: I see support page on Mantis wallet
    Given I restore Mantis Wallet on "<network>"
    When I click on support button on main page
    Then I expect to see support page
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