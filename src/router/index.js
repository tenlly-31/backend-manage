import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/login'
const home = () =>
    import ('../components/home')
Vue.use(VueRouter)

const routes = [{
        // 重定向
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: login
    },
    {
        path: '/home',
        component: home
    }
]

const router = new VueRouter({
    routes
})

export default router