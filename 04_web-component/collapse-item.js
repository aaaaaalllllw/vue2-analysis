class CollapseItem extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: "open" });
    let tmpl = document.getElementById("collapse_item_tmpl");

    let cloneTemplate = tmpl.content.cloneNode(true);
    let style = document.createElement("style");

    style.textContent = `
        :host{
            width:100%;
        }
        .title{
            background:#f1f1f1;
            line-height:35px;
            height:35px;
        }
        .content{
            font-size:14px;
        }
    `;
    shadow.appendChild(style);
    shadow.appendChild(cloneTemplate);
  }
}

export default CollapseItem;
