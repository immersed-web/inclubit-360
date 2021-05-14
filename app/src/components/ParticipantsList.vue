<template>
  <q-card id="list-container" class="">
    <q-list>
      <q-item-label header class="bg-secondary text-white">
        Användare i rummet
      </q-item-label>
      <q-separator />
      <q-item v-for="participant in participants" :key="participant.id">
        <q-item-section avatar>
          <q-icon :name="participant.sender?'o_videocam':'o_visibility'" />
        </q-item-section>
        <q-item-section class="name-column">
          {{ participant.name }}
        </q-item-section>
        <q-item-section v-if="participant.isMe" side>
          (du)
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
export default {
  props: {
    participants: {
      type: Array,
      required: true,
    },
  },

};
</script>

<style lang="scss" scoped>
.name-column {
  align-self: center;
  display: block;
  max-width: 10rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

#list-container {
  // max-width: 15rem;

  // * {
  //   overflow: hidden;
  //   // display: block;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  //   white-space: nowrap;
  //   // outline: 1px solid white;
  // }

  // p {
  //   margin: 0;
  // }
}
</style>
