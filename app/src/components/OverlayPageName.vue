<template>
  <div id="container">
    <h4 class="overlay-heading">
      {{ text }}
    </h4>
  </div>
</template>

<script>
export default {
  name: 'OverlayPageName',
  props: {
    // text: {
    //   required: true,
    //   type: String,
    // },
  },
  data () {
    return {
      // text: '',
    };
  },
  computed: {
    text () {
      if (this.$route.name) {
        return this.$route.name;
      } else {
        return this.$route.fullPath.replace(/^\/+/g, '');
      }
    },
  },
  created () {

  },
};
</script>

<style scoped lang="scss">
#container {
  position: fixed;
  left: 2rem;
  bottom: 2rem;
  pointer-events: none;
}
.overlay-heading {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);

}
</style>
