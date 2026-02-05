const C = ["img", "br", "input", "meta", "link", "hr", "area", "base", "col", "embed", "param", "source", "track", "wbr"];
function M(o) {
  return o.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`);
}
function S(o) {
  return o.replace(/-([a-z])/g, (t, e) => e.toUpperCase());
}
function A(o) {
  const t = {};
  if (!o) return t;
  const e = /([a-zA-Z0-9-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let n;
  for (; (n = e.exec(o)) !== null; ) {
    const [, s, r, l, a] = n, h = r || l || a || "";
    t[s] = h;
  }
  if (t.style) {
    const s = {}, r = /([a-zA-Z0-9-]+)\s*:\s*([^;]+)/g;
    let l;
    for (; (l = r.exec(t.style)) !== null; ) {
      const [, a, h] = l;
      s[S(a.trim())] = h.trim();
    }
    t.styleObj = s, delete t.style;
  }
  return t;
}
function g(o) {
  if (o = o.trim(), !o) return null;
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
    const [, c, i] = e;
    if (C.includes(c.toLowerCase())) {
      const N = A(i);
      return {
        tagName: c.toLowerCase(),
        attributes: N,
        // 类型匹配
        styles: N.styleObj || {},
        // styleObj是Record<string, string>，符合styles类型
        textContent: "",
        children: [],
        parent: null
      };
    }
  }
  const n = /<([a-zA-Z0-9]+)\s*(.*?)>/, s = o.match(n);
  if (!s) return null;
  const [r, l, a] = s, h = l.toLowerCase(), u = `</${h}>`;
  let x = -1, d = 1, m = r.length;
  for (; m < o.length && d > 0; ) {
    const c = o.indexOf(`<${h}`, m), i = o.indexOf(u, m);
    if (i === -1) break;
    c !== -1 && c < i ? (d++, m = c + `<${h}`.length) : (d--, d === 0 && (x = i), m = i + u.length);
  }
  const L = x !== -1 ? o.slice(r.length, x).trim() : o.slice(r.length).trim(), I = A(a), w = {
    tagName: h,
    attributes: I,
    // 类型匹配
    styles: I.styleObj || {},
    // 类型匹配
    textContent: "",
    children: [],
    parent: null
  };
  if (L) {
    const c = [];
    let i = L;
    for (; i; ) {
      const N = i.indexOf("<");
      if (N === -1) {
        const p = g(i);
        p && c.push(p), i = "";
      } else if (N > 0) {
        const p = g(i.slice(0, N));
        p && c.push(p), i = i.slice(N);
      } else {
        const p = i.match(n);
        if (!p) {
          const f = g(i);
          f && c.push(f), i = "";
          continue;
        }
        const E = p[1].toLowerCase(), $ = `</${E}>`;
        if (C.includes(E)) {
          const f = g(i.slice(0, p[0].length));
          f && c.push(f), i = i.slice(p[0].length).trim();
          continue;
        }
        let O = -1, j = 1, b = p[0].length;
        for (; b < i.length && j > 0; ) {
          const f = i.indexOf(`<${E}`, b), y = i.indexOf($, b);
          if (y === -1) break;
          f !== -1 && f < y ? (j++, b = f + `<${E}`.length) : (j--, j === 0 && (O = y), b = y + $.length);
        }
        if (O !== -1) {
          const f = i.slice(0, O + $.length), y = g(f);
          y && c.push(y), i = i.slice(O + $.length).trim();
        } else {
          const f = g(i);
          f && c.push(f), i = "";
        }
      }
    }
    w.children = c.filter(Boolean), w.children.length === 1 && w.children[0].tagName === "#text" && (w.textContent = w.children[0].textContent, w.children = []);
  }
  return w;
}
function k(o) {
  if (o = o.trim(), !o) return [];
  const t = [];
  let e = o;
  for (; e; ) {
    const n = e.indexOf("<");
    if (n === -1) {
      const s = g(e);
      s && t.push(s), e = "";
    } else if (n > 0) {
      const s = g(e.slice(0, n));
      s && t.push(s), e = e.slice(n);
    } else {
      const s = /<([a-zA-Z0-9]+)\s*(.*?)>/, r = e.match(s);
      if (!r) {
        const a = g(e);
        a && t.push(a), e = "";
        continue;
      }
      const l = r[1].toLowerCase();
      if (C.includes(l)) {
        const a = /<([a-zA-Z0-9]+)\s*(.*?)\/?>/, h = e.match(a);
        if (h) {
          const u = g(h[0]);
          u && t.push(u), e = e.slice(h[0].length).trim();
        } else {
          const u = g(e);
          u && t.push(u), e = "";
        }
      } else {
        const a = `</${l}>`;
        let h = -1, u = 1, x = r[0].length;
        for (; x < e.length && u > 0; ) {
          const d = e.indexOf(`<${l}`, x), m = e.indexOf(a, x);
          if (m === -1) break;
          d !== -1 && d < m ? (u++, x = d + `<${l}`.length) : (u--, u === 0 && (h = m), x = m + a.length);
        }
        if (h !== -1) {
          const d = e.slice(0, h + a.length), m = g(d);
          m && t.push(m), e = e.slice(h + a.length).trim();
        } else {
          const d = g(e);
          d && t.push(d), e = "";
        }
      }
    }
  }
  return t.filter(Boolean);
}
class T {
  /**
   * 构造函数：通过HTML字符串初始化节点（支持单根/多根）
   * @param {string} html - HTML字符串（单根/多根均可）
   */
  constructor(t) {
    if (typeof t != "string")
      throw new Error("初始化Node必须传入HTML字符串");
    const e = t.trim();
    if (!e)
      throw new Error("无法解析空的HTML字符串");
    const n = g(e), s = k(e);
    if (this.tagName = "", this.attributes = {}, this.styles = {}, this.textContent = "", this.children = [], this.parent = null, n && s.length === 1)
      this.tagName = n.tagName, this.attributes = { ...n.attributes }, this.styles = { ...n.styles }, this.textContent = n.textContent || "", n.children.length > 0 && (this.children = n.children.map((r) => {
        const l = new T(this.#t(r));
        return l.parent = this, l;
      }));
    else if (s.length > 0)
      this.tagName = "#fragment", this.attributes = {}, this.styles = {}, this.textContent = "", this.children = s.map((r) => {
        const l = new T(this.#t(r));
        return l.parent = this, l;
      });
    else
      throw new Error("无法解析无效的HTML字符串");
  }
  /**
   * 私有方法：从节点数据生成HTML字符串（用于子节点初始化）
   * @param {INodeData} nodeData - 节点数据
   * @returns {string} HTML字符串
   */
  #t(t) {
    if (t.tagName === "#text") return t.textContent;
    let e = `<${t.tagName}`;
    const n = { ...t.attributes };
    if (Object.keys(t.styles).length > 0) {
      const r = Object.entries(t.styles).map(([l, a]) => `${M(l)}: ${a}`).join("; ");
      n.style = r;
    }
    for (const [r, l] of Object.entries(n))
      r !== "styleObj" && typeof l == "string" && (e += ` ${r}="${l}"`);
    if (C.includes(t.tagName))
      return e += "/>", e;
    e += ">";
    let s = t.textContent;
    return t.children.length > 0 && (s += t.children.map((r) => this.#t(r)).join("")), `${e}${s}</${t.tagName}>`;
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
    const e = this.#e(t), n = this.parent.children.findIndex((s) => s === this);
    if (n === -1)
      throw new Error("当前节点不在父节点的子节点列表中");
    return this.parent.children.splice(n, 0, e), e.parent = this.parent, this;
  }
  /**
   * DOM操作：在当前节点之后插入新元素
   * @param {string|Node} newNode - 要插入的HTML字符串或Node实例
   * @returns {Node} 当前节点（链式调用）
   */
  after(t) {
    if (!this.parent)
      throw new Error("当前节点没有父节点，无法执行after操作");
    const e = this.#e(t), n = this.parent.children.findIndex((s) => s === this);
    if (n === -1)
      throw new Error("当前节点不在父节点的子节点列表中");
    return this.parent.children.splice(n + 1, 0, e), e.parent = this.parent, this;
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
    const n = this.#e(e);
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
    if (this.tagName === "#fragment" || this.tagName === "#text")
      throw new Error("片段/文本节点不支持设置属性");
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
    const e = S(t);
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
    const n = S(t);
    return e == null ? (delete this.styles[n], delete this.styles[t]) : this.styles[n] = String(e), this;
  }
  /**
   * 样式操作：批量设置多个样式属性
   * @param {Record<string, string | null | undefined>} styles - 包含样式属性名-样式值键值对的对象
   * @returns {Node} 当前节点（链式调用）
   */
  setStyles(t) {
    if (this.tagName === "#fragment" || this.tagName === "#text")
      throw new Error("片段/文本节点不支持设置样式");
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
      return this.children.map((s) => s.getHtml()).join("");
    let t = `<${this.tagName}`;
    const e = { ...this.attributes };
    if (Object.keys(this.styles).length > 0) {
      const s = Object.entries(this.styles).map(([r, l]) => `${M(r)}: ${l}`).join("; ");
      e.style = s;
    }
    for (const [s, r] of Object.entries(e))
      if (s !== "styleObj" && typeof r == "string") {
        const l = r.replace(/"/g, "&quot;");
        t += ` ${s}="${l}"`;
      }
    if (C.includes(this.tagName))
      return t += "/>", t;
    t += ">";
    let n = this.textContent;
    return this.children.length > 0 && (n += this.children.map((s) => s.getHtml()).join("")), `${t}${n}</${this.tagName}>`;
  }
  /**
   * 私有辅助方法：统一转换插入的节点为Node实例
   * @param {string|Node} node - HTML字符串或Node实例
   * @returns {Node} Node实例
   */
  #e(t) {
    if (t instanceof T) return t;
    if (typeof t == "string") return new T(t);
    throw new Error("插入的节点必须是HTML字符串或Node实例");
  }
}
export {
  T as default
};
//# sourceMappingURL=parse_html.es.js.map
