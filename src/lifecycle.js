import { nextTick } from "./util";
import Watcher from "./observe/watch";
import { patch } from "./vdom/patch";
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    //既有初始化，又更新
    const vm = this;
    const preVnode = vm._vnode; //表示当前的虚拟节点保存起来
    if (!preVnode) {
      vm.$el = patch(vm.$el, vnode);
      vm._vnode = vnode;
    } else {
      patch(preVnode, vnode);
    }
    vm.$el = patch(vm.$el, vnode);
  };
  Vue.prototype.$nextTick = nextTick;
}
export function mountComponent(vm, el) {
  console.log(vm, el);

  //更新函数 数据变化后 会再次调用此函数
  let updateComponent = () => {
    //调用render函数，生成虚拟dom
    vm._update(vm._render()); //后续更新可以调用updateComponent方法
  };
  //观察者模式，属性是"被观察者" 刷新页面:"观察者"
  // updateComponent();
  callHook(vm, "beforeMount");
  new Watcher(
    vm,
    updateComponent,
    () => {
      console.log("更新视图");
    },
    true
  );
  callHook(vm, "mounted");
}

export function callHook(vm, hook) {
  let handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm);
    }
  }
}
