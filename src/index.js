import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
import { stateMixin } from "./state";
import { initGlobalApi } from "./global-api/index";
function Vue(options) {
  this._init(options);
}
initMixin(Vue);
//渲染成真实节点_render
renderMixin(Vue);
//注入生命周期_update
lifecycleMixin(Vue);
//注入watch,$wacth
stateMixin(Vue);

//在类上扩展的Vue.mixin
initGlobalApi(Vue);

// import { compileFunction } from "./complier/index";
// //diff  核心
// let oldTemplate = `<div>{{message}}</div>`;
// let vm1 = new Vue({ data: { message: "hello world" } });
// const render1 = compileFunction(oldTemplate);
// const oldVnode = render1.call(vm1);
// console.log(oldVnode);

export default Vue;
