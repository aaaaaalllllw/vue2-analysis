(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('stream/consumers')) :
  typeof define === 'function' && define.amd ? define(['stream/consumers'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory(global.consumers));
})(this, (function (consumers) { 'use strict';

  // 以下为vue源码的正则
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; //匹配标签名；形如 abc-123
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //匹配特殊标签;形如 abc:234,前面的abc:可有可无；获取标签名；
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配标签开头；形如  <  ；捕获里面的标签名
  var startTagClose = /^\s*(\/?)>/; // 匹配标签结尾，形如 >、/>
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配结束标签 如 </abc-123> 捕获里面的标签名
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"

  //将解析后的结果，组装成一个树结构
  function createAstElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1,
      children: [],
      parent: null,
      attrs: attrs
    };
  }
  var root = null;
  var stack = [];
  function start(tagName, attributes) {
    var parent = stack[stack.length - 1];
    var element = createAstElement(tagName, attributes);
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
    var last = stack.pop();
    if (last.tag !== tagName) {
      throw Error("标签有误");
    }
  }
  function chars(text) {
    // console.log(text);
    //文本入栈
    text = text.replace(/\s/g, ""); //去除文本空格
    var parent = stack[stack.length - 1];
    if (text) {
      parent.children.push({
        type: 3,
        text: text
      });
    }
  }
  function parserHTML(html) {
    //<div id="app">1123</div>
    //解析多少，抛弃多少
    function advance(len) {
      html = html.substring(len);
    }
    function parseStartTag() {
      //1.标签
      var start = html.match(startTagOpen);
      // console.log(start);
      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);
        console.log(html);
        var _end;
        //如果美哟遇到标签结束就不停地解析
        var attr;
        // 如果标签没有闭合
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // [' id="app"', 'id', '=', 'app', undefined, undefined, index: 0, input: ' id="app">{{name}}</div>', groups: undefined]
          //2.属性,添加属性
          console.log(attr);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          console.log(match);
          advance(attr[0].length);
        }
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      }
      return false; //不是开始标签
    }

    while (html) {
      //看要解析的内容是否存在，如果存在就不停地解析
      var textEnd = html.indexOf("<"); //当前解析的开头
      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); //解析开始标签
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
        }
      }
      var text = void 0; //1233</div>

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

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配花括号 {{  }}；捕获花括号里面的内容
  function genProps(attrs) {
    var str = "";
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === "style") {
        var styleObj = {};
        attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
          console.log(arguments[1], arguments[2]);
          styleObj[arguments[1]] = arguments[2];
        });
        attr.value = styleObj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    //a:1, b:2,最好要将多余的逗号删除
    return "(".concat(str.slice(0, -1), ")");
  }
  function gen(el) {
    if (el.type == 1) {
      //如果是节点
      return generate(el);
    } else {
      //如果是文本
      var text = el.text;
      // return `_v('${text}')`;
      if (!defaultTagRE.test(text)) {
        //如果没匹配到{{}}
        return "_v('".concat(text, "')");
      } else {
        //'hello'+arr+'world' //hello {{arr}} world
        var tokens = [];
        var match;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          //看有没有匹配到
          var index = match.index; //开始索引
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex))); //把最后的扔进去
        }

        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }
  function genChildren(el) {
    var children = el.children;
    if (children) {
      return children.map(function (c) {
        return gen(c);
      }).join(",");
    }
  }
  function generate(el) {
    // _c('div',{id:'app',a:1},'hello')
    console.log("----------------");
    var children = genChildren(el);
    //遍历树  将树拼接成字符串
    var code = "_c('".concat(el.tag, "',").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : "undefined").concat(children ? ",".concat(children) : "", ")");
    console.log(code);
    return code;
  }

  //html字符串解析成 对应的脚本来触发
  function compileFunction(template) {
    var root = parserHTML(template);
    console.log(root);
    //html=>ast(只能描述语法 语法不存在的属性无法描述)=>render函数=>虚拟dom(增加额外属性)=>生成真实dom

    //生成代码
    var code = generate(root);

    //生成函数
    var render = new Function("with(this){return ".concat(code, "}")); //code中会用的数据在vm上
    // let render = new Function();

    console.log(render.toString());
    return render;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  function isFunction(val) {
    return typeof val === "function";
  }
  function isObject(val) {
    return _typeof(val) !== "object" && val !== null;
  }

  var oldArrayPrototype = Array.prototype;
  var arrayMethods = Object.create(oldArrayPrototype);
  //arrayMethods.__proto__=Array.prototype 继承

  var methods = ["push", "shift", "unshift", "pop", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      var _oldArrayPrototype$me;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      //用户调用的如果是以上七个方法 会用我自己重写的，否则用原来的数组方法
      //args是参数列表
      //args是参数列表，arr.push(1,2,3)
      var result = (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args));
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
        // 就是新增的内容
        case "splice":
          inserted = args.slice(2);
      }

      //如果有新增的内容要进行继续劫持，我需要观测数组的每一项，而不是数组
      //更新操作...todo...
      if (inserted) ob.observeArray(inserted);
      return result;
    };
  });

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    //每个属性都分配一个dep，dep可以存放watcher，watcher存放这个dep
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++;
      this.subs = [];
    }
    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        //把dep也给watch，自己把自己存进去了
        if (Dep.target) {
          //watcher存放dep
          Dep.target.addDep(this);
        }
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);
    return Dep;
  }();
  Dep.target = null;
  function pushTarget(watcher) {
    Dep.target = watcher;
  }
  function popTarget() {
    Dep.target = null;
  }

  //1.如果数据是对象，会将对象不停的递归，进行劫持
  //2.如果是数组，会劫持数组的方法，并对数组中不是基本数据类型进行检测
  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      //对对象中的所有属性 进行劫持
      Object.defineProperty(data, "__ob__", {
        value: this,
        //  设为不可枚举，防止在forEach对每一项响应式的时候监控__ob__，造成死循环
        enumerable: false //不可枚举
      });
      // data.__ob__ = this;
      if (Array.isArray(data)) {
        // 数组劫持的逻辑
        // 对数组原来的方法进行改写，切片编程 高级函数
        data.__proto__ = arrayMethods;
        //如果数组中的数据是对象类型，需要监控对象的变化
        this.observeArray(data);
      } else {
        //对对象中的所有属性进行劫持
        this.walk(data);
      }
    }
    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          observe(item);
        });
      }
    }, {
      key: "walk",
      value: function walk(data) {
        //对象
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);
    return Observer;
  }(); //vue2
  function defineReactive(data, key, value) {
    //value有可能是对象
    observe(value); //本身用户默认值是对象，对象套对象 需要递归处理(性能差)
    var dep = new Dep(); //每个属性都有个dep属性
    Object.defineProperty(data, key, {
      get: function get() {
        //如何把dep和watcher联系起来
        console.log("get");
        if (Dep.target) {
          //依赖收集
          dep.depend();
        }
        return value;
      },
      set: function set(newV) {
        console.log("set");
        if (newV !== value) {
          observe(newV); //如果用户赋值是一个新对象，需要将这个对象进行劫持
          value = newV;
          dep.notify(); //告诉当前属性存放的watcher要更新了
        }
      }
    });
  }

  function observe(data) {
    //如果是对象才观察
    if (!isObject(data)) {
      return;
    }
    if (data.__ob__) {
      //已经被观测不需要再观测
      return;
    }
    //默认最外层的data必须是一个对象
    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
    if (opts.props) {
      initProps();
    }
    if (opts.computed) {
      initComputed();
    }
    if (opts.watch) ;
  }
  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;
    // console.log(data);
    data = vm._data = isFunction(data) ? data.call(vm) : data;

    //取数据，取的是代理数据
    for (var key in data) {
      proxy(vm, "_data", key);
    }
    //监视数据
    observe(data);
  }

  var id = 0;
  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);
      this.vm = vm;
      this.exprOrFn = exprOrFn;
      this.cb = cb;
      this.options = options;
      this.id = id++;
      this.deps = [];
      this.depsId = new Set();

      //默认应该让exporOrFn执行render(){_c('div),{},_v(hello)}
      this.getter = exprOrFn;
      this.get(); //更新初始化 要取值
    }
    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        //稍后用户更新时 可以重新调用getter方法
        pushTarget(this);
        this.getter();
        popTarget();
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.depsId.add(id);
          this.deps.push(dep);
          dep.addSub(this);
        }
      }
    }, {
      key: "update",
      value: function update() {
        this.get();
      }
    }]);
    return Watcher;
  }();

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      //既有初始化，又更新
      var vm = this;
      vm.$el = patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    console.log(vm, el);

    //更新函数 数据变化后 会再次调用此函数
    var updateComponent = function updateComponent() {
      //调用render函数，生成虚拟dom
      vm._update(vm._render()); //后续更新可以调用updateComponent方法
    };
    //观察者模式，属性是"被观察者" 刷新页面:"观察者"
    // updateComponent();
    new Watcher(vm, updateComponent, function () {
      console.log("更新视图");
    }, true);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      //el,data
      var vm = this;
      vm.$options = options;
      console.log(vm);

      //对数据做初始化 watch computed props data
      initState(vm);
      if (vm.$options.el) {
        //将数据挂载到模板上
        console.log(vm.$options);
        vm.$mount(vm.$options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      el = document.querySelector(el);
      var vm = this;
      vm.$el = el;
      var options = vm.$options;
      //把模板转化成对应的渲染函数=》虚拟dom概念：vnode=》diff算法 更新虚拟dom=》产生真实节点，更新
      if (!options.render) {
        //没有render用template，目前没render
        var template = options.template;
        if (!template && el) {
          //用户也没有传递template 就取el的内容作为template
          template = el.outerHTML;
          console.log(template);
          //把模板变成渲染函数，render返回h
          var render = compileFunction(template);
          options.render = render;
        }
      }
      //options.render就是渲染函数
      console.log(options.render); //调用render方法 渲染成真实dom 替换页面的内容
      mountComponent(vm, el); //组件的挂载流程
    };
  }

  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    console.log(vm, tag, data, children);
    return vnode(vm, tag, data, data.key, children, undefined);
  }
  function createTextElement() {
    return vnode(vm, undefined, undefined, undefined, undefined, consumers.text);
  }
  function vnode(vm, tag, data, key, children, text) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      //createElement
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._v = function (text) {
      //createTextElement
      return createTextElement();
    };
    Vue.prototype._s = function (val) {
      //stringify
      if (_typeof(val) == "object") return JSON.stringify(val);
    };
    Vue.prototype._render = function () {
      console.log("render");
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm);
      return vnode;
    };
  }

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue);
  //渲染成真实节点_render
  renderMixin(Vue);
  //注入生命周期_update
  lifecycleMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
