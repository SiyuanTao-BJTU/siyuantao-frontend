import { createStore } from 'vuex'

// 导入各个模块的 store
import user from '@/user/store/user.js'
import product from '@/product/store/product.js'
import order from '@/order/store/order.js'
import chat from '@/chat/store/chat.js'
import notification_report from '@/notification_report/store/notification_report.js'
import admin from '@/admin/store/admin.js'

const store = createStore({
  modules: {
    user,
    product,
    order,
    chat,
    notification_report,
    admin
  }
})

export default store 