Feature: Record page

  Scenario: View any existing record page

    When I open a `record page`
    Then I see the `record page`
    And I see a `metadata field`
    And I see a `metadata field` in the `web resource`

  Scenario: Attempting to view a record page which doesn't exist

    When I open `/record/123456/THIS_IDENTIFIER_DOES_NOT_EXIST`
    Then I see an `error notice`
