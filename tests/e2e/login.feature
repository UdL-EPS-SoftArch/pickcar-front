Feature: User login
  Scenario: Successful login shows the user's name and profile
    Given there is a registered user "E2E Driver" with email "e2e-driver@sample.app" and password "password123"
    And I open the main page
    When I click the button "Login"
    And I enter "e2e-driver@sample.app" and "password123"
    Then I should see the user page for "E2E Driver"
    And the header shows the current user "E2E Driver"
    And the user page shows role "DRIVER" and status "PENDING_EMAIL"

  Scenario: Header link opens the logged-in user's profile
    Given there is a registered user "E2E Driver" with email "e2e-driver@sample.app" and password "password123"
    And I open the login page
    And I enter "e2e-driver@sample.app" and "password123"
    And I should see the user page for "E2E Driver"
    When I open the main page
    And I click the current user in the header
    Then I should see the user page for "E2E Driver"

  Scenario: Wrong password
    Given there is a registered user "E2E Driver" with email "e2e-driver@sample.app" and password "password123"
    And I open the login page
    When I enter "e2e-driver@sample.app" and "wrong-password"
    Then I should see the login error "Login failed"
