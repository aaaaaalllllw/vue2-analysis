import { isObject } from "../util";
import { arrayMethods } from "./array";
import { Dep } from "./dep";
//1.如果数据是对象，会将对象不停的递归，进行劫持
//2.如果是数组，会劫持数组的方法，并对数组中不是基本数据类型进行检测
class Observer {
  constructor(data) {
    this.dep = new Dep(); //数据可能是数组或者对象
    //对对象中的所有属性 进行劫持
    Object.defineProperty(data, "__ob__", {
      value: this,
      //  设为不可枚举，防止在forEach对每一项响应式的时候监控__ob__，造成死循环
      enumerable: false, //不可枚举
    });
    // data.__ob__ = this;
    if (Array.isArray(data)) {
      // 数组劫持的逻辑
      // 对数组原来的方法进行改写，切片编程 高级函数
      data.__proto__ = arrayMethods;
      //如果数组中的数据是对象类型，需要监控对象的变化
      this.observeArray(data);
    } else {
      //对对象中的所有属性进行劫持
      this.walk(data);
    }
  }
  observeArray(data) {
    data.forEach((item) => {
      observe(item);
    });
  }
  walk(data) {
    //对象
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}

//对数组每一项进dep
function deependArray(value) {
  for (let i = 0; i < value.length; i++) {
    let current = value[i]; //current是数组里面的数组[[[]]]
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      deependArray(current);
    }
  }
}
//vue2
function defineReactive(data, key, value) {
  //value有可能是对象
  let childOb = observe(value); //本身用户默认值是对象，对象套对象 需要递归处理(性能差)
  let dep = new Dep(); //每个属性都有个dep属性
  Object.defineProperty(data, key, {
    get() {
      //如何把dep和watcher联系起来
      console.log("get");
      if (Dep.target) {
        //依赖收集
        dep.depend();
        if (childOb) {
          childOb.dep.depend(); //让数组和对象也记录wacther
          if (Array.isArray(value)) {
            deependArray(value);
          }
        }
      }
      return value;
    },
    set(newV) {
      console.log("set");
      if (newV !== value) {
        observe(newV); //如果用户赋值是一个新对象，需要将这个对象进行劫持
        value = newV;
        dep.notify(); //告诉当前属性存放的watcher要更新了
      }
    },
  });
}
export function observe(data) {
  //如果是对象才观察
  if (!isObject(data)) {
    return;
  }
  if (data.__ob__) {
    //已经被观测不需要再观测
    return data.__ob__;
  }
  //默认最外层的data必须是一个对象
  return new Observer(data);
}

// Vue中嵌套层次不能太深，否则会有大量递归
// Vue中对象通过defineProperty实现的响应式，拦截了get和set。如果不存在的属性不会拦截
//也不会响应。可以使用$set=让对象自己去notify，或者赋予一个新对象
// Vue中数组改索引和长度是不会更新的，通过变异方法可以更新视图 7个方法，数组如果是对象类型，修改对象也可以更新视图
