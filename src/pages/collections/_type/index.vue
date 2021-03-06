<template>
  <b-container>
    <ContentHeader
      :title="title"
    />
    <b-row class="flex-md-row pb-5">
      <b-col cols="12">
        <b-card-group
          class="card-deck-4-cols"
          deck
          :data-qa="`${this.$route.params.type} listing page`"
        >
          <ContentCard
            v-for="entity in entities"
            :key="entity.id"
            :title="entity.prefLabel"
            :url="entityRoute(entity)"
            :image-url="thumbnail(entity)"
            variant="mini"
          />
        </b-card-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <PaginationNav
          v-model="page"
          :limit="perPage"
          :total-results="total"
          :per-page="perPage"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import { getEntityTypeApi, getEntityTypeHumanReadable, getEntitySlug } from '../../../plugins/europeana/entity';

  import ContentHeader from '../../../components/generic/ContentHeader';
  import ContentCard from '../../../components/generic/ContentCard';

  const PER_PAGE = 24;
  export default {
    name: 'CollectionTypeIndexPage',
    components: {
      ContentHeader,
      ContentCard,
      PaginationNav: () => import('../../../components/generic/PaginationNav')
    },
    middleware: 'sanitisePageQuery',
    asyncData({ params, error, app, store }) {
      if (!['persons', 'topics', 'times'].includes(params.type)) {
        return  error({ statusCode: 404, message: 'unknown collection type' });
      }

      const entityIndexParams = {
        query: '*:*',
        page: store.state.sanitised.page - 1,
        type: getEntityTypeApi(params.type.slice(0, -1)),
        pageSize: PER_PAGE,
        scope: 'europeana',
        sort: `skos_prefLabel.${app.i18n.locale}`,
        qf: `skos_prefLabel.${app.i18n.locale}:*`,
        fl: 'skos_prefLabel.*,isShownBy,isShownBy.thumbnail'
      };
      return app.$apis.entity.searchEntities(entityIndexParams)
        .then(response => response)
        .then(data => {
          return {
            entities: data.entities,
            total: data.total,
            page: store.state.sanitised.page,
            perPage: PER_PAGE,
            title: app.i18n.t(`pages.collections.${params.type}.title`)
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },
    data() {
      return {
        perPage: PER_PAGE,
        page: null
      };
    },
    computed: {
      route() {
        return {
          name: 'collections-index',
          params: {
            pathMatch: this.$route.params.type
          }
        };
      }
    },
    methods: {
      entityRoute(entity) {
        return {
          name: 'collections-type-all',
          params: {
            type: getEntityTypeHumanReadable(entity.type),
            pathMatch: getEntitySlug(entity.id, entity.prefLabel.en)
          }
        };
      },
      thumbnail(entity) {
        if (typeof entity.isShownBy !== 'undefined') {
          return entity.isShownBy.thumbnail;
        }
      }
    },
    head() {
      return {
        title: this.$pageHeadTitle(this.title)
      };
    },
    watchQuery: ['page']
  };
</script>
