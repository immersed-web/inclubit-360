<template>
  <q-page class="flex flex-center">
    <q-form>
      <q-card class="connect-form">
        <q-input
          v-model="connectUrl"
          standout
        />
      </q-card>
      <q-btn
        color="primary"
        label="connect"
      />
    </q-form>
  </q-page>
</template>

<script>
export default {
  name: 'Connect',
  data () {
    return {
      connectUrl: '',
    };
  },
};
</script>

<style scoped lang="scss">
.connect-form {
  max-width: 100rem;
}
</style>
