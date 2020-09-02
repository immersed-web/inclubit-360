<template>
  <q-page>
    <q-input v-model="outChatMessage" rounded label="say something" @keyup.enter="sendMessage" />
    <OverlayTitle text="VIEWER" />
    <!-- <video
      ref="localVideo"
      class="local-video"
      autoplay
    /> -->
    <video
      ref="remoteVideo"
      class="thumbnail-video"
      autoplay
      @play="remoteVideoStarted"
    />

    <canvas ref="drawCanvas" class="main-video" />
    <p id="chat-message">
      {{ inChatMessage }}
    </p>
  </q-page>
</template>

<script>

import { mapState } from 'vuex';
import peerUtil from 'js/peer-utils';
import sceneUtils from 'js/scene-utils';
import OverlayTitle from 'src/components/OverlayTitle';
export default {
  name: 'Viewer',
  components: {
    OverlayTitle,
  },
  data () {
    return {
      remoteStream: null,
      outChatMessage: '',
      inChatMessage: '',
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
    sceneUtils.initThreeScene(this.$refs.drawCanvas);
  },
  methods: {
    onSignal (d) {
      console.log('signal triggered from peer obj:', d);
      this.$socket.client.emit('signal', d);
    },
    async onStream (stream) {
      console.log('received remote stream!!!', stream);
      this.remoteStream = stream;
      this.$refs.remoteVideo.srcObject = this.remoteStream;
      try {
        await this.$refs.remoteVideo.play();
      } catch (err) {
        console.error(err);
        this.$refs.remoteVideo.muted = true;
        await this.$refs.remoteVideo.play();
      }
      sceneUtils.addSphereToScene(sceneUtils.videoToSphereMesh(this.$refs.remoteVideo));
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
  },

};
</script>

<style scoped lang="scss">
.thumbnail-video {
  background-color: white;
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
