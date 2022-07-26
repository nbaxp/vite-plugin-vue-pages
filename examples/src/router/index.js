import { routes } from 'virtual:vuepages';
import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false });

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  console.log(`before ${from.path} to ${to.path}:`);
  NProgress.start();
  try {
    next();
  } catch (error) {
    console.log(error);
  }
  NProgress.done();
});

router.afterEach((to, from) => {
  document.title = `${to.meta.title}`;
  console.log('afterEach:' + from.path + '=>' + to.path);
});

console.log(routes);

export default router;
