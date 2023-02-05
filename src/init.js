import { compileFunction } from "./complier/index";
import { initState } from "./state";
import { mountComponent } from "./lifecycle";
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    //el,data
    let vm = this;
    vm.$options = options;
    console.log(vm);

    //对数据做初始化 watch computed props data
    initState(vm);

    if (vm.$options.el) {
      //将数据挂载到模板上
      vm.$mount(vm.$options.el);
    }
  };

  Vue.prototype.$mount = function (el) {
    el = document.querySelector(el);
    const vm = this;
    const options = vm.$options;
    //把模板转化成对应的渲染函数=》虚拟dom概念：vnode=》diff算法 更新虚拟dom=》产生真实节点，更新
    if (!options.render) {
      //没有render用template，目前没render
      let template = options.template;
      if (!template && el) {
        //用户也没有传递template 就取el的内容作为template
        template = el.outerHTML;
        console.log(template);
        //把模板变成渲染函数，render返回h
        let render = compileFunction(template);
        options.render = render;
      }
    }
    //options.render就是渲染函数
    console.log(options.render); //调用render方法 渲染成真实dom 替换页面的内容
    mountComponent(vm, el); //组件的挂载流程
  };
}
