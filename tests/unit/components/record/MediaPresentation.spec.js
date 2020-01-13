import { shallowMount } from '@vue/test-utils';
import MediaPresentation from '../../../../components/record/MediaPresentation.vue';

const factory = (propsData) => shallowMount(MediaPresentation, {
  propsData,
  mocks: {
    $t: (key) => key
  }
});

describe('components/record/MediaPresentation', () => {
  describe('isPDF', () => {
    context('when ebucoreHasMimeType is "application/pdf"', () => {
      it('is `true`', () => {
        const props = { media: { ebucoreHasMimeType: 'application/pdf' } };
        const wrapper = factory(props);

        wrapper.vm.imageMediaType.should.eq('pdf');
      });
    });

    context('when ebucoreHasMimeType is "image/png"', () => {
      it('is `false`', () => {
        const props = { media: { ebucoreHasMimeType: 'image/png' } };
        const wrapper = factory(props);

        wrapper.vm.imageMediaType.should.eq('image');
      });
    });
  });

  describe('isHTMLVideo', () => {
    context('when ebucoreHasMimeType is "video/ogg"', () => {
      it('is `true`', () => {
        const props = { media: { ebucoreHasMimeType: 'video/ogg', about: 'http://www.example.org/video.ogg' } };
        const wrapper = factory(props);

        wrapper.vm.isHTMLVideo.should.be.true;
      });
    });

    context('when ebucoreHasMimeType is "video/webm"', () => {
      it('is `true`', () => {
        const props = { media: { ebucoreHasMimeType: 'video/webm', about: 'http://www.example.org/video.webm' } };
        const wrapper = factory(props);

        wrapper.vm.isHTMLVideo.should.be.true;
      });
    });

    context('when ebucoreHasMimeType is "video/mp4"', () => {
      context('and edmCodecName is "h264"', () => {
        it('is `true`', () => {
          const props = { media: { ebucoreHasMimeType: 'video/mp4', edmCodecName: 'h264', about: 'http://www.example.org/video.mp4' } };
          const wrapper = factory(props);

          wrapper.vm.isHTMLVideo.should.be.true;
        });
      });

      context('and edmCodecName is "x264"', () => {
        it('is `false`', () => {
          const props = { media: { ebucoreHasMimeType: 'video/mp4', edmCodecName: 'x264', about: 'http://www.example.org/video.mp4' } };
          const wrapper = factory(props);

          wrapper.vm.isHTMLVideo.should.be.false;
        });
      });
    });

    context('when ebucoreHasMimeType is "image/png"', () => {
      it('is `false`', () => {
        const props = { media: { ebucoreHasMimeType: 'image/png' } };
        const wrapper = factory(props);

        wrapper.vm.isHTMLVideo.should.be.false;
      });
    });
  });

  describe('isHTMLAudio', () => {
    context('when ebucoreHasMimeType is "audio/ogg"', () => {
      it('is `true`', () => {
        const props = { media: { ebucoreHasMimeType: 'audio/ogg', about: 'http://www.example.org/audio.ogg' } };
        const wrapper = factory(props);

        wrapper.vm.isHTMLAudio.should.be.true;
      });
    });

    context('when ebucoreHasMimeType is "audio/flac"', () => {
      it('is `true`', () => {
        const props = { media: { ebucoreHasMimeType: 'audio/flac', about: 'http://www.example.org/audio.flac' } };
        const wrapper = factory(props);

        wrapper.vm.isHTMLAudio.should.be.true;
      });
    });

    context('when ebucoreHasMimeType is "audio/mpeg"', () => {
      it('is `true`', () => {
        const props = { media: { ebucoreHasMimeType: 'audio/mpeg', about: 'http://www.example.org/audio.mp3' } };
        const wrapper = factory(props);

        wrapper.vm.isHTMLAudio.should.be.true;
      });
    });
  });

  describe('isOEmbed', () => {
    context('when url is for SoundCloud media', () => {
      it('is `true`', () => {
        const props = { media: { about: 'https://soundcloud.com/abc/def' } };
        const wrapper = factory(props);

        wrapper.vm.isOEmbed.should.be.true;
      });
    });

    context('when url is for Vimeo media', () => {
      it('is `true`', () => {
        const props = { media: { about: 'https://vimeo.com/abcdef' } };
        const wrapper = factory(props);

        wrapper.vm.isOEmbed.should.be.true;
      });
    });

    context('when the url is excluded from the oEmbed parser', () => {
      it('is `false`', () => {
        const props = { media: { about: 'https://www.youtube.com/watch?v=abcdef' } };
        const wrapper = factory(props);

        wrapper.vm.isOEmbed.should.be.false;
      });
    });

    context('when url is for media unknown to the oEmbed parser', () => {
      it('is `false`', () => {
        const props = { media: { about: 'https://example.org/abcdef' } };
        const wrapper = factory(props);

        wrapper.vm.isOEmbed.should.be.false;
      });
    });
  });

  describe('displayImage', () => {
    context('when imageSrc is absent', () => {
      it('is `false`', () => {
        const props = { media: { ebucoreHasMimeType: 'text/plain' } };
        const wrapper = factory(props);

        wrapper.vm.displayImage.should.be.false;
      });
    });

    context('when imageSrc is present', () => {
      context('and media is HTML video', () => {
        it('is `false`', () => {
          const props = { media: { ebucoreHasMimeType: 'video/ogg', about: 'http://www.example.org/video.ogg' }, imageSrc: 'http://www.example.org/preview.jpg' };
          const wrapper = factory(props);

          wrapper.vm.displayImage.should.be.false;
        });
      });

      context('and url is for oEmbed media', () => {
        it('is `false`', () => {
          const props = { media: { about: 'https://vimeo.com/abcdef' }, imageSrc: 'http://www.example.org/preview.jpg' };
          const wrapper = factory(props);

          wrapper.vm.displayImage.should.be.false;
        });
      });

      context('and media is not HTML video', () => {
        it('is `true`', () => {
          const props = { media: { ebucoreHasMimeType: 'video/quicktime' }, imageSrc: 'http://www.example.org/preview.jpg' };
          const wrapper = factory(props);

          wrapper.vm.displayImage.should.be.true;
        });
      });
    });
  });
});
