<template>
  <q-page>
    <!-- <q-input v-model="outChatMessage" rounded label="say something" @keyup.enter="sendMessage" /> -->
    <!-- <video
      ref="localVideo"
      class="local-video"
      autoplay
    /> -->
    <pre class="debug-info">{{ debugData }} </pre>
    <video
      id="remote-video"
      ref="remoteVideo"
      class="thumbnail-video"
      autoplay
      @play="remoteVideoStarted"
    />

    <a-scene>
      <!-- <a-plane
        position="0 0 -4"
        rotation="-90 0 0"
        width="4"
        height="4"
        color="#7BC8A4"
      /> -->
    </a-scene>

    <!-- <canvas id="draw-canvas" ref="drawCanvas" class="main-video" /> -->
    <p id="chat-message">
      {{ inChatMessage }}
    </p>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import peerUtil from 'js/peer-utils';
// import sceneUtils from 'js/scene-utils';
export default {
  name: 'Viewer',
  components: {
  },
  data () {
    return {
      remoteStream: null,
      outChatMessage: '',
      inChatMessage: '',
      debugData: {
        videoWidth: '',
        videoHeight: '',
      },
    };
  },
  computed: {
    ...mapState({
      roomName: state => state.connectionSettings.roomName,
    }),
  },
  sockets: {
    connect (data) {
      console.log('socket connected: ', data);
    },
    room (data) {
      console.log('room event from socket', data);
    },
    signal (data) {
      console.log('signal event from socket', data);
      peerUtil.signalPeer(data);
    },
  },
  mounted () {
    this.$socket.client.emit('join', this.roomName);
    peerUtil.createPeer(true, this.onSignal, this.onStream, this.onMessage);
    // sceneUtils.initThreeScene(this.$refs.drawCanvas);
    // console.log('videoSphereSource is:', this.$refs.videoSphereSource);
  },
  beforeDestroy () {
    this.$socket.client.emit('leave', this.roomName);
  },
  methods: {
    onSignal (d) {
      console.log('signal triggered from peer obj:', d);
      this.$socket.client.emit('signal', d);
    },
    async onStream (stream) {
      console.log('received remote stream!!!', stream);
      this.remoteStream = stream;

      // const videoTrack = this.remoteStream.getVideoTracks()[0];
      // const capabilities = videoTrack.getCapabilities();
      // console.log('capabilities: ', capabilities);
      // console.log('settings', videoTrack.getSettings());

      this.$refs.remoteVideo.srcObject = this.remoteStream;
      // this.$refs.videoSphereSource.srcObject = this.remoteStream;
      // document.querySelector('#vr-video').srcObject = this.remoteStream;
      // document.querySelector('#vr-video').components.material.material.map.image.play();

      // document.querySelector("#antarctica").components.material.material.map.image.play();
      // this.$refs.videoSphereSource.components.material.material.map.image.play();
      try {
        await this.$refs.remoteVideo.play();
      } catch (err) {
        console.error(err);
        this.$refs.remoteVideo.muted = true;
        await this.$refs.remoteVideo.play();
      }

      this.initVideoSphere(stream, this.$refs.remoteVideo);
      // sceneUtils.addSphereToScene(sceneUtils.videoToSphereMesh(this.$refs.remoteVideo));
    },
    onMessage (data) {
      this.inChatMessage = data;
    },
    sendMessage () {
      peerUtil.sendMessage(this.outChatMessage);
      this.outChatMessage = '';
    },
    remoteVideoStarted () {
      console.log('remotevideo started!');
    },
    initVideoSphere (stream, videoElement) {
      const sceneEl = document.querySelector('a-scene');
      // TODO: Check whether we need to remove and insert new sphere, or if it's enough to update src of existing one.
      const prevVSphere = sceneEl.querySelector('a-videosphere');
      if (prevVSphere) {
        prevVSphere.remove();
      }
      const vSphere = document.createElement('a-videosphere');
      // vSphere.setAttribute('srcObject', 'https://bitmovin.com/player-content/playhouse-vr/progressive.mp4');
      vSphere.setAttribute('src', '#remote-video');
      sceneEl.appendChild(vSphere);

      // update dimensions info
      const remoteVideo = document.querySelector('#remote-video');
      this.debugData.videoWidth = remoteVideo.videoWidth;
      this.debugData.videoHeight = remoteVideo.videoHeight;
    },
  },

};
</script>

<style scoped lang="scss">
#draw-canvas {
  // z-index: -1;
  display: block;
  width: 30vw;
  height: 30vh;
  top: auto;
  left: auto;
  right: 2vw;
  bottom: 2vh;
}

.debug-info {
  z-index: 3000;
  position: fixed;
  left: 3rem;
  bottom: 3rem;
}

.thumbnail-video {
  background-color: black;
  width: 20vw;
  position: fixed;
  left: 3rem;
  top: 3rem;
  z-index: 50;
  border-radius: 1rem;
  box-shadow:
  0 2.8px 2.2px rgba(0, 0, 0, 0.034),
  0 6.7px 5.3px rgba(0, 0, 0, 0.048),
  0 12.5px 10px rgba(0, 0, 0, 0.06)
}

#chat-message {
  position: fixed;
  z-index: 60;
  bottom: 5vh;
  font-size: 2.5rem;
  color: white;
  width: 100vw;
  text-align: center;
  margin: 0;
}
</style>
