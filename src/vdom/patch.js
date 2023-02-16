export function patch(oldVnode, vnode) {
  if (!oldVnode) {
    return createElm(vnode); //如果没有el元素，那就直接根据虚拟节点返回真实节点
  }
  if (oldVnode.nodeType == 1) {
    // console.log("真实元素");

    const parentElm = oldVnode.parentNode; //找到他的父亲
    const elm = createElm(vnode); //根据虚拟节点 创建元素
    parentElm.insertBefore(elm, oldVnode.nextSibling);
    parentElm.removeChild(vnode);
    return elm;
  } else {
    //如果标签不一样 直接删掉老的换成新的即可
    if (oldVnode.tag != vnode.tag) {
      //可以通过vnode.el属性，获取现在真实的dom属性
      oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
    }

    //如果标签一样比较属性
    vnode.el = oldVnode.el;

    //如果两个虚拟节点都是文本节点，比较文本内容
    if (vnode.tag === undefined) {
      if (oldVnode.text !== vnode.text) {
        el.textContent = vnode.text;
      }
    }
    patchProps(vnode, oldVnode.props);
    //属性可能有删除的情况

    //比较子节点
    //一方有儿子，一方没儿子
    let oldchildren = oldVnode.children || [];
    let newChildren = vnode.children || [];
    if (oldchildren.length > 0 && newChildren.length > 0) {
      //双方都有儿子
      //Vue采用双指针方法
      patchChildren(el, oldchildren, newChildren);
    } else if (newChildren.length > 0) {
      //老的没儿子 但是新的有儿子
      for (let i = 0; i < newChildren.length; i++) {
        let child = createElm(newChildren[i]);
        el.appendChild(child);
      }
    } else if (oldchildren.length > 0) {
      //老的有儿子 新的没儿子
      el.innerHTML = "";
    }

    //双方都有儿子
  }
}

function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag == newVnode.tag && oldVnode.key == newVnode.key;
}

function patchChildren(el, oldChildren, newChildren) {
  //可能从前往后，也有可能从后往前
  let oldStartIndex = 0;
  let oldStartVnode = oldChildren[0];
  let oldEndIndex = oldChildren.length - 1;
  let oldEndVnode = oldChildren[oldEndIndex];
  //一一对比
  //当老的开始指针和老的后面指针重合在一起(老的比对完了)
  //当新的开始指针和新的后面指针重合在一起(新的比对完了)

  let newStartIndex = 0;
  let newStartVnode = newChildren[0];
  let newEndIndex = newChildren.length - 1;
  let newEndVnode = newChildren[newEndIndex];
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    //同时循环新的节点和老的节点，有一方循环完毕就结束
    if (isSameVnode(oldStartVnode, newStartVnode)) {
      //头头比较
      patch(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      //尾尾比较
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      //头尾比较
      patch(oldStartVnode, newEndVnode);

      //老的插在新的后面
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      //尾头比较
      patch(oldEndVnode, newEndVnode);
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    }
  }
  //如果用户追加了一个怎么办
  if (newStartIndex <= newEndIndex) {
    // for (let i = newStartIndex; i <= newEndIndex; i++) {
    //   el.appendChild(createElm(newChildren[i]));
    // }
    //判断是插头还是插尾（看一下尾指针下一个元素是否存在）
    let anchor =
      newChildren[newEndIndex + 1] == null
        ? null
        : newChildren[newEndIndex + 1].el;
    //   el.appendChild(createElm(newChildren[i]));
    el.insertBefore(createElm(), anchor);
  }

  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      el.removeChild(oldChildren[i].el);
    }
  }
}

//比较节点attribute
function patchProps(vnode, oldProps = {}) {
  let newProps = vnode.data || {};
  let el = vnode.el;
  //如果两个虚拟节点是文本节点  比较文本内容
  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      //新的里面不存在这个样式
      el.style[key] = "";
    }
  }
  //如果老的属性有，新的没有直接删除
  for (let key in oldProps) {
    if (!newProps(key)) {
      el.removeAttribute(key);
    }
  }
  for (let key in newProps) {
    if (key === "style") {
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
}

function createComponent(vnode) {
  let i = vnode.data; //vnode.data.hook.init
  if ((i = i.hook) && (i = i.init)) {
    i(vnode);
  }
  if (vnode.componentInstance) {
    //有属性说明子组件new完毕了，并且组件对应的真实DOM挂载到
    return true;
  }
}

function createElm(vnode) {
  let { tag, data, children, text, vm } = vnode;
  if (typeof tag === "string") {
    //元素
    if (createComponent(vnode)) {
      return vnode.componentInstance.$el;
    }
    vnode.el = document.createElement(tag); //虚拟节点会有一个el属性 对应真实节点
    patchProps(vnode);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    //文本
    vnode.el = document.createTextNode(tag);
  }
  return vnode.el;
}
