import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './plugins/element.js'
import './assets/css/base.css'
import './assets/fonts/iconfont.css'
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
Vue.config.productionTip = false
Vue.prototype.$http = axios

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')