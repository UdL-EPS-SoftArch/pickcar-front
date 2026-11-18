Feature: Landing page search
  As a driver
  I want to search for cars from the main page
  So that I can find a car for my dates

  Scenario: Search with a location and valid dates
    Given I open the main page
    When I search cars in "Lleida" from 1 days to 3 days from now
    Then I should be on the search page for "Lleida"

  Scenario: Location is required
    Given I open the main page
    When I search cars in "" from 1 days to 3 days from now
    Then I should see the search error "Location is required"
    And I should still be on the main page

  Scenario: Return must be after pickup
    Given I open the main page
    When I search cars in "Lleida" from 3 days to 1 days from now
    Then I should see the search error "Return must be after pickup"
    And I should still be on the main page

  Scenario: Pickup cannot be in the past
    Given I open the main page
    When I search cars in "Lleida" from -1 days to 2 days from now
    Then I should see the search error "Pickup cannot be in the past"
