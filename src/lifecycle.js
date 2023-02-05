export function lifecycleMixin(Vue) {
  Vue.prototype._update = function () {};
}
export function mountComponent(vm, el) {
  console.log(vm, el);

  //更新函数 数据变化后 会再次调用此函数
  let updateComponent = () => {
    //调用render函数，生成虚拟dom
    vm._update(vm._render()); //后续更新可以调用updateComponent方法
  };
  updateComponent();
}
