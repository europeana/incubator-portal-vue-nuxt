Feature: View styles (List and Grid)
  In order to gain a better overview of
  different types of europeana records,
  as a user I want to be able to switch between
  a list and grid view style when on
  search results pages.

  Scenario: Defaulting to grid view
    When I visit the `search page`
    And I click the `search button`
    Then I see a `search results grid`

  Scenario: Defaulting to grid view after paginating
    When I visit the `search page`
    And I click the `search button`
    And I click the "/search?page=2&query=&view=grid" link
    Then I see a `search results grid`

  Scenario: Switching to the list view
    When I visit the `search page`
    And I click the `search button`
    And I click the `search list view toggle`
    Then I see a `search results list`

  Scenario: Switching to the grid view
    When I open `/search?query=&view=list`
    And I click the `search grid view toggle`
    Then I see a `search results grid`

  Scenario: Switching to the list view and paginating
    When I visit the `search page`
    And I click the `search button`
    And I click the `search list view toggle`
    And I click the "/search?page=2&query=&view=list" link
    Then I see a `search results list`

  Scenario: The view parameter is preserved and present in the URL for the grid view
    Given I have chosen the `grid` search results view
    When I visit the `home page`
    And I click the `search button`
    And I wait 2 seconds
    Then I should be on `/search?view=grid&query=&page=1`

  Scenario: The view parameter is preserved and present in the URL for the list view
    Given I have chosen the `list` search results view
    When I visit the `home page`
    And I click the `search button`
    And I wait 2 seconds
    Then I should be on `/search?view=list&query=&page=1`
