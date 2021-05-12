<template>
  <div id="main-title">
    <h1>
      INCLUBIT36<span>0</span>
    </h1>
    <h2>
      {{ subtitle }}
    </h2>
  </div>
</template>

<script>
export default {
  name: 'MainTitle',
  props: {
    subtitle: {
      type: String,
      default: 'delta på distans',
    },
  },
};
</script>

<style lang="scss" scoped>
#main-title {
  display: flex;
  flex-direction: column;
  max-width: 20rem;
  flex: 0 1 auto;
  // justify-self: end;
  align-items: flex-end;
  // self-end column justify-end
  h1 {
    font-size: 3.5rem;
    letter-spacing: 1rem;
    text-align: end;
    // direction: rtl;
    span {
      letter-spacing: 0;
    }
  }

  h2 {
    color: $secondary;
    font-family: 'Dosis', sans-serif;
    margin-top: -0.8em;
    text-transform: lowercase;
    text-align: end;
    // font-style: italic;
    // display: inline;
    white-space: nowrap;
    font-weight: 200;
  }
}
</style>
