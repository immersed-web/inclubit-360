<template>
  <q-page padding>
    <h1>
      <q-btn
        round
        flat
        icon="arrow_back_ios"
        class="q-mr-xl"
        to="/"
      />Enhetsinställningar
      <q-btn icon="refresh" round @click="refreshDevices" />
    </h1>
    <div class="row">
      <device-picker
        icon="videocam"
        label="Kamera"
        :device-list="!showState?availableVideoDevices:[]"
        :chosen-device-id="chosenVideoDeviceId"
        @devicePicked="setChosenVideoDeviceId"
      />
      <device-picker
        icon="mic"
        label="Mikrofon"
        :device-list="!showState?availableAudioInDevices:[]"
        :chosen-device-id="chosenAudioInDeviceId"
        @devicePicked="setChosenAudioInDeviceId"
      />
      <!-- <q-card
        v-for="(deviceData, key) in {Camera: {chosen: chosenVideoDevice, list: availableVideoDevices}, Microphone: {chosen: chosenAudioInDevice, list: availableAudioInDevices}}"
        :key="key"
        bordered
        flat
        class="col q-ma-lg"
      >
        <q-card-section v-if="deviceData.chosen">
          <h2><q-icon size="xl" class="q-mr-md" name="videocam" />{{ key }}</h2>
          <h3 />
        </q-card-section>
        <q-list class="q-ma-md">
          <q-item v-for="videoDevice in deviceData.list" :key="videoDevice.label" clickable @click="setChosenVideoDeviceId(videoDevice.deviceId)">
            <q-item-label>
              <p>{{ videoDevice.label }} </p>
            </q-item-label>
          </q-item>
        </q-list>
      </q-card> -->
      <!-- <q-card bordered flat class="col">
        <q-list>
          <q-item v-for="audioDevice in availableAudioInDevices" :key="audioDevice.label" clickable @click="setChosenAudioInDeviceId(audioDevice.deviceId)">
            <q-item-label>
              <p>{{ audioDevice.label }}</p>
            </q-item-label>
          </q-item>
        </q-list>
      </q-card> -->
    </div>
    <q-btn
      no-caps
      size="lg"
      label="Spara"
      color="primary"
      class="q-ma-md"
      :disable="saveConfirmed"
      @click="saveSettings"
    />
    <q-icon v-if="saveConfirmed" size="lg" name="check" color="positive" />
  </q-page>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapMutations, mapState, mapActions } = createNamespacedHelpers('deviceSettings');
import { getPermissionStatus, populateAvailableMediaDevices, triggerPermissionDialog } from 'src/js/peer-utils';
import DevicePicker from './settings/DevicePicker.vue';
export default {
  name: 'Settings',
  components: { DevicePicker },
  data () {
    return {
      saveConfirmed: false,
      showState: 0,
    };
  },
  computed: {
    ...mapGetters(['availableVideoDevices', 'availableAudioInDevices', 'availableAudioOutDevices']),
    ...mapState(['chosenVideoDeviceId', 'chosenAudioInDeviceId', 'chosenAudioOutDeviceId']),
    //   {
    //   chosenVideoDeviceId: state => state.chosenVideoDeviceId,
    //   chosenVideoDeviceId: state => state.chosenVideoDeviceId,
    // }
    // ),
    /** @returns {Object} */
    chosenVideoDevice () {
      return this.availableVideoDevices.find(dev => {
        return dev.deviceId === this.chosenVideoDeviceId;
      });
    },
    /** @returns {Object} */
    chosenAudioInDevice () {
      return this.availableAudioInDevices.find(dev => {
        return dev.deviceId === this.chosenAudioInputDeviceId;
      });
    },
    /** @returns {Object} */
    chosenAudioOutDevice () {
      return this.availableAudioOutDevices.find(dev => {
        return dev.deviceId === this.chosenAudioOutputDeviceId;
      });
    },
  },
  async created () {
    // await populateAvailableMediaDevices();
    // this.initializeChosenMediaDevices();

    // console.log(this.availableVideoDevices);
    // console.log(this.availableAudioInDevices);
    // console.log(this.availableAudioOutDevices);
    const status = await getPermissionStatus();
    const cameraNeeded = status.cameraStatus.state !== 'granted';
    const microphoneNeeded = status.microphoneStatus.state !== 'granted';

    if (cameraNeeded || microphoneNeeded) {
      await triggerPermissionDialog(cameraNeeded, microphoneNeeded);
      populateAvailableMediaDevices();
    }
  },
  methods: {
    ...mapMutations(['setChosenVideoDeviceId', 'setChosenAudioInDeviceId', 'setChosenAudioOutDeviceId']),
    ...mapActions(['initializeChosenMediaDevices', 'saveChosenDevicesToStorage']),
    refreshDevices () {
      this.showState = 1;
      populateAvailableMediaDevices();
      setTimeout(() => {
        this.showState = 0;
      }, 1000);
    },
    saveSettings () {
      this.saveChosenDevicesToStorage();
      this.saveConfirmed = true;
      setTimeout(() => {
        this.saveConfirmed = false;
      }, 1000);
    },
  },
};
</script>

<style scoped lang="scss">
</style>
