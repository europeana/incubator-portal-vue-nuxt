<template>
  <b-row
    class="flex-md-row pb-3"
    data-qa="blog author"
  >
    <b-col cols="12">
      <h3 class="font-weight-bold">
        {{ authorTitle }}
      </h3>
      <BlogAuthor
        v-for="(author, index) in authors"
        :key="index"
        :name="author.name"
        :organisation="author.affiliation"
        :url="author.url"
      />
    </b-col>
  </b-row>
</template>

<script>
  import BlogAuthor from '../blog/BlogAuthor';

  export default {
    name: 'BlogAuthors',

    components: {
      BlogAuthor
    },

    props: {
      authors: {
        type: Array,
        default: () => []
      }
    },

    computed: {
      authorTitle() {
        return this.authors && this.authors.length > 1 ? this.$t('blog.authors') : this.$t('blog.author');
      }
    }
  };
</script>
