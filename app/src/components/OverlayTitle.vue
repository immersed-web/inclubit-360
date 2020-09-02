<template>
  <div id="container">
    <h4 class="overlay-heading">
      {{ text }}
    </h4>
  </div>
</template>

<script>
export default {
  name: 'OverlayTitle',
  props: {
    text: {
      required: true,
      type: String,
    },
  },
  data () {
    return {
    };
  },
};
</script>

<style scoped lang="scss">
#container {
  position: fixed;
  top: 10rem;
  width: 100vw;
  text-align: center;
  pointer-events: none;
}
.overlay-heading {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);

}
</style>
