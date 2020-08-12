import axios from 'axios';
import qs from 'qs';

import { apiError } from './utils';
import { config } from './';

const annotationApiUrl = (endpoint) => {
  return `${config.annotation.origin}${config.annotation.path}${endpoint}`;
};

export const search = (params) => {
  return axios.get(annotationApiUrl('/search'), {
    // TODO: move serializer into utils as it's common to all APIs
    paramsSerializer(params) {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
    params: {
      ...params,
      ...{ wskey: config.annotation.key }
    }
  })
    .then((response) => {
      return response.data.items ? response.data.items : [];
    })
    .catch((error) => {
      throw apiError(error);
    });
};
