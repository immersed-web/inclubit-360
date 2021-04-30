<template>
  <q-page>
    <RoomDialog v-if="roomState == 'joining'">
      Försöker gå med i rummet
      <q-spinner size="xl" />
    </RoomDialog>
    <RoomDialog v-else-if="roomState == 'full'" :message="roomError" retry-button @retry="init" />
    <RoomDialog v-else-if="!roomReady">
      Endast du är i det här rummet än så länge 🤷‍♀️
      <q-spinner size="lg" />
    </RoomDialog>
    <RoomDialog v-else-if="!peerIsConnected">
      Ännu ej ansluten
      <q-spinner size="lg" />
    </RoomDialog>
    <div id="overlay-container" class="column no-wrap">
      <DebugInfo :debug-data="{...debugData, remoteIsMuted: !remoteMicEnabled}" />
      <div class="col-grow">
        <a-scene embedded vr-mode-ui="enterVRButton: #enter-vr">
          <a-camera look-controls-enabled wasd-controls-enabled="false" />
          <!-- <a-plane
        position="0 0 -4"
        rotation="-90 0 0"
        width="4"
        height="4"
        color="#7BC8A4"
        shadow
      /> -->
        </a-scene>
      </div>
      <q-toolbar class="">
        <q-toolbar-title class="q-mr-md" shrink>
          {{ roomName }}
        </q-toolbar-title>

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
          @input="setChosenAudioInDeviceId($event); onAudioDeviceSelected();"
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
          @input="setChosenAudioOutDeviceId($event); onAudioDeviceSelected();"
        >
          <template v-slot:selected-item="scope">
            <span class="ellipsis">{{ scope.opt.label }}</span>
          </template>
        </q-select>

        <!-- <q-btn v-if="devicesChanged" color="primary" label="applicera" @click="mediaDeviceChanged" />
      -->
        <q-space />
        <!-- <meter
          class="vertical-meter"
          :value="debugData.localVolume"
          min="-15"
          low="-10"
          high="-1"
          max="0"
        /> -->

        <q-btn :disable="!peerIsConnected" color="dark" class="q-mr-sm" @click="remoteToggleMic">
          <audio-icon v-show="remoteMicEnabled" ref="speakerIcon" icon="speaker" />
          <q-icon v-show="!remoteMicEnabled" name="volume_off" />
          <q-tooltip content-class="bg-accent">
            mute/unmute peer
          </q-tooltip>
        </q-btn>
        <q-btn color="dark" class="q-mr-md meter-button" @click="setMicrophoneEnable(!localMicEnabled)">
          <audio-icon v-show="localMicEnabled" ref="micIcon" />
          <q-icon v-show="!localMicEnabled" name="mic_off" />
          <q-tooltip content-class="bg-accent">
            mic on/off
          </q-tooltip>
        </q-btn>
        <q-btn id="enter-vr" class="text-no-wrap" color="accent" label="enter VR" />
        <q-separator class="q-mx-lg" vertical inset />
        <q-btn class="q-px-sm" color="negative" icon="call_end" @click="endCall" />
      </q-toolbar>
      <video
        id="remote-video"
        ref="remoteVideo"
        class="thumbnail-video"
        autoplay
        @play="remoteVideoStarted"
      />

      <!-- <canvas id="draw-canvas" ref="drawCanvas" class="main-video" /> -->
      <p id="chat-message">
        {{ inChatMessage }}
      </p>
    </div>
  </q-page>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import peerUtil from 'js/peer-utils';
import DebugInfo from 'components/DebugInfo.vue';
// import { attachRMSCallback, createRMSMeter, closeRMSMeter } from 'js/audio-utils';
import audioAnalyzer from 'js/audio-utils';
const micAnalyzer = audioAnalyzer();
const speakerAnalyzer = audioAnalyzer();
import AudioIcon from 'src/components/AudioIcon.vue';
import RoomDialog from 'src/components/RoomDialog.vue';
// import sceneUtils from 'js/scene-utils';
export default {
  name: 'Viewer',
  components: {
    DebugInfo,
    AudioIcon,
    RoomDialog,
  },
  data () {
    return {
      localStream: null,
      localMicEnabled: true,
      remoteStream: null,
      remoteMicEnabled: true,
      outChatMessage: '',
      inChatMessage: '',
      debugData: {
        videoWidth: '',
        videoHeight: '',
        localVolume: 0,
      },
    };
  },
  computed: {
    /** @returns {any} */
    ...mapState({
      username: state => state.authState.currentUser,
      roomName: state => state.connectionSettings.roomName,
      roomMembers: state => state.connectionSettings.roomMembers,
      roomState: state => state.connectionSettings.roomState,
      roomError: state => state.connectionSettings.roomError,
      peerConnectionState: state => state.connectionSettings.peerConnectionState,
      videoDeviceId: state => state.deviceSettings.chosenVideoDeviceId,
      audioInDeviceId: state => state.deviceSettings.chosenAudioInDeviceId,
      audioOutDeviceId: state => state.deviceSettings.chosenAudioOutDeviceId,
    }),
    /** @returns {any} */
    ...mapGetters({
      roomReady: 'connectionSettings/roomIsPopulated',
      availableAudioInDevices: 'deviceSettings/availableAudioInDevices',
      availableAudioOutDevices: 'deviceSettings/availableAudioOutDevices',
      peerIsConnected: 'connectionSettings/peerIsConnected',
    }),
    // /** @return { boolean } */
    // remoteIsMuted () {
    //   try {
    //     console.log('REVALUATING REMOTE MUTED');
    //     const audioTrack = this.remoteStream.getAudioTracks()[0];
    //     return audioTrack.enabled;
    //   } catch (err) {
    //     console.error(err);
    //   }
    //   return false;
    // },
  },
  watch: {
    roomReady (newValue, oldValue) {
      console.log('roomready changed to:', newValue);
      console.log('connectionState:', this.peerConnectionState);
      if (newValue && this.peerConnectionState !== 'connected') {
        console.log('should set up peer object now');
        peerUtil.createPeer(true, this.onConnect, (d) => this.$socket.client.emit('signal', d), this.onStream, this.onTrack, this.onData, this.onClose, this.localStream);
      }
    },
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
    // const audioConstraints = {
    //   deviceId: this.audioInDeviceId,
    // };
    // this.localStream = await peerUtil.getLocalMediaStream(false, audioConstraints);
    // console.log('localStream:', this.localStream);
    // await createRMSMeter(this.localStream);
    // attachRMSCallback(value => {
    //   // console.log(value);
    //   this.debugData.localVolume = value;
    // });
    // startRMS();

    // this.$socket.client.emit('join', this.roomName, { nick: this.username, sender: false }, (response) => {
    //   console.log('response :>> ', response);
    // });

    // sceneUtils.initThreeScene(this.$refs.drawCanvas);
    // console.log('videoSphereSource is:', this.$refs.videoSphereSource);
    await this.init();
  },
  async beforeDestroy () {
    console.log('destroying viewer component');
    micAnalyzer.detachStream();
    speakerAnalyzer.detachStream();
    const response = await this.$socket.client.request('leave', this.roomName);
    this.setNewRoomData(response);
    console.log('response from leaving room ack :>> ', response);
    peerUtil.destroyPeer();
  },
  methods: {
    async init () {
      this.setRoomState({ state: 'joining', error: '' });
      try {
        const roomName = this.roomName;
        console.log(roomName);
        const username = this.username;
        console.log(username);
        const response = await this.$socket.client.request('join', roomName, { nick: username, sender: false });
        if (response.error) {
          return;
        }
        console.log('response :>> ', response);
        this.setNewRoomData(response);
      } catch (err) {
        console.error(err);
      }

      await this.requestAudioDevices();
    },
    ...mapMutations({
      setChosenVideoDeviceId: 'deviceSettings/setChosenVideoDeviceId',
      setChosenAudioInDeviceId: 'deviceSettings/setChosenAudioInDeviceId',
      setChosenAudioOutDeviceId: 'deviceSettings/setChosenAudioOutDeviceId',
      setRoomState: 'connectionSettings/setRoomSate',
    }),
    ...mapActions({
      saveChosenDevicesToStorage: 'deviceSettings/saveChosenDevicesToStorage',
      setNewRoomData: 'connectionSettings/setRoom',
    }),
    onConnect () {
      this.sendData('micEnabled', this.localMicEnabled);
    },
    async onStream (stream) {
      console.log('received remote stream!!!', stream);
      this.remoteStream = stream;

      this.$refs.remoteVideo.srcObject = this.remoteStream;
      // this.$refs.videoSphereSource.srcObject = this.remoteStream;
      // document.querySelector('#vr-video').srcObject = this.remoteStream;
      // document.querySelector('#vr-video').components.material.material.map.image.play();

      // document.querySelector("#antarctica").components.material.material.map.image.play();
      // this.$refs.videoSphereSource.components.material.material.map.image.play();

      await speakerAnalyzer.attachStream(this.remoteStream);
      speakerAnalyzer.attachCallback(value => {
        this.$refs.speakerIcon.setMeterHeight(value * 1.4);
      });

      try {
        await this.$refs.remoteVideo.play();
      } catch (err) {
        console.error(err);
        this.$refs.remoteVideo.muted = true;
        await this.$refs.remoteVideo.play();
      }

      this.initVideoSphere(this.$refs.remoteVideo);
      // sceneUtils.addSphereToScene(sceneUtils.videoToSphereMesh(this.$refs.remoteVideo));
    },
    onTrack (track, stream) {
      console.log('received track!', track, stream);
      if (track.kind !== 'video') {
        return;
      }

      try {
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        this.debugData.videoWidth = settings.width;
        this.debugData.videoHeight = settings.height;
        console.log(settings);
      } catch (err) {
        console.error(err);
      }
    },
    onData (type, data) {
      // this.inChatMessage = data;
      if (type === 'micEnabled') {
        this.remoteMicEnabled = data;
      } else if (type === 'setMicEnabled') {
        this.setMicrophoneEnable(data);
      }
    },
    onClose () {
      this.remoteStream = null;
    },
    sendMessage () {
      peerUtil.sendMessage(this.outChatMessage);
      this.outChatMessage = '';
    },
    sendData (type, data) {
      peerUtil.sendData(type, data);
    },
    setMicrophoneEnable (isEnabled) {
      this.localMicEnabled = isEnabled;
      if (this.localStream) {
        this.localStream.getAudioTracks()[0].enabled = this.localMicEnabled;
        this.sendData('micEnabled', this.localMicEnabled);
      }
      // toggleMute();
    },
    remoteToggleMic () {
      peerUtil.sendData('setMicEnabled', !this.remoteMicEnabled);
    },
    endCall () {
      this.$router.replace('/');
    },
    remoteVideoStarted () {
      console.log('remotevideo started!');
    },
    async onAudioDeviceSelected () {
      await this.requestAudioDevices();
      this.saveChosenDevicesToStorage();
      this.setMicrophoneEnable(this.localMicEnabled); // If we get new stream we need to re apply mute setting
      peerUtil.setPeerOutputStream(this.localStream);
    },
    async requestAudioDevices () {
      const audioConstraints = {
        deviceId: this.audioInDeviceId,
      };
      this.localStream = await peerUtil.getLocalMediaStream(false, audioConstraints);
      console.log('localStream:', this.localStream);
      await micAnalyzer.attachStream(this.localStream);
      micAnalyzer.attachCallback(value => {
      // console.log(value);
        this.$refs.micIcon.setMeterHeight(value * 1.4);
        // this.debugData.localVolume = value;
      });
    },
    initVideoSphere (videoElement) {
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
    },
  },

};
</script>

<style scoped lang="scss">
// #draw-canvas {
//   // z-index: -1;
//   display: block;
//   width: 30vw;
//   height: 30vh;
//   top: auto;
//   left: auto;
//   right: 2vw;
//   bottom: 2vh;
// }

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

  // background-image: url('https://static-cse.canva.com/blob/142356/removing-background-images_Unsplash.8b2a58cb.jpeg');
}

#remote-video {
  background-color: transparent;
  width: 20vw;
  position: fixed;
  right: 3rem;
  top: 3rem;
  z-index: 50;
  border-radius: 1rem;
  box-shadow:
  0 2.8px 2.2px rgba(0, 0, 0, 0.034),
  0 6.7px 5.3px rgba(0, 0, 0, 0.048),
  0 12.5px 10px rgba(0, 0, 0, 0.06)
}

.device-select-box {
  flex: 0 1 auto;
  width: 15rem;
  // white-space: nowrap;
  // overflow: hidden;
  // text-overflow: ellipsis;
  // width: 20%;
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
