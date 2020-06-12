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
    <q-infinite-scroll reverse>
      <template slot="loading">
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
        </div>
      </template>

      <div v-for="(item, index) in lastTenMsg" :key="index" class="caption q-py-sm">
        <q-badge class="shadow-1">
          {{ item }}
        </q-badge>
      </div>
    </q-infinite-scroll>

    <!-- <p v-for="(item, index) in lastTenMsg" :key="index">
      {{ item }}
    </p> -->
    <div class="col-3">
      <q-input v-model="chatMessage" standout label="say something" @keyup.enter="sendMessage" />
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

const Peer = require('simple-peer');

let channel = null;

export default {
  name: 'Camera',
  data () {
    return {
      localStream: null,
      peerConnection: null,
      connectionName: 'test-connection',
      chatMessage: '',
      receivedMessages: [],
    };
  },
  computed: {
    lastTenMsg () {
      if (this.receivedMessages.length >= 10) {
        return this.receivedMessages.slice(this.receivedMessages.length - 10, this.receivedMessages.length);
      } else {
        return this.receivedMessages;
      }
    },
  },
  mounted () {
    this.$socket.client.emit('join', this.connectionName);
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
      if (this.peerConnection) this.peerConnection.signal(data);
    },
  },
  methods: {
    async requestVideo () {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        this.$refs.localVideo.srcObject = stream;

        this.localStream = stream;

        console.log(this.$refs.localVideo);
      } catch (err) {
        console.error(err);
      }
    },
    sendMessage () {
      console.log('sending message');
      try {
        // this.peerConnection.send(this.chatMessage);
        channel.send(this.chatMessage);
      } catch (err) {
        console.error(err);
      }
      this.chatMessage = '';
    },
    destroyPeer () {
      try {
        if (this.peerConnection) {
          console.log('destroying peer');
          // this.peerConnection.on('close', () => console.log('actively ignored peer closed event'));
          this.peerConnection.removeAllListeners('close');
          this.peerConnection.destroy();
        } else {
          console.log('no peer to destroy');
        }
      } catch (err) {
        console.error(err);
      }
    },
    createPeer (initiator = false) {
      this.destroyPeer();
      const config = { initiator: initiator };
      if (this.localStream) {
        config.stream = this.localStream;
      }
      this.peerConnection = new Peer(config);
      channel = this.peerConnection._pc.createDataChannel('chat', { negotiated: true, id: 0 });
      channel.onopen = function (event) {
      };
      channel.onmessage = (event) => {
        console.log(event.data);
        this.receivedMessages.push(event.data);
      };

      console.log('created a peer object', this.peerConnection);
      this.peerConnection.on('signal', data => {
        this.$socket.client.emit('signal', data);
      });

      this.peerConnection.on('connect', () => {
        console.log('peer connected');
      });

      this.peerConnection.on('close', () => {
        console.log('peer connection was closed');
        this.createPeer(initiator);
      });

      this.peerConnection.on('error', (err) => {
        console.error('peer error: ', err);
      });
      this.peerConnection.on('stream', stream => {
        this.$refs.remoteVideo.srcObject = stream;
      });

      this.peerConnection.on('data', data => {
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
