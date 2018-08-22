// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueResource from 'vue-resource';
import router from './router/index.js';
import App from './App';
import 'common/stylus/index.styl';
Vue.use(VueResource);
Vue.config.productionTip = false;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  // components: { App },
  // template: '<App/>',
  router,
  render: h => h(App)
});
