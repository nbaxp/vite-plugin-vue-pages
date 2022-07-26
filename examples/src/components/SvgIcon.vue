<template>
  <SvgComponent />
</template>
<script setup>
import getSvgComponent from "../svg.js";
const props = defineProps({
  name: {
    type: String,
    default: "file",
  },
});
const SvgComponent = getSvgComponent(props.name);
</script>
