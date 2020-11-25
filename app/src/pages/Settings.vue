<template>
  <q-page padding>
    <h1>SETTINGS PAGE</h1>
    <div class="row">
      <q-card bordered flat class="col">
        <q-card-section v-if="chosenVideoDevice">
          <h3>{{ chosenVideoDevice.label }}</h3>
        </q-card-section>
        <q-list>
          <q-item v-for="videoDevice in availableVideoInputDevices" :key="videoDevice.label" clickable @click="setVideoInputId(videoDevice.deviceId)">
            <q-item-label>
              <p>{{ videoDevice.label }} </p>
            </q-item-label>
          </q-item>
        </q-list>
      </q-card>
      <q-card bordered flat class="col">
        <q-list>
          <q-item v-for="audioDevice in availableAudioInputDevices" :key="audioDevice.label" clickable @click="setAudioInputId(audioDevice.deviceId)">
            <q-item-label>
              <p>{{ audioDevice.label }}</p>
            </q-item-label>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
import { populateAvailableMediaDevices } from 'src/js/peer-utils';
export default {
  name: 'Settings',
  data () {
    return {

    };
  },
  computed: {
    ...mapGetters(['availableVideoInputDevices', 'availableAudioInputDevices', 'availableAudioOutputDevices']),
    ...mapState({
      activeVideoDeviceId: state => state.deviceSettings.activeVideoDeviceId,
    }),
    chosenVideoDevice () {
      return this.availableVideoInputDevices.find(dev => {
        return dev.deviceId === this.activeVideoDeviceId;
      });
    },
    chosenAudioInputDevice () {
      return this.availableAudioInputDevices.find(dev => {
        return dev.deviceId === this.activeAudioInputDeviceId;
      });
    },
    chosenAudioOutputDevice () {
      return this.availableAudioOutputDevices.find(dev => {
        return dev.deviceId === this.activeAudioOutputDeviceId;
      });
    },
  },
  created () {
    populateAvailableMediaDevices();
    console.log(this.availableVideoInputDevices);
    console.log(this.availableAudioInputDevices);
    console.log(this.availableAudioOutputDevices);
  },
  methods: {
    ...mapMutations(['setActiveVideoDeviceId', 'setActiveAudioInputDeviceId', 'setActiveAudioOutputDeviceId']),
    setAudioInputId (id) {
      console.log(id);
      this.setActiveAudioInputDeviceId(id);
    },
    setVideoInputId (id) {
      this.setActiveVideoDeviceId(id);
      console.log(id);
    },
  },
};
</script>

<style scoped lang="scss">
</style>
