Feature: Page layout on all pages.
  In order to access the content of the website in
  an accessible, clear and enticing manner
  I want to be presented with an accessible and styled
  layout for all pages.

  Scenario: Accessing the skip-to-main functionality by tabbing to it
    When I visit an `item page`
    And I press the TAB key
    Then I see the `main content accessibility link`

  Scenario: Moving to the main content using the skip-to-main functionality
    When I visit an `item page`
    And I press the TAB key
    And I press the ENTER key
    Then I should be on `/en/item/09102/_GNM_693983#main`

  Scenario: Main navigation is visible
    When I open the `home page`
    Then I see the `main navigation`
