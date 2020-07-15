Feature: Topics listing page

  Scenario: View an index of topics

    When I visit the `topics listing page`
    Then I see a `pagination navigation`
    And I am on an accessible page

  Scenario: Opening a topic

    When I visit the `topics listing page`
    And I click a `content card`
    And I wait for the page to load
    Then I see an `entity page`
