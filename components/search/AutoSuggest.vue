<template>
  <b-list-group
    v-show="isActive"
    :id="elementId"
    class="auto-suggest-dropdown"
    data-qa="search suggestions"
    role="listbox"
    :aria-label="$t('searchSuggestions')"
    :aria-hidden="!isActive"
  >
    <b-list-group-item
      v-if="showLoader && isLoading"
      class="loading"
    >
      {{ $t('loadingResults') }}{{ $t('formatting.ellipsis') }}
    </b-list-group-item>

    <b-list-group-item
      v-for="(val, name, index) in value"
      v-else
      :key="index"
      role="option"
      data-qa="search suggestion"
      :aria-selected="index === focus"
      :to="linkGen(val)"
      :class="{ 'hover': index === focus }"
      :data-index="index"
      @mouseover="focus = index"
      @focus="index === focus"
      @mousedown.prevent
    >
      <template
        v-for="(part, partIndex) in highlightResult(val)"
      >
        <strong
          v-if="part.highlight"
          :key="partIndex"
          class="highlight"
          data-qa="highlighted"
        >{{ part.text }}</strong> <!-- Do not put onto a new line -->
        <span
          v-else
          :key="partIndex"
        >{{ part.text }}</span> <!-- Do not put onto a new line -->
      </template>
    </b-list-group-item>
  </b-list-group>
</template>

<script>
  import match from 'autosuggest-highlight/match';
  import parse from 'autosuggest-highlight/parse';

  export default {
    name: 'AutoSuggest',

    props: {
      // Property names are identifiers, emitted when suggestion is selected.
      // Property values are the text for.the match
      // @example
      //     {
      //       "http://data.europeana.eu/concept/base/83": "World War I",
      //       "http://data.europeana.eu/agent/base/60496": "Poquelin, Jean-Baptiste"
      //     }
      value: {
        type: Object,
        default: () => {}
      },

      query: {
        type: String,
        default: ''
      },

      linkGen: {
        type: Function,
        default: (val) => val
      },

      elementId: {
        type: String,
        default: null
      },

      inputRefName: {
        type: String,
        default: 'searchbox'
      },

      showLoader: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        focus: null,
        isActive: Object.keys(this.value || {}).length > 0,
        isLoading: false
      };
    },

    computed: {
      suggestionValues() {
        return Object.keys(this.value);
      },

      suggestionLabels() {
        return Object.values(this.value);
      },

      numberOfSuggestions() {
        return this.suggestionValues.length;
      },

      noSuggestionHasFocus() {
        return this.focus === null;
      },

      inputRef() {
        return this.$parent.$refs[this.inputRefName];
      },

      inputElement() {
        // refs may point to a component or direct to an HTML element
        return this.inputRef.$el ? this.inputRef.$el : this.inputRef;
      },

      firstSuggestionHasFocus() {
        return this.focus === 0;
      },

      lastSuggestionHasFocus() {
        return this.focus === (this.numberOfSuggestions - 1);
      },

      selectedSuggestionLabel() {
        return this.suggestionLabels[this.focus] || null;
      }
    },

    watch: {
      '$route.query'() {
        this.closeDropdown();
        this.isActive = false;
      },

      value() {
        this.isActive = true;
        this.isLoading = false;
        this.focus = null;
        this.selectSuggestion();
      },

      query() {
        this.isLoading = true;
      }
    },

    mounted() {
      this.inputElement.addEventListener('keyup', this.keyup);
      document.addEventListener('mouseup', this.clickOutside);
    },

    methods: {
      keyup(event) {
        if (!this.isActive) return;

        switch (event.keyCode) {
        case 9: // Tab key
        case 27: // Escape key
          this.closeDropdown();
          break;
        case 38: // Up key
          this.keyupUp();
          break;
        case 40: // Down key
          this.keyupDown();
          break;
        }
      },

      keyupUp() {
        if (this.noSuggestionHasFocus || this.firstSuggestionHasFocus) {
          this.focus = this.numberOfSuggestions - 1;
        } else {
          this.focus = this.focus - 1;
        }

        this.selectSuggestion();
      },

      keyupDown() {
        if (this.noSuggestionHasFocus || this.lastSuggestionHasFocus) {
          this.focus = 0;
        } else {
          this.focus = this.focus + 1;
        }

        this.selectSuggestion();
      },

      clickOutside(event) {
        if (!this.isActive) return;

        const isParent = (event.target === this.inputElement);
        const isChild = this.$el.contains(event.target);

        if (!(isParent || isChild)) {
          this.closeDropdown();
        }
      },

      // Highlight the user's query in a suggestion
      // FIXME: only re-highlight when new suggestions come in, not immediately
      //        after the query changes?
      highlightResult(value) {
        // Find all the suggestion labels that match the query
        const matches = match(value, this.query);
        return parse(value, matches);
      },

      closeDropdown() {
        this.isActive = false;
        this.focus = null;
        this.selectSuggestion();
      },

      selectSuggestion() {
        if (this.selectedSuggestionLabel) this.$emit('select', this.selectedSuggestionLabel);
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import './assets/scss/variables.scss';

  .auto-suggest {
    &-dropdown {
      display: none;
      position: absolute;
      top: 50px;
      width: 100%;
      z-index: 20;
      border-radius: 4px;
      box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.25);
      background-color: $white;
      overflow: hidden;
      transition: $standard-transition;

      a.list-group-item {
        border: 0;
        border-radius: 0;
        box-shadow: none;
        padding: 0.5rem 1.25rem;
        color: $black;
        font-size: 1rem;
        text-decoration: none;

        &:first-child {
          padding-top: 1rem;
          border-radius: 6px 6px 0 0;
        }

        &:last-child {
          padding-bottom: 1rem;
          border-radius: 0 0 6px 6px;
        }

        &.hover {
          background-color: $bodygrey;
        }
      }

      .loading {
        font-size: 0.75rem;
      }
    }
  }

  .show form:focus-within .auto-suggest-dropdown {
    display: block;
  }

  .input-group {
    width: 100%;

    .input-group-prepend {
      align-items: center;
      background-color: $offwhite;
      padding-left: 0.75rem;
      padding-right: 0.1rem;
      border-radius: 0.375rem 0 0 0.375rem;
    }
  }

  .btn {
    border-radius: 0 $border-radius $border-radius 0;

    img {
      display: flex;
    }
  }

  @media (max-width: $bp-large) {
    .auto-suggest {
      &-dropdown {
        top: 112px;
        border-radius: 0;
        box-shadow: 0 3px 3px 2px rgba(0, 0, 0, 0.05);
        a.list-group-item {
          text-align: left;
          padding-left: 3.4rem;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          &:first-child, &:last-child {
            border-radius: 0;
            padding-top: 0.75rem;
          }
          &:last-child {
            padding-bottom: 0.75rem;
          }
        }
      }
    }
  }
</style>
