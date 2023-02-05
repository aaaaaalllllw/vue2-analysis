import { parserHTML } from "./parser";
import { generate } from "./generate";
//html字符串解析成 对应的脚本来触发
export function compileFunction(template) {
  let root = parserHTML(template);
  console.log(root);
  //html=>ast(只能描述语法 语法不存在的属性无法描述)=>render函数=>虚拟dom(增加额外属性)=>生成真实dom

  //生成代码
  let code = generate(root);

  //生成函数
  let render = new Function(`with(this){return ${code}}`); //code中会用的数据在vm上
  // let render = new Function();

  console.log(render.toString());
  return render;
}
