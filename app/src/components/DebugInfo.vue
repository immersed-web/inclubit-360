<template>
  <pre v-if="showDebugInfo" class="debug-info">{{ debugData }}</pre>
</template>

<script>
export default {
  name: 'DebugInfo',
  props: {
    debugData: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      showDebugInfo: process.env.DEV,
    };
  },
  created () {
    window.addEventListener('keyup', evt => {
      if (evt.key === 'd') {
        this.showDebugInfo = !this.showDebugInfo;
      } else {
        console.log(evt);
      }
    });
  },
};
</script>

<style scoped lang="scss">
.debug-info {
  z-index: 3000;
  position: fixed;
  left: 3rem;
  bottom: 3rem;
}
</style>
