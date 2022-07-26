<template>
  <div>$route.matched:</div>
  <div v-for="item in $route.matched">{{ item.path }}=>{{ item.name }}</div>
  <div>$route.meta:</div>
  <div>{{ $route.meta }}</div>
</template>
