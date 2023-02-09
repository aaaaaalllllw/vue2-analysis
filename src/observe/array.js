let oldArrayPrototype = Array.prototype;
export let arrayMethods = Object.create(oldArrayPrototype);
//arrayMethods.__proto__=Array.prototype 继承

let methods = ["push", "shift", "unshift", "pop", "reverse", "sort", "splice"];

methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    //用户调用的如果是以上七个方法 会用我自己重写的，否则用原来的数组方法
    //args是参数列表
    //args是参数列表，arr.push(1,2,3)
    const result = oldArrayPrototype[method].call(this, ...args);
    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args; // 就是新增的内容
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }

    //如果有新增的内容要进行继续劫持，我需要观测数组的每一项，而不是数组
    //更新操作...todo...
    if (inserted) ob.observeArray(inserted);

    //数组的observe.dep属性
    ob.dep.notify();
  };
});
