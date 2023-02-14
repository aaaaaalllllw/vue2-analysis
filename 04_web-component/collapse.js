class Collapse extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    const tmpl = document.getElementById("collapse_tmpl");
    let clonetmpl = tmpl.content.cloneNode(true);
    let style = document.createElement("style");
    // :host代表是影子的根元素
    style.textContent = `
     .zf-collapse{
        color:red
     }
    :host{
        display:flex;
        border:1px solid #ebebeb;
        width:100%;
    }
    `;
    shadow.appendChild(style);
    shadow.appendChild(clonetmpl);

    let slot = shadow.querySelector("slot");
    //监听事件
    slot.addEventListener("slotchange", (e) => {
      this.slotList = e.target.assignedElements();
      console.log(this.slotList);
      this.render();
    });
  }
  static get observedAttributes() {
    //监控属性的变化
    return ["active"];
  }
  attributeChangedCallback(key, oldVal, newVal) {
    // console.log("属性变化时执行");
    if (key == "active") {
      this.activeList = JSON.parse(newVal);
      this.render();
    }
  }
  render() {
    if (this.slotList && this.activeList) {
      // console.log(this.slotList, this.activeList);
      [...this.slotList].forEach((child) => {
        child.setAttribute("active", JSON.stringify(this.activeList));
      });
    }
  }
  connectedCallback() {
    console.log("插入到dom时执行的回调函数");
  }
  // disconnectCallback() {
  //   console.log("移除到dom时执行的回调");
  // }
  // adoptedCallback() {
  //   console.log("将组件移动到iframe 会执行");
  // }
  //update
}

export default Collapse;
