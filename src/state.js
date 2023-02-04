import { isFunction } from "./util";
import { observe } from "./observe/index";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.props) {
    initProps();
  }
  if (opts.computed) {
    initComputed();
  }
  if (opts.watch) {
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
