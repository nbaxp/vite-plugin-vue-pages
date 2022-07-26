<template>
  <template v-for="item in menus" :key="item">
    <MenuItem v-if="!item.hidden" :model="item" />
  </template>
</template>
<script setup>
import { menus } from "virtual:vuepages";
console.log("menus:");
console.dir(menus);
</script>
