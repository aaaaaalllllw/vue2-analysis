import { parserHTML } from "./parser";
import { generate } from "./generate";
//html字符串解析成 对应的脚本来触发
export function compileFunction(template) {
  let root = parserHTML(template);
  console.log(root);
  //html=>ast(只能描述语法 语法不存在的属性无法描述)=>render函数=>虚拟dom(增加额外属性)=>生成真实dom
  let code = generate(root);
  console.log(code);
}
