<template>
  <q-page>
    <div id="main-container">
      <div>
        <q-btn label="Skicka kameraström" to="/camera" />
        <q-btn label="Titta på kameraström" to="/watch" />
      </div>
    </div>
    <q-btn
      id="settings-button"
      size="xl"
      round
      color="black"
      icon="settings"
    >
      <q-tooltip>
        Inställningar
      </q-tooltip>
    </q-btn>
  </q-page>
</template>

<script lang="ts">
export default {
  name: 'Start',
  data () {
    return {

    };
  },
};
</script>

<style scoped lang="scss">
#main-container {
  // display: flex;
  // flex-direction: column;
  min-height: inherit;
  // justify-content: center;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

#main-container div {
  // flex: 1 1 0;
  justify-self: center;
  align-self: center;

  * {
    margin: 3rem;
  }
}

#settings-button {
  position: fixed;
  bottom: 3rem;
  right: 3rem;
}
</style>
