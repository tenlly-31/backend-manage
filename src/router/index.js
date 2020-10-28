import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/login'
const home = () =>
    import ('../components/home')
const welcome = () =>
    import ('../components/welcome')
const user = () =>
    import ('../components/users/user')
const rights = () =>
    import ('../components/power/rights')
const roles = () =>
    import ('../components/power/roles')
const cate = () =>
    import ('../components/goods/cate')
const params = () =>
    import ('../components/goods/params')
const goods = () =>
    import ('../components/goods/goods')
const add = () =>
    import ('../components/goods/add')
    // const add = () =>
    //     import ('../components/goods/add')
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
            },
            {
                path: '/rights',
                component: rights
            },
            {
                path: '/roles',
                component: roles
            },
            {
                path: '/goods',
                component: goods,
            },
            {
                path: '/params',
                component: params
            },
            {
                path: '/categories',
                component: cate
            },
            {
                path: '/goods/add',
                component: add
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