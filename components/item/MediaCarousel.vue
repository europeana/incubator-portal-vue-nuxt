<template>
  <div>
    <b-carousel
      id="media-carousel"
      v-model="slide"
      :interval="0"
      controls
    >
      <b-carousel-slide
        img-src="https://picsum.photos/1024/480/?image=52"
      ></b-carousel-slide>

      <b-carousel-slide 
        img-src="https://picsum.photos/1024/480/?image=54"
      >
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
