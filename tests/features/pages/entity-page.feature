Feature: Entity page

  Scenario: View any existing entity page
    When I open an `entity page`
    Then I see the `entity page`
    And I see an `entity title`
    And I see an `entity depiction`
    And I see an `entity attribution`
    And I see an `entity description`
    And I see `total results`
    And I see a `search list view toggle`
    And I see a `search bar pill`
    And I see a `search facet`
    And I should see 9 `search result`s
    And I see a `pagination navigation`
    And I don't have a `tier toggle`
    And I am on an accessible page

  Scenario: Attempting to view an entity page which doesn't exist
    When I open `/en/entity/person/123x-unknown`
    Then I see an `error notice`

  Scenario: View related entities
    When I open an `entity page`
    And I see the `entity page`
    Then I should have 4 `browse chip`s

  Scenario: Click on a related entity
    When I open an `entity page`
    And I see the `entity page`
    And I click a `browse chip`
    And I wait 5 seconds
    Then I should not be on the `entity page`

  Scenario: Navigating to a related record
    When I open an `entity page`
    And I see the `entity page`
    And I see a `search result`
    And I click a `search result`
    Then I see a `record page`

  Scenario: Pagination links
    When I open an `entity page`
    And I see the `entity page`
    And I see a `search result`
    Then I see a link to "/en/entity/topic/18-newspaper?page=2&view=grid" in the `pagination navigation`

  Scenario: Pagination links work when the page was accessed from the url
    When I visit `/en/entity/topic/18-newspaper?page=2`
    And I accept cookies
    And I go to page number 3
    And I wait 2 seconds
    Then I should be on `/en/entity/topic/18-newspaper?page=3&view=grid`

  Scenario: Searching from an entity page searches within that entity
    When I open an `entity page`
    And I see the `entity page`
    And I see a `search result`
    And I enter "newspaper" in the `search box`
    And I click the `search button`
    Then I see the `entity page`
    And I see "newspaper" in the `search box`

  Scenario: Removing search pill
    When I open an `entity page`
    And I go to page number 2
    And I wait 2 seconds
    And I am on page number 2
    And I see the `search bar pill`
    And I click the `search bar pill button`
    Then I see the `search page`
    And I don't have the `search bar pill`
    And I am on page number 1
