Feature: Browse the records list
  In order to discover records
  As a visitor or registered user
  I want to browse the records available to me from the main menu

  Background:
    Given I open the main page
    When I click the button "Login"
    And I enter "demo" and "password"
    Then I should see the user page for "demo"
    When I create a new record with name "List Public Record" and description "Shared with everyone" and status "PUBLIC"
    And I create a new record with name "List Private Record" and description "Only for the owner" and status "PRIVATE"

  Scenario: An unauthenticated user sees only public records
    When I logout
    And I click the link "Records"
    Then I should see the records page
    And I should see the record "List Public Record" in the records list
    But I should not see the record "List Private Record" in the records list

  Scenario: An authenticated user sees public records and their own private records
    When I click the link "Records"
    Then I should see the records page
    And I should see the record "List Public Record" in the records list
    And I should see the record "List Private Record" in the records list

  Scenario: The records list shows five records per page
    When I create a new record with name "Extra Public 1" and description "Page fill" and status "PUBLIC"
    And I create a new record with name "Extra Public 2" and description "Page fill" and status "PUBLIC"
    And I create a new record with name "Extra Public 3" and description "Page fill" and status "PUBLIC"
    And I create a new record with name "Extra Public 4" and description "Page fill" and status "PUBLIC"
    And I create a new record with name "Extra Public 5" and description "Page fill" and status "PUBLIC"
    When I click the link "Records"
    Then I should see the records page
    And I should see at most 5 records on the page
    And I should see the page indicator "Page 1 of"
    When I click the link "Next"
    Then I should see the page indicator "Page 2 of"
    And I should see at most 5 records on the page
