<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <clipPath :id="`clipping-path-${uid}`">
      <path v-if="icon === 'mic'" d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
      <path v-else d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </clipPath>
    <path v-if="icon === 'mic'" :fill="color" d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
    <path v-else :fill="color" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    <g :clip-path="`url(#clipping-path-${uid})`">
      <rect
        id="meter"
        ref="meter"
        fill="rgb(10,230,10)"
        width="24"
        height="24"
      />
    </g>
  </svg>
</template>

<script>
import { uid } from 'quasar';
export default {
  name: 'AudioIcon',
  props: {
    icon: {
      type: String,
      default: 'mic',
    },
    color: {
      type: String,
      default: 'white',
    },
  },
  data () {
    return {
      uid: null,
    };
  },
  created () {
    this.uid = uid();
  },
  methods: {
    setMeterHeight (height) {
      this.$refs.meter.style.transform = `scaleY(${height})`;
    },
  },
};
</script>

<style scoped lang="scss">
#meter {
  transform-origin: bottom center;
  transform: scaleY(0.0);
}
</style>
