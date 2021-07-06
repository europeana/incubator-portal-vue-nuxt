import axios from 'axios';

export default ({ app }, inject) => {
  const $axios = axios.create();
  if (app.$axiosLogger) {
    $axios.interceptors.request.use(app.$axiosLogger);
  }

  const plugin = {
    $axios,

    query(alias, variables = {}) {
      const path = `/_api/contentful/${alias}`;

      return this.$axios.get(path, { params: { variables: JSON.stringify(variables) } });
    }
  };

  inject('contentful', plugin);
};
