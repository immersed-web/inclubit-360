<template>
  <q-page>
    <h1>AFRAME TEST PAGE</h1>
    <a-scene>
      <!-- <a-assets timeout="10000">
        <video
          id="antarctica"
          ref="videoTag"
          crossorigin="anonymous"
          loop="true"
          src="https://bitmovin.com/player-content/playhouse-vr/progressive.mp4"
          @click="playVideo"
        />
      </a-assets> -->
      <!-- <a-videosphere src="#antarctica" /> -->
      <!-- <a-camera fov="70" /> -->

      <!-- <a-videosphere src="https://bitmovin.com/player-content/playhouse-vr/progressive.mp4" /> -->
    </a-scene>
    <!-- <video autoplay loop="true" src="https://bitmovin.com/player-content/playhouse-vr/progressive.mp4" /> -->
    <q-btn label="VideoSphere!!" @click="initVideoSphere" />
  </q-page>
</template>

<script>
// require('aframe');
import 'aframe';
export default {
  name: 'AframeTest',
  data () {
    return {

    };
  },
  methods: {
    playVideo (e) {
      this.$refs.videoTag.play();
    },
    initVideoSphere () {
      const sceneEl = document.querySelector('a-scene');
      const vSphere = document.createElement('a-videosphere');
      vSphere.setAttribute('src', 'https://bitmovin.com/player-content/playhouse-vr/progressive.mp4');
      sceneEl.appendChild(vSphere);
    },
    say (msg) {
      console.log(msg);
    },
  },
};
</script>

<style scoped lang="scss">
</style>
