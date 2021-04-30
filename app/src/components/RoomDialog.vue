<template>
  <div id="room-dialog">
    <q-card>
      <q-card-section>
        <slot>
          {{ message }}
        </slot>
      </q-card-section>
      <q-card-actions v-if="retryButton" align="right">
        <q-btn color="primary" label="Försök igen" @click="$emit('retry')" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'RoomDialog',
  props: {
    message: {
      type: String,
      default: 'Något gick fel 🤨',
    },
    retryButton: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {

    };
  },
};
</script>

<style scoped lang="scss">
#room-dialog {
  z-index: 500;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  // margin-left: -50%;
  // margin-top: -50%;
}
</style>
