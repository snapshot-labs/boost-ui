import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Create from '@/views/Create.vue';
import Boost from '@/views/Boost.vue';

const routes: any[] = [
  { path: '/', name: 'home', component: Home },
  { path: '/boost/:id', name: 'boost', component: Boost },
  { path: '/create/:strategy/:id', name: 'create', component: Create }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.params.retainScrollPosition) return {};
    if (to.hash) {
      const position = { selector: to.hash };
      return { el: position };
    }
    return { top: 0 };
  }
});

export default router;
