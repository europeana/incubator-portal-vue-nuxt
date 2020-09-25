const linkGroupCacheDuration = Number(process.env.LINK_GROUP_CACHE_DURATION) || 5;

const linkGroups = {
  preview: {},
  delivery: {}
};

const fetchLinkGroups = async({ locale, $contentful, mode }) => {
  const contentfulVariables = {
    locale,
    preview: mode === 'preview'
  };

  let data;
  try {
    const response = await $contentful.query('linkGroups', contentfulVariables);
    data = response.data;
  } catch (e) {
    return;
  }

  const linkGroupForLocale = {
    expiresAt: Date.now() + (linkGroupCacheDuration * 60 * 1000) // 5 minutes, in milliseconds
  };
  for (const identifier in data.data) {
    const linkGroup = data.data[identifier].items[0];
    linkGroupForLocale[identifier] = {
      name: linkGroup.name ? linkGroup.name : null,
      links: linkGroup.links.items
    };
  }

  linkGroups[mode][locale] = linkGroupForLocale;
};

const expired = (linkGroup) => {
  return linkGroup.expiresAt <= Date.now();
};

// TODO: Use a JS timeout to auto-expire cached content?

export default async({ app, route }, inject) => {
  const locale = app.i18n.isoLocale();
  const mode = route.query.mode === 'preview' ? 'preview' : 'delivery';
  let linkGroup = linkGroups[mode][locale];

  if (!linkGroup || expired(linkGroup)) {
    await fetchLinkGroups({
      locale,
      $contentful: app.$contentful,
      mode
    });
  }

  inject('linkGroups', (group) => linkGroups[mode][locale][group]);
};
