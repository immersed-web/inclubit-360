<template>
  <q-page>
    <div id="overlay-container" class="column no-wrap">
      <DebugInfo :debug-data="{...debugData, remoteIsMuted: !remoteStreamEnabled}" />
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
        <q-btn :icon="remoteStreamEnabled? 'volume_up': 'volume_off'" @click="remoteToggleMute">
          <q-tooltip content-class="bg-accent">
            mute/unmute peer
          </q-tooltip>
        </q-btn>

        <meter
          class="vertical-meter"
          :value="debugData.localVolume"
          min="0"
          low="0.2"
          high="0.8"
          max="1"
        />
        <q-btn>
          <mic-icon />
        </q-btn>
        <q-btn class="q-mr-md meter-button" :icon="localStreamEnabled? 'mic': 'mic_off'" @click="toggleMicrophone">
          <div class="custom-meter" />
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
import { attachRMSCallback, createRMSMeter, closeRMSMeter } from 'js/audio-utils';
import MicIcon from 'src/components/MicIcon.vue';
// import sceneUtils from 'js/scene-utils';
export default {
  name: 'Viewer',
  components: {
    DebugInfo,
    MicIcon,
  },
  data () {
    return {
      localStream: null,
      localStreamEnabled: true,
      remoteStream: null,
      remoteStreamEnabled: true,
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
      roomName: state => state.connectionSettings.roomName,
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
        peerUtil.createPeer(true, this.onSignal, this.onStream, this.onTrack, this.onData, this.onClose, this.localStream);
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
    await this.requestAudioDevices();
    this.$socket.client.emit('join', this.roomName);

    // sceneUtils.initThreeScene(this.$refs.drawCanvas);
    // console.log('videoSphereSource is:', this.$refs.videoSphereSource);
  },
  beforeDestroy () {
    console.log('destroying viewer component');
    closeRMSMeter();
    this.$socket.client.emit('leave', this.roomName);
    peerUtil.destroyPeer();
  },
  methods: {
    ...mapMutations({
      setChosenVideoDeviceId: 'deviceSettings/setChosenVideoDeviceId',
      setChosenAudioInDeviceId: 'deviceSettings/setChosenAudioInDeviceId',
      setChosenAudioOutDeviceId: 'deviceSettings/setChosenAudioOutDeviceId',
    }),
    ...mapActions({ saveChosenDevicesToStorage: 'deviceSettings/saveChosenDevicesToStorage' }),
    remoteToggleMute () {
      peerUtil.sendData('setMuteState', this.remoteStreamEnabled);
    },
    onSignal (d) {
      console.log('signal triggered from peer obj:', d);
      this.$socket.client.emit('signal', d);
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
      if (type === 'muteState') {
        this.remoteStreamEnabled = !data;
      }
    },
    onClose () {
      // peerUtil.createPeer(true, this.onSignal, this.onStream, this.onData, this.onClose);
    },
    sendMessage () {
      peerUtil.sendMessage(this.outChatMessage);
      this.outChatMessage = '';
    },
    sendData (type, data) {
      peerUtil.sendData(type, data);
    },
    toggleMicrophone () {
      this.localStreamEnabled = !this.localStreamEnabled;
      if (this.localStream) {
        this.localStream.getAudioTracks()[0].enabled = this.localStreamEnabled;
        this.sendData('muteState', !this.localStreamEnabled);
      }
      // toggleMute();
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
    },
    async requestAudioDevices () {
      const audioConstraints = {
        deviceId: this.audioInDeviceId,
      };
      this.localStream = await peerUtil.getLocalMediaStream(false, audioConstraints);
      console.log('localStream:', this.localStream);
      await createRMSMeter(this.localStream);
      attachRMSCallback(value => {
      // console.log(value);
        this.debugData.localVolume = value;
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

  background-image: url('https://static-cse.canva.com/blob/142356/removing-background-images_Unsplash.8b2a58cb.jpeg');
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

// #enter-vr {
//   position: fixed;
//   top: 2rem;
//   right: 2rem;

// }

.device-select-box {
  flex: 0 1 auto;
  width: 15rem;
  // white-space: nowrap;
  // overflow: hidden;
  // text-overflow: ellipsis;
  // width: 20%;
}

// .meter-button i {
//   mix-blend-mode: screen;
// }

.custom-meter {
  // z-index: -1;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  transform-origin: bottom center;
  transform:
    scaleY(20);
  background-color: rgb(117, 255, 117);
  // font-size: 2rem;
  // color: green;
  mix-blend-mode: exclusion;
}

.vertical-meter {
  width: 36px; //TODO: could we somehow set a dynamic/automatic height?
  transform: rotate(-90deg);
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
