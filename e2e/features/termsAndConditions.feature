#
# Mantis Wallet Accept terms and conditions feature
# Steps in: ../steps/login.js
#

@TermsAndConditions
@Regression
Feature: Accept terms and conditions

  As a regular user when I login into Mantis Wallet application
  for the first time I should read and accept Terms and Conditions

  @TermsAndConditions01
  Scenario Outline: Accept Terms and Conditions
    Given I start Mantis wallet on "<network>"
    And I should be able to accept Terms and conditions
    Then I should see Create new Wallet and Restore Wallet options
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

  @TermsAndConditions02
  Scenario Outline: Accept Terms and Conditions
    Given I start Mantis wallet on "<network>"
    When I do not accept Terms and conditions
    Then I should see Error Message on TOS
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