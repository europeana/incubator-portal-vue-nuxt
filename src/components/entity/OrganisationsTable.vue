<template>
  <div>
    <b-row
      v-if="$fetchState.error"
      class="flex-md-row py-4"
    >
      <b-col cols="12">
        <AlertMessage
          :error="$fetchState.error.message"
        />
      </b-col>
    </b-row>
    <b-table
      :fields="fields"
      :items="organisations"
      :sort-by.sync="sortBy"
      :busy="$fetchState.pending"
    >
      <template #table-busy>
        <div class="text-center my-2">
          <LoadingSpinner />
          {{ $t('loading') }}
        </div>
      </template>
      <template #cell(prefLabel)="data">
        <NuxtLink
          :data-qa="`organisation link ${data.item.id}`"
          :to="$path(entityRoute(data.item.slug))"
        >
          {{ data.item.prefLabel }}
        </NuxtLink>
      </template>
    </b-table>
  </div>
</template>

<script>
  import AlertMessage from '../generic/AlertMessage';
  import LoadingSpinner from '../generic/LoadingSpinner';

  export default {
    name: 'OrganisationsTable',
    components: {
      LoadingSpinner,
      AlertMessage
    },
    fetch() {
      return this.$axios.get(
        '/_api/entities/organisations',
        { params: { locale: this.$i18n.locale } }
      )
        .then(response => {
          this.organisations = response.data.map(Object.freeze);
        })
        .catch((e) => {
          // TODO: set fetch state error from message
          console.error({ statusCode: 500, message: e.toString() });
        });
    },
    data() {
      return {
        organisations: null,
        sortBy: 'prefLabel',
        fields: [
          {
            key: 'prefLabel',
            sortable: true,
            label: this.$t('pages.collections.organisations.table.name')
          }
        ]
      };
    },
    methods: {
      entityRoute(slug) {
        return {
          name: 'collections-type-all',
          params: {
            type: 'organisation',
            pathMatch: slug
          }
        };
      }
    }
  };
</script>
