Feature: Gallery page

  Scenario: View a gallery

    When I open the `gallery page`
    Then I see a `gallery title`
    And I see a `content card` in the `gallery images`
    And I am on an accessible page

  Scenario: Go to a item
    When I open the `gallery page`
    Then I see a `content card` in the `gallery images`
    And I click a `content card`
    And I wait for the page to load
    Then I see an `item page`
