import { queueWacther } from "./scheduler";
import { popTarget, pushTarget } from "./dep";
let id = 0;
class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.user = !!options.user;
    this.lazy = options.lazy;
    this.dirty = this.lazy;
    this.cb = cb;
    this.options = options;
    this.id = id++;
    this.deps = [];
    this.depsId = new Set();
    if (typeof exprOrFn == "string") {
      this.getter = function () {
        //
        let path = exprOrFn.split(".");
        let obj = vm;
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]];
        }
        return obj;
      };
    } else {
      //默认应该让exporOrFn执行render(){_c('div),{},_v(hello)}
      this.getter = exprOrFn;
    }

    this.value = this.lazy ? undefined : this.get(); //更新初始化 要取值
  }
  get() {
    //稍后用户更新时 可以重新调用getter方法
    pushTarget(this);
    const value = this.getter().call(this.vm);
    popTarget();
    return value;
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
    if (this.lazy) {
      this.dirty = true;
    } else {
      //vue中更新操作时异步的
      //vue每次更新时 this
      // this.get();
      queueWacther(this);
    }
  }
  run() {
    let newValue = this.get();
    let oldValue = this.value;
    this.value = newValue;
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
  evaluate() {
    this.dirty = false; //false表示取过值
    this.value = this.get();
  }
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend(); //lastName,firstName收集渲染wacther
    }
  }
}

//watcher 和dep
//我们将更新的功能封装成一个watcher
//渲染页面的时候，会将当前wacther放到Dep类上
//在vue的页面渲染使用的属性，需要进行依赖收集，收集对象的渲染的wacther
//取值的时候，给每个属性都加个dep属性，用于存储这个渲染wacther(同一个watcher对应多个dep)
//每个属性可能对应多个视图(多个视图肯定是watcher) 一个属性对应多个watcher
//dep.denpend()=>通知dep存放watcher=》Dep.target.addDep()=>通知wacther存取dep
export default Watcher;
