<template>
  <b-dropdown
    ref="dropdown"
    variant="light"
    no-caret
    class="more-facets position-static my-2"
    :class="{ 'is-active' : anyOptionsSelected }"
    data-qa="more filters dropdown button"
    @hidden="cancelHandler"
  >
    <template v-slot:button-content>
      {{ $t('facets.button.morefilters') }}
      <span
        v-if="anyOptionsSelected"
        class="selected-amount"
        data-qa="more filters selected options count"
      >
        {{ selectedOptionsCount }}
      </span>
    </template>
    <b-dropdown-form>
      <div class="more-facets-wrapper">
        <template
          v-if="enableApiFilter"
        >
          <RadioGroupFilter
            facet-name="api"
            :options="['fulltext', 'metadata']"
            :selected="preSelected['api'] || apiFilterDefault"
            @change="updateSelected"
          />
        </template>
        <template
          v-if="collection === 'newspaper'"
        >
          <DateFilter
            :name="PROXY_DCTERMS_ISSUED"
            :start="dateFilter.start"
            :end="dateFilter.end"
            :specific="dateFilter.specific"
            @dateFilter="dateFilterSelected"
          />
        </template>
        <template
          v-for="(facet, index) in moreFacets"
        >
          <MoreFiltersDropdownFacet
            v-if="filterFields(facet.name, facet.fields).length > 0"
            :key="index"
            :fields="filterFields(facet.name, facet.fields)"
            :name="facet.name"
            :selected="preSelected[facet.name]"
            @selectedOptions="updateSelected"
          />
        </template>
      </div>
      <div
        class="dropdown-buttons"
        role="presentation"
      >
        <b-button
          variant="link"
          :disabled="!anyOptionsSelected"
          data-qa="reset filter button"
          @click="resetFilters"
        >
          {{ $t('facets.button.reset') }}
        </b-button>
        <b-button
          variant="link"
          data-qa="cancel button"
          @click="cancelHandler"
        >
          {{ $t('facets.button.cancel') }}
        </b-button>
        <b-button
          variant="primary"
          :disabled="selectedOptionsUnchanged"
          data-qa="apply button"
          :data-changed="filtersChanged.join(',')"
          type="submit"
          @click.prevent="applySelected"
        >
          {{ $t('facets.button.apply') }}
        </b-button>
      </div>
    </b-dropdown-form>
  </b-dropdown>
</template>

<script>
  import Vue from 'vue';
  import isEqual from 'lodash/isEqual';
  import { mapGetters } from 'vuex';
  import { rangeToQueryParam, rangeFromQueryParam } from '../../plugins/europeana/search';
  import MoreFiltersDropdownFacet from './MoreFiltersDropdownFacet';
  import DateFilter from './DateFilter';
  import RadioGroupFilter from './RadioGroupFilter';

  export default {
    components: {
      MoreFiltersDropdownFacet,
      DateFilter,
      RadioGroupFilter
    },
    props: {
      moreFacets: {
        type: Array,
        default: () => []
      },
      selected: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        preSelected: this.cloneSelected(),
        isCheckedSpecificDate: false,
        API_FILTER_COLLECTIONS: ['newspaper', 'ww1'],
        PROXY_DCTERMS_ISSUED: 'proxy_dcterms_issued'
      };
    },
    computed: {
      ...mapGetters({
        collection: 'search/collection'
      }),
      anyOptionsSelected() {
        return this.selectedOptionsCount > 0;
      },
      selectedOptionsCount() {
        return [].concat(...Object.values(this.selected)).length;
      },
      selectedOptionsUnchanged() {
        return this.filtersChanged.length === 0;
      },
      /**
       * Gets the names of the filters whose selections have changed
       * @return {string[]} Changed filter names
       */
      filtersChanged() {
        const filtersChanged = [];
        for (const name in this.preSelected) {
          const selectedValues = this.selected[name] || [];
          if (!isEqual(this.preSelected[name], selectedValues)) {
            filtersChanged.push(name);
          }
        }
        for (const name in this.selected) {
          const preSelectedValues = this.preSelected[name] || [];
          if (!filtersChanged.includes(name) && !isEqual(preSelectedValues, this.selected[name])) {
            filtersChanged.push(name);
          }
        }
        return filtersChanged;
      },
      moreFacetNames() {
        return this.moreFacets.map((facet) => facet.name);
      },
      dateFilter() {
        const proxyDctermsIssued = this.preSelected[this.PROXY_DCTERMS_ISSUED];
        if (!proxyDctermsIssued || proxyDctermsIssued.length < 1) {
          return { start: null, end: null, specific: this.isCheckedSpecificDate };
        }
        const range = rangeFromQueryParam(proxyDctermsIssued[0]);
        if (!range) {
          return { start: proxyDctermsIssued[0], end: null, specific: true };
        }
        return range;
      },
      enableApiFilter() {
        return this.API_FILTER_COLLECTIONS.includes(this.collection);
      },
      apiFilterDefault() {
        return this.collection === 'newspaper' ? 'fulltext' : 'metadata';
      }
    },
    watch: {
      selected() {
        this.preSelected = this.cloneSelected();
      }
    },
    methods: {
      cloneSelected() {
        return Object.assign({}, this.selected);
      },
      dateFilterSelected(facetName, dateRange) {
        let dateQuery = [];
        if (dateRange.specific) {
          if (dateRange.start) {
            dateQuery = [dateRange.start];
          }
        } else if (dateRange.start || dateRange.end) {
          dateQuery = [rangeToQueryParam(dateRange)];
        }
        this.isCheckedSpecificDate = dateRange.specific;
        this.updateSelected(facetName, dateQuery);
      },
      filterFields(name, fields) {
        // Only show option 0 for contentTier toggle
        if (name === 'contentTier') {
          return fields.filter(field => field.label === '"0"');
        }
        return fields;
      },
      updateSelected(facetName, selectedFields) {
        Vue.set(this.preSelected, facetName, selectedFields);
      },
      applySelected() {
        this.$emit('changed', this.preSelected);
        this.$refs.dropdown.hide(true);
      },
      cancelHandler() {
        this.preSelected = this.cloneSelected();
        this.$refs.dropdown.hide(true);
      },
      resetFilters() {
        this.clearPreSelected();
        this.isCheckedSpecificDate = false;
      },
      clearPreSelected() {
        for (const facetName in this.preSelected) {
          this.preSelected[facetName] = [];
        }
      }
    }
  };
</script>
