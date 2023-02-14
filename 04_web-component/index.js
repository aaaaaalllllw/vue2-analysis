import Collapse from "./collapse.js";
import CollapseItem from "./collapse-item.js";

window.customElements.define("zf-collapse", Collapse);
window.customElements.define("zf-collapse-item", CollapseItem);

//设置组件默认显示的状态
let defaultActive = ["1", "2"]; //name:1 name2:2 默认展开 3 应该隐藏

//组件设置属性
document
  .querySelector("zf-collapse")
  .setAttribute("active", JSON.stringify(defaultActive));

//每个item需要获取到defaultActive 和自己的name属性比较，如果在里面就显示，不在里面就隐藏
