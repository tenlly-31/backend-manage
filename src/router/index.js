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
    // 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next()
    const tokenStr = window.sessionStorage.getItem('token')
    console.log(tokenStr)
    if (!tokenStr) return next('/login')
    next()
})
export default router