import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import treeTable from 'vue-table-with-tree-grid'
// 导入文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme



import './plugins/element.js'
import './assets/css/base.css'
import './assets/fonts/iconfont.css'
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
    // axios请求拦截，在Authorization中添加token令牌
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
Vue.use(VueQuillEditor, /* { default global options } */ )
Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.component('tree-table', treeTable)
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal)
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')