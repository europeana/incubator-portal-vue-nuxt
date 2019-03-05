import { storiesOf } from '@storybook/vue';

import ContentCard from './ContentCard.vue';
import ContentCardSection from '../browse/ContentCardSection.vue';

storiesOf('Generic', module)
  .add('Contentcard', () => ({
    components: { ContentCard },
    template: `<b-col cols="3" class="mt-3">
    	<ContentCard 
        cardTitle="This is a Storybook Card"
        contentSource="card"
        imageUrl="img/landscape.jpg" 
      />
    </b-col>`
  }))
  .add('Section with contentcards', () => ({
    components: { ContentCardSection },
    data() {
      return {
        section: {
          fields: {
            headline: 'Art',
            text: 'Discover inspiring art, artists and stories in 2,165,362 artworks from European museums, galleries, libraries and archives',
            hasPart: [{
              sys: {
                id: '123456'
              },
              fields: {
                name: 'Jonas Martinaitis. Piemenų landynė. 1942 | Jonas Martinaitis',
                image: {
                  fields: {
                    file: {
                      url: 'img/landscape.jpg'
                    }
                  }
                },
                url: 'http://europeana.eu'
              }
            },
            {
              sys: {
                id: '123456'
              },
              fields: {
                name: 'Kanutas Ruseckas. Mitologinė pastoralinė scena. XIX a. | Kanutas Ruseckas',
                image: {
                  fields: {
                    file: {
                      url: 'img/landscape.jpg'
                    }
                  }
                },
                url: 'http://europeana.eu'
              }
            },
            {
              sys: {
                id: '123456'
              },
              fields: {
                name: 'Jonas Mackevičius. Anykščių bažnyčia. XX a. I p. | Jonas Mackevičius',
                image: {
                  fields: {
                    file: {
                      url: 'img/landscape.jpg'
                    }
                  }
                },
                url: 'http://europeana.eu'
              }
            },
            {
              sys: {
                id: '123456'
              },
              fields: {
                name: 'Juozapas Kamarauskas. Vilniaus muitinės pastatas. 1920 | Juozapas Kamarauskas',
                image: {
                  fields: {
                    file: {
                      url: 'img/landscape.jpg'
                    }
                  }
                },
                url: 'http://europeana.eu'
              }
            }]
          }
        }
      };
    },
    template: `<b-container class="mt-3">
      <ContentCardSection 
        :section="section"
      />
    </b-container>`
  }));
