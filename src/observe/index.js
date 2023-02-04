import { isObject } from "../util";
import { arrayMethods } from "./array";

//1.如果数据是对象，会将对象不停的递归，进行劫持
//2.如果是数组，会劫持数组的方法，并对数组中不是基本数据类型进行检测
class Observer {
  constructor(data) {
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
//vue2
function defineReactive(data, key, value) {
  //value有可能是对象
  observe(value); //本身用户默认值是对象，对象套对象 需要递归处理(性能差)
  Object.defineProperty(data, key, {
    get() {
      console.log("get");
      return value;
    },
    set(newV) {
      console.log("set");
      observe(newV); //如果用户赋值是一个新对象，需要将这个对象进行劫持
      value = newV;
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
    return;
  }
  //默认最外层的data必须是一个对象
  return new Observer(data);
}
