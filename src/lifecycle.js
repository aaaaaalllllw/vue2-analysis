import Watcher from "./observe/watch";
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    //既有初始化，又更新
    const vm = this;
    vm.$el = patch(vm.$el, vnode);
  };
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
  new Watcher(
    vm,
    updateComponent,
    () => {
      console.log("更新视图");
    },
    true
  );
}
