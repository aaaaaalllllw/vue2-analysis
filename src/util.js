import { start } from "repl";

export function isFunction(val) {
  return typeof val === "function";
}

export function isObject(val) {
  return typeof val !== "object" && val !== null;
}
const callback = [];
function flushCallbacks() {
  callback.forEach((item) => item());
  waiting = false;
}
function timer(flushCallbacks) {
  let timerFn = () => {};

  if (Promise) {
    timerFn = () => {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    let textNode = document.createTextNode(1);
    let observe = new MutationObserver(flushCallbacks);
    observe.observe(textNode, {
      characterData: true,
    });
    timerFn = () => {
      textNode.textContent = 3;
    };
  } else if (setImmediate) {
    timerFn = () => {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFn = () => {
      setTimeout(flushCallbacks);
    };
  }
  timerFn();
  waiting = false;
}

let waiting = false; //刚开始非等待
export function nextTick(cb) {
  callback.push(cb);
  if (!waiting) {
    timer(flushCallbacks);
    waiting = true;
  }
}
let lifecycleHooks = [
  "beforeCreated",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];

let strats = {}; //存放各种策略

function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal);
    } else {
      return [childVal];
    }
  } else {
    return parentVal;
  }
}
lifecycleHooks.forEach((hook) => {
  strats[hook] = mergeHook;
});

strats.components = function (parentVal, childVal) {
  let options = Object.create(parentVal); //根据父对象构建一个新对象 options.__proto__
};

//{a:1,b:2} {b:2}
export function mergeOptions(parent, child) {
  const options = {}; //合并后的结果
  for (let key in parent) {
    mergeField(key);
  }
  for (let key in child) {
    if (parent.hasOwnProperty(key)) {
      return;
    }
    mergeField(key);
  }

  function mergeField(key) {
    let parentVal = parent[key];
    let childVal = child[key];
    if (strats[key]) {
      options[key] = strats[key](parentVal, childVal);
    } else {
      //父子都有这key合并
      if (isObject(parentVal) && isObject(childVal)) {
        options[key] = { ...parentVal, ...childVal };
      } else {
        //以儿子为准
        options[key] = child[key] || parent[key];
      }
    }
  }
  return options;
}

console.log(mergeOptions({ a: 1, data: { a: 1 } }, { data: { b: 2 } }));

//判断是否原生标签
export function isReservedTag(str) {
  let reservedTag = "a,div,span,p,img,button,ul,li";
  //源码根据":"生成映射表{a:true,div:true,p:true}
  return reservedTag.includes(str);
}
