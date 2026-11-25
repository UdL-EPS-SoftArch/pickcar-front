Feature: HAL client errors and write methods
  The HAL client turns backend errors into an ApiError with the status,
  the backend message and per-field validation errors, never the request body.

  Scenario: Validation errors are reported per field
    When I create a user through the API client with email "not-an-email" and password "secret-pass-123"
    Then the API error has status 400
    And the API error has a message for field "email"
    And the API error does not contain "secret-pass-123"

  Scenario: A duplicated email gives a 409 with the backend message
    Given there is a registered user "E2E Driver" with email "e2e-driver@sample.app" and password "password123"
    When I create a user through the API client with email "e2e-driver@sample.app" and password "password123"
    Then the API error has status 409
    And the API error message is "Could not commit changes!"
    And the API error does not contain "password123"

  Scenario: Profile changes are saved with PATCH
    Given there is a new API user with password "password123"
    When the API user changes the full name to "Patched Name"
    Then the API user's full name is "Patched Name"

  Scenario: Changing the password needs the current password
    Given there is a new API user with password "password123"
    When the API user changes the password from "wrong-password" to "new-password-123"
    Then the API error has status 403
    And the API error does not contain "new-password-123"
    When the API user changes the password from "password123" to "new-password-123"
    Then the API user can sign in with password "new-password-123"

  Scenario: Registration form shows the backend error for a used email
    Given there is a registered user "E2E Driver" with email "e2e-driver@sample.app" and password "password123"
    And I open the registration page
    When I register with name "Someone Else", email "e2e-driver@sample.app" and password "password123"
    Then I should see the field error "An account with this email already exists"
    And I am still on the registration page
