<template>
  <q-page>
    <h1>{{ roomName }}</h1>
    <video
      ref="remoteVideo"
      :class="{'main-video': !localVideoIsBig, 'thumbnail-video': localVideoIsBig, }"
      autoplay
      @click="localVideoIsBig = localVideoIsBig? !localVideoIsBig:localVideoIsBig"
    />
    <div id="overlay-container">
      <!-- <q-input v-model="outChatMessage" rounded label="say something" @keyup.enter="sendMessage" /> -->
      <video
        ref="localVideo"
        :class="{'main-video': localVideoIsBig, 'thumbnail-video': !localVideoIsBig, }"
        muted
        autoplay
        @click="localVideoIsBig = !localVideoIsBig? !localVideoIsBig:localVideoIsBig"
      />
      <!-- <label>
        Video In
        <select v-model="chosenVideoInputId" name="videoInput" @change="mediaDeviceChanged">
          <option v-for="deviceObject in availableVideoInputDevices" :key="deviceObject.deviceId" :value="deviceObject.deviceId">{{ deviceObject.label }}</option>
        </select>
      </label> -->
      <!-- <p id="chat-message">
        {{ inChatMessage }}
      </p> -->
    </div>
  </q-page>
</template>

<script>

import { mapState } from 'vuex';

import peerUtil from 'js/peer-utils';

export default {
  name: 'Camera',
  components: {
  },
  data () {
    return {
      localVideoIsBig: false,
      localStream: null,
      inChatMessage: 'message',
      outChatMessage: '',
      chosenVideoInputId: null,
      chosenAudioInputId: null,
    };
  },
  computed: {
    ...mapState({
      roomName: state => state.connectionSettings.roomName,
      videoDeviceId: state => state.deviceSettings.chosenVideoDeviceId,
      audioInDeviceId: state => state.deviceSettings.chosenAudioInDeviceId,
      // availableMediaDevices: state => state.deviceSettings.availableMediaDevices,
      // availableVideoInputDevices: state => state.deviceSettings.availableVideoInputDevices,
    }),
    // ...mapGetters(['availableVideoInDevices']),
    // availableVideoInputDevices () {
    //   return this.availableMediaDevices.filter(device => device.kind === 'videoinput');
    // },
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
    try {
      await peerUtil.populateAvailableMediaDevices();
      const videoConstraints = {
        deviceId: this.videoDeviceId,
      };
      const audioConstraints = {
        deviceId: this.audioInDeviceId,
      };
      this.localStream = await peerUtil.getLocalMediaStream(videoConstraints, audioConstraints);
      this.$refs.localVideo.srcObject = this.localStream;
    } catch (e) {
      console.error(e);
    }
    console.log('creating peer with streamobject: ', this.localStream);
    peerUtil.createPeer(false, (d) => this.$socket.client.emit('signal', d), this.onStream, this.onMessage, this.localStream);

    // console.log(this.availableMediaDevices);
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
    async mediaDeviceChanged () {
      const videoId = this.chosenVideoInputId;
      const videoConstraint = videoId ? { deviceId: videoId } : true;
      // videoConstraint.frameRate = 15;
      videoConstraint.width = 3840;
      videoConstraint.height = 1920;
      const audioConstraint = this.chosenAudioInputId ? { deviceId: this.chosenAudioInputId } : true;
      this.localStream = await peerUtil.getLocalMediaStream(videoConstraint, audioConstraint);

      // const videoTrack = this.localStream.getVideoTracks()[0];
      // const capabilities = videoTrack.getCapabilities();
      // console.log('capabilities: ', capabilities);
      // console.log('settings', videoTrack.getSettings());

      this.$refs.localVideo.srcObject = this.localStream;
      peerUtil.setPeerOutputStream(this.localStream);
    },
    switchVideoThumbnailVideo () {
      // TODO: Implement that srcobject switch place between videtags instread of switch css class!
    },
  },
};
</script>

<style scoped lang="scss">
#overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  // background-color: rgba(0, 30, 255, 0.2);
  z-index: 100;
  pointer-events: none;
  * {
    pointer-events: auto;
  }
}

.thumbnail-video {
  background-color: white;
  width: 20vw;
  position: fixed;
  left: 3rem;
  top: 3rem;
  z-index: -1;
  border-radius: 1rem;
  cursor: pointer;
  box-shadow:
  0 2.8px 2.2px rgba(0, 0, 0, 0.034),
  0 6.7px 5.3px rgba(0, 0, 0, 0.048),
  0 12.5px 10px rgba(0, 0, 0, 0.06)
}

#chat-message {
  position: fixed;
  // z-index: 60;
  bottom: 5vh;
  font-size: 2.5rem;
  color: white;
  width: 100vw;
  text-align: center;
  margin: 0;
}

</style>
