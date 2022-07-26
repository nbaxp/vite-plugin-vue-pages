import { defineAsyncComponent } from "vue";

export default function getSvgComponent(name) {
  return defineAsyncComponent(() => import(`./assets/icons/${name}.svg`));
};

