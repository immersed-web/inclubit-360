<template>
  <q-card
    bordered
    flat
    class="col q-ma-lg q-pa-md"
  >
    <q-card-section class="row items-center q-gutter-lg">
      <q-icon size="md" class="q-my-none" :name="icon" />
      <h4 class="q-my-none">
        {{ label }}
      </h4>
      <q-card v-if="chosenDevice" class="bg-secondary q-my-none q-pa-md">
        {{ chosenDevice.label }}
      </q-card>
    </q-card-section>
    <q-list>
      <q-item
        v-for="device in deviceList"
        :key="device.deviceId"
        v-ripple
        clickable
        @click="pickDevice(device.deviceId)"
      >
        <q-item-section>
          <p>{{ device.label }} </p>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
export default {
  name: 'DevicePicker',
  props: {
    deviceList: {
      required: true,
      type: Array,
    },
    chosenDeviceId: {
      required: false,
      default: undefined,
      type: String,
    },
    label: {
      default: 'Devices',
      type: String,
    },
    icon: {
      default: 'api',
      type: String,
    },
  },
  data () {
    return {

    };
  },
  computed: {
    chosenDevice () {
      return this.deviceList.find(dev => dev.deviceId === this.chosenDeviceId);
    },
  },
  methods: {
    pickDevice (devId) {
      this.$emit('devicePicked', devId);
    },
  },
};
</script>

<style scoped lang="scss">
</style>
