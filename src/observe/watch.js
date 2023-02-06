import { popTarget, pushTarget } from "./dep";
let id = 0;
class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.options = options;
    this.id = id++;
    this.deps = [];
    this.depsId = new Set();

    //默认应该让exporOrFn执行render(){_c('div),{},_v(hello)}
    this.getter = exprOrFn;

    this.get(); //更新初始化 要取值
  }
  get() {
    //稍后用户更新时 可以重新调用getter方法
    pushTarget(this);
    this.getter();
    popTarget();
  }
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.depsId.add(id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }
  update() {
    this.get();
  }
}
export default Watcher;
