import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
function Vue(options) {
  this._init(options);
}
initMixin(Vue);
//渲染成真实节点_render
renderMixin(Vue);
//注入生命周期_update
lifecycleMixin(Vue);

export default Vue;
