// import something here
import 'aframe';

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default ({ Vue }) => {
  // ignore a frame elements!!
  Vue.config.ignoredElements = [/a-*/];
};
