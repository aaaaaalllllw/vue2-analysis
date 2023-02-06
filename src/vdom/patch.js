export function patch(oldVnode, vnode) {
  if (oldVnode.nodeType == 1) {
    // console.log("真实元素");

    const parentElm = oldVnode.parentNode; //找到他的父亲
    const elm = createElm(vnode); //根据虚拟节点 创建元素
    parentElm.insertBefore(elm, oldVnode.nextSibling);
    parentElm.removeChild(vnode);
    return elm;
  }
}

function createElm(vnode) {
  let { tag, data, children, text, vm } = vnode;
  if (typeof tag === "string") {
    //元素
    vnode.el = document.createElement(tag); //虚拟节点会有一个el属性 对应真实节点
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    //文本
    vnode.el = document.createTextNode(tag);
  }
  return vnode.el;
}
