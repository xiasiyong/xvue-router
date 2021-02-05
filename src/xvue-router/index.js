
let _Vue = null

export default class XVueRouter {
  static install (Vue) {
    // 1. 判断vueRouter是否已经安装，如果是，立即退出
    if (XVueRouter.install.installed) {
      return
    }
    XVueRouter.install.installed = true
    // 2. 保存Vue，方便后续直接使用
    _Vue = Vue
    // 3. 给Vue的原型上面添加$router属性，让所有vue的实例都可以访问到
    Vue.mixin({
      beforeCreate () {
        if (this.$options.router) { // 只有根组件的this.$options中才有router属性
          _Vue.prototype.$router = this.$options.router
          this.$router.init()
        }
      }
    })
  }

  constructor (options) {
    this.options = options
    this.routeMap = {}
    // 一定要是响应式的
    this.data = _Vue.observable({
      current: '/'
    })
  }

  init () {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  createRouteMap () {
    // 遍历options中的routes，将route以键值对的形式存放在routeMap中
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    })
  }

  initComponents (Vue) {
    const that = this

    // 注册router-link组件
    Vue.component('router-link', {
      props: {
        to: {
          type: String
        }
      },
      render (h) {
        return h('a', {
          attrs: {
            href: this.to
          },
          on: {
            click: this.handleClick
          }
        }, [this.$slots.default])
      },
      methods: {
        handleClick (e) {
          e.preventDefault()
          history.pushState({}, '', this.to)
          this.$router.data.current = this.to
        }
      }
    })
    // 注册router-view组件
    Vue.component('router-view', {
      render (h) {
        const component = that.routeMap[that.data.current]
        return h(component)
      }
    })
  }

  initEvent () {
    window.addEventListener('popstate', () => {
      this.data.current = window.location.pathname
    })
  }
}
