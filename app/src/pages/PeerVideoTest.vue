<template>
  <q-page class="column justify-around items-center">
    <video
      ref="localVideo"
      class="local-video col-3"
      autoplay
    />
    <video
      ref="remoteVideo"
      class="remote-video col-3"
      autoplay
    />

    <canvas ref="drawCanvas" />

    <p v-for="(item, index) in lastTenMsg" :key="index">
      {{ item }}
    </p>
    <div class="col-3">
      <q-input v-model="chatMessage" standout label="say something" @keyup.enter="sendMessage" />
      <label>
        Video In
        <select v-model="chosenVideoInputId" name="videoInput" @change="mediaDeviceChanged">
          <option v-for="deviceObject in availableVideoInputDevices" :key="deviceObject.deviceId" :value="deviceObject.deviceId">{{ deviceObject.label }}</option>
        </select>
      </label>
      <label>
        Audio In
        <select v-model="chosenAudioInputId" name="audioInput" @change="mediaDeviceChanged">
          <option v-for="deviceObject in availableAudioInputDevices" :key="deviceObject.deviceId" :value="deviceObject.deviceId">{{ deviceObject.label }}</option>
        </select>
      </label>
      <q-btn
        color="secondary"
        label="request video"
        @click="requestVideo"
      />
      <q-btn
        color="primary"
        label="await call"
        @click="createPeer(false)"
      />
      <q-btn
        color="positive"
        label="call"
        @click="createPeer(true)"
      />
      <q-btn
        color="negative"
        label="destroy peer"
        @click="destroyPeer"
      />
    </div>
  </q-page>
</template>

<script lang="ts">

import sceneUtils from 'js/scene-utils';
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

const Peer = require('simple-peer');
let channel = null;
let peerConnection = null;

export default {
  name: 'PeerVideoTest',
  data () {
    return {
      localStream: null,
      // peerConnection: null,
      mediaDevices: [],
      chosenVideoInputId: null,
      chosenAudioInputId: null,
      // roomName: 'test-connection',
      chatMessage: '',
      receivedMessages: [],
    };
  },
  computed: {
    ...mapState(['roomName', 'availableMediaDevices', 'activeVideoDeviceId',
      'activeAudioInputDeviceId',
      'activeAudioOutputDeviceId']),
    ...mapGetters(['availableVideoInputDevices', 'availableAudioInputDevices', 'availableAudioOutputDevices']),
    // videoInputDevices () {
    //   return this.mediaDevices.filter(device => device.kind === 'videoinput');
    // },
    // chosenVideoInput () {
    //   return this.videoInputDevices.find(element => element.deviceId === this.chosenVideoInputId);
    // },
    // audioInputDevices () {
    //   return this.mediaDevices.filter(device => device.kind === 'audioinput');
    // },
    // chosenAudioInput () {
    //   return this.audioInputDevices.find(element => element.deviceId === this.chosenAudioInputId);
    // },
    // audioOutputDevices () {
    //   return this.mediaDevices.filter(device => device.kind === 'audiooutput');
    // },
    lastTenMsg () {
      if (this.receivedMessages.length >= 10) {
        return this.receivedMessages.slice(this.receivedMessages.length - 10, this.receivedMessages.length);
      } else {
        return this.receivedMessages;
      }
    },
  },
  async mounted () {
    this.$socket.client.emit('join', this.roomName);
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
    this.setAvailableMediaDevices(devices);
    this.initializeActiveMediaDevices();

    // this.mediaDevices = devices;
    // this.chosenVideoInputId = this.videoInputDevices[0].deviceId;

    // this.chosenAudioInputId = this.audioInputDevices[0].deviceId;
    // console.log(devices);
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
      if (peerConnection) peerConnection.signal(data);
    },
  },
  methods: {
    ...mapMutations(['setAvailableMediaDevices']),
    ...mapActions(['initializeActiveMediaDevices']),
    async requestVideo () {
      try {
        console.log(peerConnection);
        this.localStream = await this.getLocalMediaStream();
        if (peerConnection) {
          console.log('adding stream dynamically');
          peerConnection.addStream(this.localStream);
        }
      } catch (err) {
        console.error(err);
      }
    },
    async getLocalMediaStream () {
      try {
        const videoConstraint = this.chosenVideoInputId ? { deviceId: this.chosenVideoInputId } : true;
        const audioConstraint = this.chosenAudioInputId ? { deviceId: this.chosenAudioInputId } : true;
        const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: audioConstraint });
        console.log(stream);
        this.$refs.localVideo.srcObject = stream;
        // this.localStream = stream;
        return stream;
      } catch (err) {
        this.$q.notify({
          message: 'Lyckades inte starta video/audio-enheten. So saad...',
          position: 'center',
          actions: [
            { label: 'Ok', color: 'white', handler: () => { /* ... */ } },
          ],
          color: 'negative',
          icon: 'report_problem',
        });
        console.error(err);
      }
    },
    async mediaDeviceChanged () {
      const stream = await this.getLocalMediaStream();
      if (!stream) { return; }
      if (peerConnection) {
        console.log('removing previous stream');
        if (this.localStream) {
          peerConnection.removeStream(this.localStream);
        }
        peerConnection.addStream(stream);
      }
      this.localStream = stream;
      sceneUtils.initThreeScene(this.$refs.drawCanvas);
      sceneUtils.addSphereToScene(sceneUtils.videoToSphereMesh(this.$refs.localVideo));
    },
    sendMessage () {
      console.log('sending message');
      try {
        // peerConnection.send(this.chatMessage);
        channel.send(this.chatMessage);
      } catch (err) {
        console.error(err);
      }
      this.chatMessage = '';
    },
    destroyPeer () {
      try {
        if (peerConnection) {
          console.log('destroying peer');
          // peerConnection.on('close', () => console.log('actively ignored peer closed event'));
          peerConnection.removeAllListeners('close');
          peerConnection.destroy();
        } else {
          console.log('no peer to destroy');
        }
      } catch (err) {
        console.error(err);
      }
    },
    createPeer (initiator = false) {
      this.destroyPeer();
      const config = {
        initiator: initiator,
        // channelName: 'chat',
        // channelConfig: { negotiated: true, id: 0 },
      };
      if (this.localStream) {
        config.stream = this.localStream;
      }
      peerConnection = new Peer(config);
      channel = peerConnection._pc.createDataChannel('chat', { negotiated: true, id: 1 });
      channel.onmessage = (event) => {
        console.log(event.data);
        this.receivedMessages.push(event.data);
      };

      console.log('created a peer object', peerConnection);
      peerConnection.on('signal', data => {
        this.$socket.client.emit('signal', data);
      });

      peerConnection.on('connect', () => {
        console.log('peer connected');
      });

      peerConnection.on('close', () => {
        console.log('peer connection was closed');
        this.createPeer(initiator);
      });

      peerConnection.on('error', (err) => {
        console.error('peer error: ', err);
      });
      peerConnection.on('stream', stream => {
        this.$refs.remoteVideo.srcObject = stream;
      });

      peerConnection.on('data', data => {
        console.log('got a message: ' + data);
        this.receivedMessages.push(data);
      });
    },
  },
};
</script>

<style scoped lang="scss">

  video {
    margin: 0.5rem;
    background-color: black;
  }
</style>
