export function initGlobalApi(Vue) {
  Vue.options = {}; //存放全局的配置，每个组件初始化的时候都会和options选项进行合并
  //Vue.component
  //Vue.filter
  //Vue.directive
  Vue.mixin = function (options) {
    //自己的options，类上的options
    //{beforeCreate:[fn]} {beforeCreate:fn}=>{beforeCreate:[fn,fn]}
    //
    this.options = mergeOptions(this.options, options);
    //Vue.options.beforeCreate=[fn1n,fn2]
    return this;
  };

  Vue.options._base = Vue;
  Vue.options.components = {};
  Vue.components = function (id, definition) {
    console.log(id, definition);
    //保证组件的隔离，每个组件都会产生一个新的类，去继承父类
    definition = this.options._base.extend(definition);
    console.log(id, definition);
    this.options.components[id] = definition;
  };
  Vue.extend = function (opts) {
    const Super = this;
    const Sub = function VueComponent() {
      this._init();
    };
    //原型继承
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.options = mergeOptions(Super.options, opts);
    return Sub;
  };
}
