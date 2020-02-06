import Vue from 'vue';

require('../../../plugins/vue-filters');

describe('Vue filters', () => {
  describe('optimisedImageUrl', () => {
    const optimisedImageUrl = Vue.filter('optimisedImageUrl');

    context('when URL is for a Contentful asset', () => {
      context('when content type is "image/jpeg"', () => {
        const imageUrl = '//images.ctfassets.net/image.jpg';
        const contentType = 'image/jpeg';

        it('appends JPEG optimisation parameters', () => {
          const optimised = optimisedImageUrl(imageUrl, contentType);
          optimised.should.startWith(imageUrl);
          optimised.should.endWith('?fm=jpg&fl=progressive&q=50');
        });
      });

      context('when content type is "image/png"', () => {
        const imageUrl = '//images.ctfassets.net/image.png';
        const contentType = 'image/png';

        it('returns URL as-is', () => {
          const optimised = optimisedImageUrl(imageUrl, contentType);
          optimised.should.eq(imageUrl);
        });
      });

      context('when content type is "image/gif"', () => {
        const imageUrl = '//images.ctfassets.net/image.gif';
        const contentType = 'image/gif';

        it('returns URL as-is', () => {
          const optimised = optimisedImageUrl(imageUrl, contentType);
          optimised.should.eq(imageUrl);
        });
      });

      it('applies width and height options', () => {
        const imageUrl = '//images.ctfassets.net/image.png';
        const contentType = 'image/png';
        const options = { width: 200, height: 150 };

        const optimised = optimisedImageUrl(imageUrl, contentType, options);
        optimised.should.startWith(imageUrl);
        optimised.should.endWith(`?w=${options.width}&h=${options.height}`);
      });
    });

    context('otherwise', () => {
      const imageUrl = 'http://www.example.org/image.jpg';

      it('returns URL as-is', () => {
        const optimised = optimisedImageUrl(imageUrl);
        optimised.should.eq(imageUrl);
      });
    });
  });

  describe('proxyMedia', () => {
    const proxyMedia = Vue.filter('proxyMedia');
    const europeanaId = '/123/abc';
    const mediaUrl = 'https://www.example.org/audio.ogg';

    it('returns media proxy URL for item web resource', () => {
      const expected = `https://proxy.europeana.eu${europeanaId}?` +
        new URLSearchParams({ view: mediaUrl }).toString();

      const proxyUrl = proxyMedia(mediaUrl, europeanaId);

      proxyUrl.should.eq(expected);
    });

    it('returns media proxy URL with additional param for item web resource', () => {
      const expected = `https://proxy.europeana.eu${europeanaId}?` +
        new URLSearchParams({ view: mediaUrl, disposition: 'inline' }).toString();

      const proxyUrl = proxyMedia(mediaUrl, europeanaId, { disposition: 'inline' });

      proxyUrl.should.eq(expected);
    });
  });

  describe('plainText', () => {
    const plainText = Vue.filter('plainText');

    context('when the text is plain', () => {
      const textBefore = 'Contains only plain text.';

      it('returns the text as is', () => {
        const result = plainText(textBefore);
        result.should.eq('Contains only plain text.');
      });
    });

    context('when the text contains markdown"', () => {
      const textBefore = 'Contains _markdown_ with (a link)[http://example.org]!';

      it('returns the text as plain text', () => {
        const result = plainText(textBefore);
        result.should.eq('Contains markdown with a link!');
      });
    });

    context('when the text contains html"', () => {
      const textBefore = '<p>Contains <em>HTML</em> with <a href="http://example.org">a link</a>!</p>';

      it('returns the text as plain text', () => {
        const result = plainText(textBefore);
        result.should.eq('Contains HTML with a link!');
      });
    });
  });
});
