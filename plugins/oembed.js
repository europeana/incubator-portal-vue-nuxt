import axios from 'axios';
import escapeRegExp from 'lodash/escapeRegExp';
import providers from './oembed/providers';

for (const provider of providers) {
  provider.schemeRegExps = provider.schemes.map((scheme) => {
    const escaped = escapeRegExp(scheme).replace(/\\\*/g, '.+');
    return new RegExp(escaped);
  });
}

function providerSupportsUrl(provider, url) {
  for (const schemeRegExp of provider.schemeRegExps) {
    if (schemeRegExp.test(url)) {
      return true;
    }
  }
  return false;
}

function providerForUrl(url) {
  for (const provider of providers) {
    if (providerSupportsUrl(provider, url)) return provider;
  }
  return null;
}

export function oEmbeddable(url) {
  return providerForUrl(url) !== null;
}

export default function oEmbed(url) {
  const provider = providerForUrl(url);
  if (!provider) return null;

  return axios.get(provider.endpoint, {
    params: { url }
  });
}
