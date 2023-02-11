import { isFunction } from "./util";
import { observe } from "./observe/index";
import Watcher from "./observe/watch";

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (key, handler, options = {}) {
    options.user = true; //是一个用户选择
    new Watcher(this, key, handler, options);
  };
}
export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.props) {
    initProps();
  }
  if (opts.computed) {
    initComputed(vm, opts.computed);
  }
  if (opts.watch) {
    initWacth(vm, opts.watch);
  }
}

function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;
  // console.log(data);
  data = vm._data = isFunction(data) ? data.call(vm) : data;

  //取数据，取的是代理数据
  for (let key in data) {
    proxy(vm, "_data", key);
  }
  //监视数据
  observe(data);
}

function initWacth(vm, watch) {
  for (let key in watch) {
    let handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher() {
  return vm.$watch(key, handler);
}

function initComputed(vm, computed) {
  const watchers = {};
  vm._computedWacthers = watchers;
  for (let key in computed) {
    const userDef = computed[key]; //1.函数只要get 2.对象get和set方法都要
    //依赖的属性变化重新取值
    let getter = typeof userDef == "function" ? userDef : userDef.get;
    // console.log(getter);

    // 每个计算属性本质是watcher
    watchers[key] = new Watcher(vm, getter, () => {}, { lazy: true }); //lazy默认一开始不执行

    // 将key定义在vm上
    defineComputed(vm, key, userDef);
  }
}
function createComputedGetter(key) {
  return function computedGetter() {
    //取计算属性的值 走的是这个函数
    return function computedGetter() {
      //通过key来取到属性的watcher
      let watcher = this._computedWacthers[key];
      //脏就是 要调用用户的getter 不脏就是不要调用getter
      if (watcher.dirty) {
        //根据dirty属性 来判断是否需要重新取值
        watcher.evaluate();
      }
      return watcher.value;
    };
  };
}
function defineComputed(vm, key, userDef) {
  let sharedProperty = {};
  if (typeof userDef == "function") {
    sharedProperty.get = userDef;
  } else {
    sharedProperty.get = createComputedGetter(key);
    sharedProperty.set = userDef.set;
  }
  Object.defineProperty(vm, key, sharedProperty); //computed就是一个defineProperty
}
