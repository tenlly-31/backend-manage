import Vue from 'vue'
import {
    Button,
    Dialog,
    Form,
    FormItem,
    Input,
    Table,
    TableColumn,
    Message,
    Switch,
    Tooltip,
    Pagination,
    Menu,
    Submenu,
    MenuItem,
    MenuItemGroup,
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Header,
    Aside,
    Main,
    Card,
    Row,
    Col,
    MessageBox
} from 'element-ui'
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
    // 全局挂载
Vue.prototype.$Message = Message
Vue.prototype.$confirm = MessageBox.confirm