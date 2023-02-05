import { parserHTML } from "./parser";
//html字符串解析成 对应的脚本来触发
export function compileFunction(template) {
  let root = parserHTML(template);
  console.log(root);
}
