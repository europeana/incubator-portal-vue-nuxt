<template>
  <b-pagination-nav
    v-model="currentPage"
    :limit="limit"
    :hide-ellipsis="hideEllipsis"
    :number-of-pages="totalPages"
    :link-gen="linkGen"
    use-router
    size="sm"
    align="center"
    data-qa="pagination navigation"
    @input="changePaginationNav"
  />
</template>

<script>
  const maxResults = 1000;

  export default {
    props: {
      perPage: {
        type: Number,
        default: 24
      },
      limit: {
        type: Number,
        default: 12
      },
      hideEllipsis: {
        type: Boolean,
        default: true
      },
      totalResults: {
        type: Number,
        default: 0
      },
      value: {
        type: Number,
        default: 1
      },
      linkGen: {
        type: Function,
        default: (val) => {
          return val.toString();
        }
      },
      scrollToId: {
        type: String,
        default: '__nuxt'
      }
    },
    data() {
      return {
        currentPage: this.value
      };
    },
    computed: {
      totalPages() {
        return Math.ceil(Math.min(Math.max(this.totalResults, 1), maxResults) / this.perPage);
      }
    },
    watch: {
      value: {
        immediate: true,
        handler(val) {
          // Without this, using the browser back button will not update the highlighted pagination
          this.currentPage = val;
        }
      }
    },
    methods: {
      changePaginationNav() {
        this.$scrollTo(`#${this.scrollToId}`);
      }
    }
  };
</script>
