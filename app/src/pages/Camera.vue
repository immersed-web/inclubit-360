<template>
  <q-page>
    <OverlayTitle text="CAMERA" />
    <q-input v-model="outChatMessage" rounded label="say something" @keyup.enter="sendMessage" />
    <video
      ref="remoteVideo"
      :class="{'main-video': !localVideoIsBig, 'thumbnail-video': localVideoIsBig, }"
      autoplay
      @click="localVideoIsBig = localVideoIsBig? !localVideoIsBig:localVideoIsBig"
    />
    <video
      ref="localVideo"
      :class="{'main-video': localVideoIsBig, 'thumbnail-video': !localVideoIsBig, }"
      autoplay
      @click="localVideoIsBig = !localVideoIsBig? !localVideoIsBig:localVideoIsBig"
    />
    <p id="chat-message">
      {{ inChatMessage }}
    </p>
  </q-page>
</template>

<script>

import { mapState } from 'vuex';

import peerUtil from 'js/peer-utils';
import OverlayTitle from 'src/components/OverlayTitle';

export default {
  name: 'Camera',
  components: {
    OverlayTitle,
  },
  data () {
    return {
      localVideoIsBig: false,
      localStream: null,
      inChatMessage: 'message',
      outChatMessage: '',
    };
  },
  computed: {
    ...mapState({
      roomName: state => state.connectionSettings.roomName,
      availableMediaDevices: state => state.deviceSettings.availableMediaDevices,
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
  async mounted () {
    this.$socket.client.emit('join', this.roomName);
    peerUtil.populateAvailableMediaDevices();
    this.localStream = await peerUtil.getLocalMediaStream(true, false);
    this.$refs.localVideo.srcObject = this.localStream;
    peerUtil.createPeer(false, (d) => this.$socket.client.emit('signal', d), this.onStream, this.onMessage, this.localStream);
  },
  beforeDestroy () {
    peerUtil.destroyPeer();
  },
  methods: {
    async start () {
      console.log('start was called');
    },
    onStream (stream) {
      this.$refs.remoteVideo.srcObject = stream;
    },
    onMessage (data) {
      console.log('received message', data);
      this.inChatMessage = data;
    },
    sendMessage () {
      peerUtil.sendMessage(this.outChatMessage);
      this.outChatMessage = '';
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
  cursor: pointer;
  box-shadow:
  0 2.8px 2.2px rgba(0, 0, 0, 0.034),
  0 6.7px 5.3px rgba(0, 0, 0, 0.048),
  0 12.5px 10px rgba(0, 0, 0, 0.06)
}

.main-video {
  background-color: grey;
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
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
