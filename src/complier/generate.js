const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配花括号 {{  }}；捕获花括号里面的内容
function genProps(attrs) {
  let str = ``;
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === "style") {
      let styleObj = {};
      attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
        console.log(arguments[1], arguments[2]);
        styleObj[arguments[1]] = arguments[2];
      });
      attr.value = styleObj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  //a:1, b:2,最好要将多余的逗号删除
  return `(${str.slice(0, -1)})`;
}
function gen(el) {
  if (el.type == 1) {
    //如果是节点
    return generate(c);
  } else {
    //如果是文本
    let text = el.text;
    // return `_v('${text}')`;
    if (!defaultTagRE.test(text)) {
      //如果没匹配到{{}}
      return `_v('${text}')`;
    } else {
      //'hello'+arr+'world' //hello {{arr}} world
      let tokens = [];
      let match;
      let lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        //看有没有匹配到
        let index = match.index; //开始索引
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(match[1].trim());
        let lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex))); //把最后的扔进去
      }
      return `_v(${tokens.join("+")})`;
    }
  }
}
function genChildren(el) {
  let children = el.children;
  if (children) {
    return children.map((c) => gen(c)).join(",");
  }
}
export function generate(el) {
  // _c('div',{id:'app',a:1},'hello')
  console.log("----------------");
  let children = genChildren(el);
  //遍历树  将树拼接成字符串
  let code = `_c('${el.tag}'),${
    el.attrs.length ? genProps(el.attrs) : "undefined"
  })${children ? `,${children}` : ""}`;

  return code;
}
