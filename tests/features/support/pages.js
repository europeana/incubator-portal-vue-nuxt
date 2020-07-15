const { url } = require('../config/nightwatch.conf.js').test_settings.default.globals;

const pages = {
  '"Hammerflügel" item page': `${url}/en/item/09102/_GNM_693983`,
  '"Het laatste avondmaal" item page': `${url}/en/item/90402/RP_P_OB_70_879`,
  '"The Milkmaid" item page': `${url}/en/item/90402/SK_A_2344`,
  '"The pride of Glencoe, song" item page': `${url}/en/item/2059213/data_sounds_455`,
  '"World War I" collection page': `${url}/en/collections/topic/83-1914-1918`,
  'blog page': `${url}/en/blog`,
  '"Easter with art" blog page': `${url}/blog/easter-with-art-and-culture-5-activities-for-the-whole-family`,
  'English home page': `${url}/en`,
  'entity page': `${url}/en/collections/person/60305-william-shakespeare`,
  'exhibition chapter': `${url}/en/exhibitions/faces-of-europe/introduction`,
  'exhibition credits': `${url}/en/exhibitions/faces-of-europe/credits`,
  'exhibition page': `${url}/en/exhibitions/faces-of-europe`,
  'exhibitions page': `${url}/en/exhibitions`,
  'Fashion collection search page': `${url}/en/search?query=&qf=collection%3Afashion`,
  'first page of results': `${url}/en/search?query=&page=1`,
  'gallery page': `${url}/en/galleries/blue`,
  'gallery foyer page': `${url}/en/galleries`,
  'home page': `${url}/en`,
  'Newspapers collection page': `${url}/en/collections/topic/18-newspapers`,
  'item page with a IIIF Image': `${url}/en/item/9200357/BibliographicResource_3000095247457`,
  'item page with a IIIF Presentation': `${url}/en/item/9200301/BibliographicResource_3000126341277`,
  'item page without isShownBy or hasView': `${url}/en/item/9200102/BibliographicResource_3000134083514`,
  'item page': `${url}/en/item/09102/_GNM_693983`,
  'search page': `${url}/en/search?query=`,
  'Swedish home page': `${url}/sv`,
  'topics listing page': `${url}/en/collections/topics`
};

module.exports = {
  pageUrl(pageName) {
    return pageName.startsWith('/') ? `${url}${pageName}` : pages[pageName];
  }
};
