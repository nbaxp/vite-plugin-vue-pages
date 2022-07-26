<template>
  <div class="header">
    <h1>
      <router-link to="/">{{
        $router
          .getRoutes()
          .find((o) => o.path === "/" && o.name.toLocaleLowerCase() === "index")
          .meta.title
      }}</router-link>
    </h1>
  </div>
  <hr />
</template>
