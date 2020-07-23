<template>
  <div>
    <b-carousel
      id="media-carousel"
      v-model="slide"
      :interval="0"
      controls
      img-width="400"
      no-wrap="true"
    >
      <b-carousel-slide
      >
        <template v-slot:img>
          <img data-v-370eeff7="" src="https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&amp;type=IMAGE&amp;uri=http%3A%2F%2Frepos.europeanafashion.eu%2Fpaulvanriel%2F54332959.jpg" alt="">
        </template>
      </b-carousel-slide>

      <b-carousel-slide>
        <template v-slot:img>
          <img data-v-370eeff7="" src="https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&amp;type=IMAGE&amp;uri=http%3A%2F%2Fdata.jck.nl%2Fthumbnail%2Fjck%2Fjoods-historisch%2Fd616%2F616NM009292%2F500" alt="">
        </template>
      </b-carousel-slide>

      <b-carousel-slide>
        <template v-slot:img>
          <iframe allowfullscreen="allowfullscreen" src="https://www.europeana.eu/en/media?id=%2F2084002%2Fcontributions_fae903d0_9fa9_0136_7c80_6eee0af7f672&amp;mediaUrl=http%3A%2F%2Fcontribute.europeana.eu%2Fmedia%2Ffae63040-9fa9-0136-7c80-6eee0af7f672" class="media-player"></iframe>
        </template>
      </b-carousel-slide>

    </b-carousel>
    <p>Slide {{ slide + 1 }} / X</p>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        slide: 0
      }
    }
  }
</script>
