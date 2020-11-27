<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <overlay-page-name />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import OverlayPageName from 'src/components/OverlayPageName.vue';

export default {
  name: 'MainLayout',
  components: {
    OverlayPageName,
  },
  data () {
    return {

    };
  },
};
</script>
