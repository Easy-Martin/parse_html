const y = ["img", "br", "input", "meta", "link", "hr", "area", "base", "col", "embed", "param", "source", "track", "wbr"];
function S(o) {
  return o.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`);
}
function w(o) {
  return o.replace(/-([a-z])/g, (t, e) => e.toUpperCase());
}
function E(o, t, e) {
  const n = `</${t}>`;
  let s = 1, r = e;
  for (; r < o.length && s > 0; ) {
    const a = o.indexOf(`<${t}`, r), i = o.indexOf(n, r);
    if (i === -1) break;
    if (a !== -1 && a < i)
      s++, r = a + `<${t}`.length;
    else {
      if (s--, s === 0) return i;
      r = i + n.length;
    }
  }
  return -1;
}
function O(o) {
  const t = {};
  if (!o) return t;
  const e = /([a-zA-Z0-9-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let n;
  for (; (n = e.exec(o)) !== null; ) {
    const [, s, r, a, i] = n, h = r || a || i || "";
    t[s] = h;
  }
  if (t.style) {
    const s = {}, r = /([a-zA-Z0-9-]+)\s*:\s*([^;]+)/g;
    let a;
    for (; (a = r.exec(t.style)) !== null; ) {
      const [, i, h] = a;
      s[w(i.trim())] = h.trim();
    }
    t.styleObj = s, delete t.style;
  }
  return t;
}
function f(o) {
  if (!o) return null;
  if (!o.startsWith("<"))
    return {
      tagName: "#text",
      textContent: o,
      attributes: {},
      // 符合IAttributeData类型
      styles: {},
      children: [],
      parent: null
    };
  const t = /<([a-zA-Z0-9]+)\s*(.*?)\/?>/, e = o.match(t);
  if (e) {
    const [, u, l] = e;
    if (y.includes(u.toLowerCase())) {
      const m = O(l);
      return {
        tagName: u.toLowerCase(),
        attributes: m,
        // 类型匹配
        styles: m.styleObj || {},
        // styleObj是Record<string, string>，符合styles类型
        textContent: "",
        children: [],
        parent: null
      };
    }
  }
  const n = /<([a-zA-Z0-9]+)\s*(.*?)>/, s = o.match(n);
  if (!s) return null;
  const [r, a, i] = s, h = a.toLowerCase(), c = E(o, h, r.length), N = c !== -1 ? o.slice(r.length, c) : o.slice(r.length), C = O(i), p = {
    tagName: h,
    attributes: C,
    // 类型匹配
    styles: C.styleObj || {},
    // 类型匹配
    textContent: "",
    children: [],
    parent: null
  };
  if (N) {
    const u = [];
    let l = N;
    for (; l; ) {
      const m = l.indexOf("<");
      if (m === -1) {
        const g = f(l);
        g && u.push(g), l = "";
      } else if (m > 0) {
        const g = f(l.slice(0, m));
        g && u.push(g), l = l.slice(m);
      } else {
        const g = l.match(n);
        if (!g) {
          const d = f(l);
          d && u.push(d), l = "";
          continue;
        }
        const b = g[1].toLowerCase();
        if (y.includes(b)) {
          const d = f(l.slice(0, g[0].length));
          d && u.push(d), l = l.slice(g[0].length);
          continue;
        }
        const T = E(l, b, g[0].length), L = b.length + 3;
        if (T !== -1) {
          const d = l.slice(0, T + L), j = f(d);
          j && u.push(j), l = l.slice(T + L);
        } else {
          const d = f(l);
          d && u.push(d), l = "";
        }
      }
    }
    p.children = u.filter(Boolean), p.children.length === 1 && p.children[0].tagName === "#text" && (p.textContent = p.children[0].textContent, p.children = []);
  }
  return p;
}
function A(o) {
  if (!o) return [];
  const t = [];
  let e = o;
  for (; e; ) {
    const n = e.indexOf("<");
    if (n === -1) {
      const s = f(e);
      s && t.push(s), e = "";
    } else if (n > 0) {
      const s = f(e.slice(0, n));
      s && t.push(s), e = e.slice(n);
    } else {
      const s = /<([a-zA-Z0-9]+)\s*(.*?)>/, r = e.match(s);
      if (!r) {
        const i = f(e);
        i && t.push(i), e = "";
        continue;
      }
      const a = r[1].toLowerCase();
      if (y.includes(a)) {
        const i = /<([a-zA-Z0-9]+)\s*(.*?)\/?>/, h = e.match(i);
        if (h) {
          const c = f(h[0]);
          c && t.push(c), e = e.slice(h[0].length);
        } else {
          const c = f(e);
          c && t.push(c), e = "";
        }
      } else {
        const i = E(e, a, r[0].length), h = a.length + 3;
        if (i !== -1) {
          const c = e.slice(0, i + h), N = f(c);
          N && t.push(N), e = e.slice(i + h);
        } else {
          const c = f(e);
          c && t.push(c), e = "";
        }
      }
    }
  }
  return t.filter(Boolean);
}
class x {
  constructor(t) {
    if (typeof t != "string")
      throw new Error("初始化Node必须传入HTML字符串");
    if (!t)
      throw new Error("无法解析空的HTML字符串");
    const e = A(t);
    if (this.tagName = "", this.attributes = {}, this.styles = {}, this.textContent = "", this.children = [], this.parent = null, e.length === 1) {
      const n = e[0];
      this.tagName = n.tagName, this.attributes = { ...n.attributes }, this.styles = { ...n.styles }, this.textContent = n.textContent || "", n.children.length > 0 && (this.children = n.children.map((s) => {
        const r = x.fromNodeData(s);
        return r.parent = this, r;
      }));
    } else if (e.length > 1)
      this.tagName = "#fragment", this.children = e.map((n) => {
        const s = x.fromNodeData(n);
        return s.parent = this, s;
      });
    else
      throw new Error("无法解析无效的HTML字符串");
  }
  static fromNodeData(t) {
    const e = Object.create(x.prototype);
    return e.tagName = t.tagName, e.attributes = { ...t.attributes }, e.styles = { ...t.styles }, e.textContent = t.textContent || "", e.parent = null, e.children = t.children.map((n) => {
      const s = x.fromNodeData(n);
      return s.parent = e, s;
    }), e;
  }
  /**
   * 子集管理：获取当前节点的所有子节点
   * @returns {Node[]} 子节点数组（浅拷贝）
   */
  child() {
    return [...this.children];
  }
  /**
   * DOM操作：在当前节点之后插入新元素
   * @param {string|Node} newNode - 要插入的HTML字符串或Node实例
   * @returns {Node} 当前节点（链式调用）
   */
  before(t) {
    if (!this.parent)
      throw new Error("当前节点没有父节点，无法执行before操作");
    const e = this.convertToNode(t), n = this.parent.children.findIndex((s) => s === this);
    if (n === -1)
      throw new Error("当前节点不在父节点的子节点列表中");
    return e.tagName === "#fragment" ? e.children.forEach((s, r) => {
      s.parent = this.parent, this.parent?.children.splice(n + r, 0, s);
    }) : (this.parent.children.splice(n, 0, e), e.parent = this.parent), this;
  }
  /**
   * DOM操作：在当前节点之后插入新元素
   * @param {string|Node} newNode - 要插入的HTML字符串或Node实例
   * @returns {Node} 当前节点（链式调用）
   */
  after(t) {
    if (!this.parent)
      throw new Error("当前节点没有父节点，无法执行after操作");
    const e = this.convertToNode(t), n = this.parent.children.findIndex((s) => s === this);
    if (n === -1)
      throw new Error("当前节点不在父节点的子节点列表中");
    return e.tagName === "#fragment" ? e.children.forEach((s, r) => {
      s.parent = this.parent, this.parent?.children.splice(n + 1 + r, 0, s);
    }) : (this.parent.children.splice(n + 1, 0, e), e.parent = this.parent), this;
  }
  /**
   * DOM操作：在指定位置插入新元素
   * @param {number} position - 插入位置（0 ~ children.length）
   * @param {string|Node} newNode - 要插入的HTML字符串或Node实例
   * @returns {Node} 当前节点（链式调用）
   */
  insert(t, e) {
    if (typeof t != "number" || t < 0 || t > this.children.length)
      throw new Error(`插入位置${t}无效，必须是0到${this.children.length}之间的整数`);
    const n = this.convertToNode(e);
    return n.tagName === "#fragment" ? n.children.forEach((s, r) => {
      s.parent = this, this.children.splice(t + r, 0, s);
    }) : (this.children.splice(t, 0, n), n.parent = this), this;
  }
  /**
   * 属性操作：获取指定属性的值
   * @param {string} attrName - 属性名
   * @returns {string|null} 属性值（不存在返回null）
   */
  getAttr(t) {
    if (this.tagName === "#fragment" || this.tagName === "#text")
      return null;
    if (typeof t != "string")
      throw new Error("属性名必须是字符串");
    return typeof this.attributes[t] == "string" ? this.attributes[t] : null;
  }
  /**
   * 属性操作：设置指定属性的值
   * @param {string} attrName - 属性名
   * @param {string|null|undefined} value - 属性值（null/undefined删除属性）
   * @returns {Node} 当前节点（链式调用）
   */
  setAttr(t, e) {
    if (this.tagName === "#fragment" || this.tagName === "#text")
      throw new Error("片段/文本节点不支持设置属性");
    if (typeof t != "string")
      throw new Error("属性名必须是字符串");
    return e == null ? delete this.attributes[t] : this.attributes[t] = String(e), this;
  }
  /**
   * 属性操作：批量设置多个属性
   * @param {Record<string, string | null | undefined>} attrs - 包含属性名-属性值键值对的对象
   * @returns {Node} 当前节点（链式调用）
   */
  setAttrs(t) {
    if (typeof t != "object" || t === null)
      throw new Error("属性对象必须是非空对象");
    for (const [e, n] of Object.entries(t))
      this.setAttr(e, n);
    return this;
  }
  /**
   * 样式操作：获取指定样式属性的值
   * @param {string} styleProp - 样式属性名（支持驼峰/短横线）
   * @returns {string|null} 样式值（不存在返回null）
   */
  getStyle(t) {
    if (this.tagName === "#fragment" || this.tagName === "#text")
      return null;
    if (typeof t != "string")
      throw new Error("样式属性名必须是字符串");
    const e = w(t);
    return this.styles[e] || this.styles[t] || null;
  }
  /**
   * 样式操作：设置指定样式属性的值
   * @param {string} styleProp - 样式属性名（支持驼峰/短横线）
   * @param {string|null|undefined} value - 样式值（null/undefined删除样式）
   * @returns {Node} 当前节点（链式调用）
   */
  setStyle(t, e) {
    if (this.tagName === "#fragment" || this.tagName === "#text")
      throw new Error("片段/文本节点不支持设置样式");
    if (typeof t != "string")
      throw new Error("样式属性名必须是字符串");
    const n = w(t);
    return e == null ? (delete this.styles[n], delete this.styles[t]) : this.styles[n] = String(e), this;
  }
  /**
   * 样式操作：批量设置多个样式属性
   * @param {Record<string, string | null | undefined>} styles - 包含样式属性名-样式值键值对的对象
   * @returns {Node} 当前节点（链式调用）
   */
  setStyles(t) {
    if (typeof t != "object" || t === null)
      throw new Error("样式对象必须是非空对象");
    for (const [e, n] of Object.entries(t))
      this.setStyle(e, n);
    return this;
  }
  /**
   * 获取当前节点的完整HTML文本
   * @returns {string} HTML字符串
   */
  getHtml() {
    if (this.tagName === "#text")
      return this.textContent;
    if (this.tagName === "#fragment")
      return this.children.map((r) => r.getHtml()).join("");
    let t = `<${this.tagName}`;
    const e = { ...this.attributes }, n = { ...this.styles };
    if (typeof e.style == "string") {
      const r = /([a-zA-Z0-9-]+)\s*:\s*([^;]+)/g;
      let a;
      for (; (a = r.exec(e.style)) !== null; ) {
        const [, i, h] = a, c = w(i.trim());
        c in n || (n[c] = h.trim());
      }
    }
    if (Object.keys(n).length > 0) {
      const r = Object.entries(n).map(([a, i]) => `${S(a)}: ${i}`).join("; ");
      e.style = r;
    }
    for (const [r, a] of Object.entries(e))
      if (r !== "styleObj" && typeof a == "string") {
        const i = a.replace(/"/g, "&quot;");
        t += ` ${r}="${i}"`;
      }
    if (y.includes(this.tagName))
      return t += "/>", t;
    t += ">";
    let s = this.textContent;
    return this.children.length > 0 && (s += this.children.map((r) => r.getHtml()).join("")), `${t}${s}</${this.tagName}>`;
  }
  /**
   * 私有辅助方法：统一转换插入的节点为Node实例
   * @param {string|Node} node - HTML字符串或Node实例
   * @returns {Node} Node实例
   */
  convertToNode(t) {
    if (t instanceof x) return t;
    if (typeof t == "string") return new x(t);
    throw new Error("插入的节点必须是HTML字符串或Node实例");
  }
}
export {
  x as default
};
//# sourceMappingURL=parse_html.es.js.map
