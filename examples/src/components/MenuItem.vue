<template>
  <div v-if="model.isDirectory">
    <div>
      <component :is="model.component" />{{ model.title }}[{{ model.order }}]
    </div>
    <div :key="item" v-for="item in model.children" style="padding-left: 2em">
      <MenuItem :model="item"></MenuItem>
    </div>
  </div>
  <div v-else>
    <router-link :to="model.path">
      <component :is="model.component" />
      {{ model.title }}[{{ model.order }}]
    </router-link>
  </div>
</template>
<script setup>
defineProps({
  model: {
    type: Object,
    default: null,
  },
});
</script>
