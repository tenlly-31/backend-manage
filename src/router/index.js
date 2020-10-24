import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/login'
const home = () =>
    import ('../components/home')
const welcome = () =>
    import ('../components/welcome')
const user = () =>
    import ('../components/users/user')
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
        component: home,
        children: [{
                path: '/',
                redirect: '/welcome'
            },
            {
                path: '/welcome',
                component: welcome
            },
            {
                path: '/users',
                component: user
            }
        ]
    }
]

const router = new VueRouter({
        routes,
        mode: 'history'
    })
    // 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next()
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})
export default router