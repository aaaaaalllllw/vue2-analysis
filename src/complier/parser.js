// 以下为vue源码的正则
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名；形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //匹配特殊标签;形如 abc:234,前面的abc:可有可无；获取标签名；
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开头；形如  <  ；捕获里面的标签名
const startTagClose = /^\s*(\/?)>/; // 匹配标签结尾，形如 >、/>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配结束标签 如 </abc-123> 捕获里面的标签名
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"

//将解析后的结果，组装成一个树结构
function createAstElement(tagName, attrs) {
  return {
    tag: tagName,
    type: 1,
    children: [],
    parent: null,
    attrs,
  };
}
let root = null;
let stack = [];
function start(tagName, attributes) {
  let parent = stack[stack.length - 1];
  let element = createAstElement(tagName, attributes);
  if (!root) {
    root = element;
  }

  //压入栈
  if (parent) {
    element.parent = parent; //当放入栈中时 父亲是谁
    parent.children.push(element);
  }
  stack.push(element);
}
function end(tagName) {
  let last = stack.pop();
  if (last.tag !== tagName) {
    throw Error("标签有误");
  }
}
function chars(text) {
  // console.log(text);
  //文本入栈
  text = text.replace(/\s/g, ""); //去除文本空格
  let parent = stack[stack.length - 1];
  if (text) {
    parent.children.push({
      type: 3,
      text,
    });
  }
}
export function parserHTML(html) {
  //<div id="app">1123</div>
  //解析多少，抛弃多少
  function advance(len) {
    html = html.substring(len);
  }
  function parseStartTag() {
    //1.标签
    const start = html.match(startTagOpen);
    // console.log(start);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      console.log(html);
      let end;
      //如果美哟遇到标签结束就不停地解析
      let attr;
      // 如果标签没有闭合
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        // [' id="app"', 'id', '=', 'app', undefined, undefined, index: 0, input: ' id="app">{{name}}</div>', groups: undefined]
        //2.属性,添加属性
        console.log(attr);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        });
        console.log(match);
        advance(attr[0].length);
      }
      if (end) {
        advance(end[0].length);
      }
      return match;
    }

    return false; //不是开始标签
  }

  while (html) {
    //看要解析的内容是否存在，如果存在就不停地解析
    let textEnd = html.indexOf("<"); //当前解析的开头
    if (textEnd == 0) {
      const startTagMatch = parseStartTag(html); //解析开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        end(endTagMatch[1]);
        advance(endTagMatch[0].length);
      }
    }

    let text; //1233</div>

    if (textEnd > 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      chars(text); //处理文本
      advance(text.length); //前进
    }
  }
  return root;
}
