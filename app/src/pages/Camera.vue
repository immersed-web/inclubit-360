<template>
  <!-- <q-page> -->
  <div id="overlay-container" class="column no-wrap">
    <div class="flex-grow">
      <!-- <div class="bg-yellow inner-box">
        gul
      </div> -->
      <video
        ref="mainVideo"
        class="main-video"
        autoplay
        muted
      />
      <audio ref="remoteAudio" autoplay />
    </div>
    <q-toolbar class="bg-dark">
      <q-toolbar-title class="q-mr-xl" shrink>
        {{ roomName }}
      </q-toolbar-title>

      <!-- <div class="row no-wrap justify-evenly"> -->
      <q-select
        class="device-select-box col-auto q-mx-md"
        dense
        label="Video"
        outlined
        :options="availableVideoDevices"
        option-value="deviceId"
        emit-value
        map-options
        :value="videoDeviceId"
        @input="setChosenVideoDeviceId($event); devicesChanged = true"
      >
        <template v-slot:selected-item="scope">
          <span class="ellipsis">{{ scope.opt.label }}</span>
        </template>
      </q-select>

      <q-select
        class="device-select-box  col-auto q-mx-md"
        dense
        label="Microphone"
        outlined
        :options="availableAudioInDevices"
        option-value="deviceId"
        emit-value
        map-options
        :value="audioInDeviceId"
        @input="setChosenAudioInDeviceId($event); devicesChanged = true"
      >
        <template v-slot:selected-item="scope">
          <span class="ellipsis">{{ scope.opt.label }}</span>
        </template>
      </q-select>

      <q-select
        class="device-select-box  col-auto q-mx-md"
        dense
        label="Audio out"
        outlined
        :options="availableAudioOutDevices"
        option-value="deviceId"
        emit-value
        map-options
        :value="audioOutDeviceId"
        @input="setChosenAudioOutDeviceId($event); devicesChanged = true"
      >
        <template v-slot:selected-item="scope">
          <span class="ellipsis">{{ scope.opt.label }}</span>
        </template>
      </q-select>

      <q-btn v-if="devicesChanged" color="primary" label="applicera" @click="onMediaDeviceSelected" />
      <!-- </div> -->
      <q-space />
      <q-separator spaced vertical inset />
      <q-btn class="q-px-sm" color="negative" icon="call_end" @click="endCall" />
    </q-toolbar>
    <!-- <video
      ref="mainVideo"
      class="main-video col-grow"
      autoplay
    /> -->

    <!-- <q-input v-model="outChatMessage" rounded label="say something" @keyup.enter="sendMessage" /> -->
    <!-- <video
        ref="localVideo"
        :class="{'main-video': localVideoIsBig, 'thumbnail-video': !localVideoIsBig, }"
        muted
        autoplay
        @click="localVideoIsBig = !localVideoIsBig? !localVideoIsBig:localVideoIsBig"
      /> -->
    <!-- <p id="chat-message">
        {{ inChatMessage }}
      </p> -->
  </div>
  <!-- </q-page> -->
</template>

<script>

import { mapState, mapGetters, createNamespacedHelpers } from 'vuex';
const { mapMutations, mapActions } = createNamespacedHelpers('deviceSettings');
import peerUtil from 'js/peer-utils';

export default {
  name: 'Camera',
  components: {
  },
  data () {
    return {
      // localVideoIsBig: false,
      localStream: null,
      videoTrackSettings: null,
      // inChatMessage: 'message',
      // outChatMessage: '',
      // chosenVideoInputId: null,
      // chosenAudioInputId: null,
      devicesChanged: false,
    };
  },
  computed: {
    ...mapState({
      roomName: state => state.connectionSettings.roomName,
      videoDeviceId: state => state.deviceSettings.chosenVideoDeviceId,
      audioInDeviceId: state => state.deviceSettings.chosenAudioInDeviceId,
      audioOutDeviceId: state => state.deviceSettings.chosenAudioOutDeviceId,
      // availableMediaDevices: state => state.deviceSettings.availableMediaDevices,
      // availableVideoInputDevices: state => state.deviceSettings.availableVideoInputDevices,
    }),
    ...mapGetters({
      availableVideoDevices: 'deviceSettings/availableVideoDevices',
      availableAudioInDevices: 'deviceSettings/availableAudioInDevices',
      availableAudioOutDevices: 'deviceSettings/availableAudioOutDevices',
      roomPopulated: 'connectionSettings/roomIsPopulated',
    }),
  },
  watch: {
    //  (newValue, oldValue) {
    //   console.log('roomready changed to:', newValue);
    //   console.log('connectionState:', this.peerConnectionState);
    //   if (newValue && this.peerConnectionState !== 'connected') {
    //     await peerUtil.createPeer(true, this.onSignal, this.onStream, this.onMessage, this.onClose);
    //     this.$socket.client.emit('peerObjectCreated');
    //   }
    // },
  },
  sockets: {
    connect (data) {
      console.log('socket connected: ', data);
    },
    room (data) {
      console.log('room event from socket', data);
    },
    roomFull (msg) {
      console.log('roomFull:', msg);
    },
    signal (data) {
      console.log('signal event from socket', data);
      peerUtil.signalPeer(data);
    },
    errorMessage (msg) {
      console.log('socket error message:', msg);
    },
  },
  async mounted () {
    try {
      // await peerUtil.populateAvailableMediaDevices();
      // const videoConstraints = {
      //   deviceId: this.videoDeviceId,
      // };
      // const audioConstraints = {
      //   deviceId: this.audioInDeviceId,
      // };
      // this.localStream = await peerUtil.getLocalMediaStream(videoConstraints, audioConstraints);
      // this.$refs.mainVideo.srcObject = this.localStream;
      await this.requestMediaDevices();

      this.videoTrackSettings = this.localStream.getVideoTracks()[0].getSettings();
    } catch (e) {
      console.error(e);
    }
    console.log('creating peer with streamobject: ', this.localStream);
    // await peerUtil.createPeer(false, (d) => this.$socket.client.emit('signal', d), this.onStream, this.onMessage, this.onClose, this.localStream);
    // this.$socket.client.emit('peerObjectCreated');
    await this.createPeer();
    this.$socket.client.emit('join', this.roomName);

    console.log(this.availableVideoDevices);
  },
  beforeDestroy () {
    this.$socket.client.emit('leave', this.roomName);
    peerUtil.destroyPeer();
  },
  methods: {
    ...mapMutations(['setChosenVideoDeviceId', 'setChosenAudioInDeviceId', 'setChosenAudioOutDeviceId']),
    ...mapActions(['saveChosenDevicesToStorage']),
    async start () {
      console.log('start was called');
    },
    async createPeer () {
      await peerUtil.createPeer(false, (d) => this.$socket.client.emit('signal', d), this.onStream, null, this.onMessage, this.onClose, this.localStream);
      this.$socket.client.emit('peerObjectCreated');
    },
    onStream (stream) {
      console.log('received remote stream!!!', stream);
      this.$refs.remoteAudio.srcObject = stream;
    },
    onMessage (data) {
      console.log('received message', data);
      this.inChatMessage = data;
    },
    async onClose () {
      // await peerUtil.createPeer(false, (d) => this.$socket.client.emit('signal', d), this.onStream, null, this.onMessage, this.onClose, this.localStream);
      this.createPeer();
    },
    endCall () {
      // peerUtil.destroyPeer();
      this.$router.replace('/');
    },
    sendMessage () {
      peerUtil.sendMessage(this.outChatMessage);
      this.outChatMessage = '';
    },
    async requestMediaDevices () {
      const videoId = this.videoDeviceId;
      const videoConstraint = videoId ? { deviceId: videoId } : true;
      // videoConstraint.frameRate = 15;
      // videoConstraint.width = 3840;
      // videoConstraint.height = 1920;
      const audioId = this.audioInDeviceId;
      const audioConstraint = audioId ? { deviceId: audioId } : true;
      this.localStream = await peerUtil.getLocalMediaStream(videoConstraint, audioConstraint);

      // const videoTrack = this.localStream.getVideoTracks()[0];
      // const capabilities = videoTrack.getCapabilities();
      // console.log('capabilities: ', capabilities);
      // console.log('settings', videoTrack.getSettings());

      this.$refs.mainVideo.srcObject = this.localStream;
    },
    async onMediaDeviceSelected () {
      this.devicesChanged = false;
      await this.requestMediaDevices();
      this.saveChosenDevicesToStorage();
      peerUtil.setPeerOutputStream(this.localStream);
      // const videoId = this.videoDeviceId;
      // const videoConstraint = videoId ? { deviceId: videoId } : true;
      // // videoConstraint.frameRate = 15;
      // // videoConstraint.width = 3840;
      // // videoConstraint.height = 1920;
      // const audioId = this.audioInDeviceId;
      // const audioConstraint = audioId ? { deviceId: audioId } : true;
      // this.localStream = await peerUtil.getLocalMediaStream(videoConstraint, audioConstraint);
      // this.saveChosenDevicesToStorage();

      // // const videoTrack = this.localStream.getVideoTracks()[0];
      // // const capabilities = videoTrack.getCapabilities();
      // // console.log('capabilities: ', capabilities);
      // // console.log('settings', videoTrack.getSettings());

      // this.$refs.mainVideo.srcObject = this.localStream;
      // peerUtil.setPeerOutputStream(this.localStream);
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

.main-video {
  // z-index: -1;
  width: 100%;
  max-height: 100%
}

.flex-grow {
  flex: 1;
  min-height: 0;
}

.device-select-box {
  flex: 0 1 auto;
  width: 20rem;
  // white-space: nowrap;
  // overflow: hidden;
  // text-overflow: ellipsis;
  // width: 20%;
}

// .inner-box {
//   height: 100%;
//   width: 50%
// }

// .thumbnail-video {
//   background-color: white;
//   width: 20vw;
//   position: fixed;
//   left: 3rem;
//   top: 3rem;
//   z-index: -1;
//   border-radius: 1rem;
//   cursor: pointer;
//   box-shadow:
//   0 2.8px 2.2px rgba(0, 0, 0, 0.034),
//   0 6.7px 5.3px rgba(0, 0, 0, 0.048),
//   0 12.5px 10px rgba(0, 0, 0, 0.06)
// }

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
