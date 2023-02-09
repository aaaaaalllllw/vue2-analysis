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
