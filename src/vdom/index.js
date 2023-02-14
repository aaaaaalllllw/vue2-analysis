import { text } from "stream/consumers";
import { isObject, isReservedTag } from "../util";

export function createElement(vm, tag, data = {}, ...children) {
  // console.log(vm, tag, data, children);
  // return vnode(vm, tag, data, data.key, children, undefined);
  if (isReservedTag(tag)) {
    return vnode(vm, tag, data, data.key, children, undefined);
  } else {
    const Ctor = vm.$options.components[tag];
    return createComponent(vm, tag, data, data.key, children, Ctor);
  }
}

//创建组件的虚拟节点
function createComponent(vm, tag, key, children, Ctor) {
  //组件构造函数
  if (isObject(Ctor)) {
    Ctor = vm.$options._base.extend(Ctor);
  }
  data.hook = {
    //等会渲染组件时，需要调用此初始方法
    init(vnode) {
      let vm = (vnode.componentInstance = new Ctor({ _isComponent: true })); //
      vm.$mount();
    },
  };
  return vnode(`vue-component-${tag}`, data, key, undefined, {
    Ctor,
    children,
  });
}
export function createTextElement() {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

function vnode(vm, tag, data, key, children, text, componentOptions) {
  return {
    vm,
    tag,
    data,
    key,
    children,
    text,
    componentOptions,
  };
}
