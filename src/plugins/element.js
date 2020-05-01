import Vue from 'vue'
import { Button, Form, FormItem, Input } from 'element-ui'
//弹窗提示框
import { Message } from 'element-ui'


Vue.prototype.$message = Message
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
