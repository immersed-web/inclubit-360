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
    // sceneUtils.initThreeScene(this.$refs.drawCanvas);
  },
  methods: {
    onSignal (d) {
      console.log('signal triggered from peer obj:', d);
      this.$socket.client.emit('signal', d);
    },
    onStream (stream) {
      console.log('received remote stream!!!', stream);
      this.remoteStream = stream;
      this.$refs.remoteVideo.srcObject = this.remoteStream;
      // sceneUtils.addSphereToScene(sceneUtils.videoToSphereMesh(this.$refs.localVideo));
    },
    onMessage (data) {
      this.inChatMessage = data;
    },
    sendMessage () {
      peerUtil.sendMessage(this.outChatMessage);
    },
  },

};
</script>

<style lang="scss">
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
