import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import WebSocket from "./util/ws";
import store from "./store";
Vue.config.productionTip = false;
Vue.prototype.$ws = {
  ws: null,
  WebSocket: WebSocket,
};
new Vue({ store, router, render: (h) => h(App) }).$mount("#app");
