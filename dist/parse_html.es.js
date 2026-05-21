const S = ["img", "br", "input", "meta", "link", "hr", "area", "base", "col", "embed", "param", "source", "track", "wbr"];
function M(o) {
  return o.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`);
}
function j(o) {
  return o.replace(/-([a-z])/g, (t, e) => e.toUpperCase());
}
function A(o) {
  const t = {};
  if (!o) return t;
  const e = /([a-zA-Z0-9-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let n;
  for (; (n = e.exec(o)) !== null; ) {
    const [, s, i, a, c] = n, l = i || a || c || "";
    t[s] = l;
  }
  if (t.style) {
    const s = {}, i = /([a-zA-Z0-9-]+)\s*:\s*([^;]+)/g;
    let a;
    for (; (a = i.exec(t.style)) !== null; ) {
      const [, c, l] = a;
      s[j(c.trim())] = l.trim();
    }
    t.styleObj = s, delete t.style;
  }
  return t;
}
function p(o) {
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
    const [, h, r] = e;
    if (S.includes(h.toLowerCase())) {
      const w = A(r);
      return {
        tagName: h.toLowerCase(),
        attributes: w,
        // 类型匹配
        styles: w.styleObj || {},
        // styleObj是Record<string, string>，符合styles类型
        textContent: "",
        children: [],
        parent: null
      };
    }
  }
  const n = /<([a-zA-Z0-9]+)\s*(.*?)>/, s = o.match(n);
  if (!s) return null;
  const [i, a, c] = s, l = a.toLowerCase(), g = `</${l}>`;
  let x = -1, u = 1, d = i.length;
  for (; d < o.length && u > 0; ) {
    const h = o.indexOf(`<${l}`, d), r = o.indexOf(g, d);
    if (r === -1) break;
    h !== -1 && h < r ? (u++, d = h + `<${l}`.length) : (u--, u === 0 && (x = r), d = r + g.length);
  }
  const L = x !== -1 ? o.slice(i.length, x) : o.slice(i.length), I = A(c), N = {
    tagName: l,
    attributes: I,
    // 类型匹配
    styles: I.styleObj || {},
    // 类型匹配
    textContent: "",
    children: [],
    parent: null
  };
  if (L) {
    const h = [];
    let r = L;
    for (; r; ) {
      const w = r.indexOf("<");
      if (w === -1) {
        const m = p(r);
        m && h.push(m), r = "";
      } else if (w > 0) {
        const m = p(r.slice(0, w));
        m && h.push(m), r = r.slice(w);
      } else {
        const m = r.match(n);
        if (!m) {
          const f = p(r);
          f && h.push(f), r = "";
          continue;
        }
        const C = m[1].toLowerCase(), E = `</${C}>`;
        if (S.includes(C)) {
          const f = p(r.slice(0, m[0].length));
          f && h.push(f), r = r.slice(m[0].length);
          continue;
        }
        let O = -1, $ = 1, T = m[0].length;
        for (; T < r.length && $ > 0; ) {
          const f = r.indexOf(`<${C}`, T), b = r.indexOf(E, T);
          if (b === -1) break;
          f !== -1 && f < b ? ($++, T = f + `<${C}`.length) : ($--, $ === 0 && (O = b), T = b + E.length);
        }
        if (O !== -1) {
          const f = r.slice(0, O + E.length), b = p(f);
          b && h.push(b), r = r.slice(O + E.length);
        } else {
          const f = p(r);
          f && h.push(f), r = "";
        }
      }
    }
    N.children = h.filter(Boolean), N.children.length === 1 && N.children[0].tagName === "#text" && (N.textContent = N.children[0].textContent, N.children = []);
  }
  return N;
}
function H(o) {
  if (!o) return [];
  const t = [];
  let e = o;
  for (; e; ) {
    const n = e.indexOf("<");
    if (n === -1) {
      const s = p(e);
      s && t.push(s), e = "";
    } else if (n > 0) {
      const s = p(e.slice(0, n));
      s && t.push(s), e = e.slice(n);
    } else {
      const s = /<([a-zA-Z0-9]+)\s*(.*?)>/, i = e.match(s);
      if (!i) {
        const c = p(e);
        c && t.push(c), e = "";
        continue;
      }
      const a = i[1].toLowerCase();
      if (S.includes(a)) {
        const c = /<([a-zA-Z0-9]+)\s*(.*?)\/?>/, l = e.match(c);
        if (l) {
          const g = p(l[0]);
          g && t.push(g), e = e.slice(l[0].length);
        } else {
          const g = p(e);
          g && t.push(g), e = "";
        }
      } else {
        const c = `</${a}>`;
        let l = -1, g = 1, x = i[0].length;
        for (; x < e.length && g > 0; ) {
          const u = e.indexOf(`<${a}`, x), d = e.indexOf(c, x);
          if (d === -1) break;
          u !== -1 && u < d ? (g++, x = u + `<${a}`.length) : (g--, g === 0 && (l = d), x = d + c.length);
        }
        if (l !== -1) {
          const u = e.slice(0, l + c.length), d = p(u);
          d && t.push(d), e = e.slice(l + c.length);
        } else {
          const u = p(e);
          u && t.push(u), e = "";
        }
      }
    }
  }
  return t.filter(Boolean);
}
class y {
  constructor(t) {
    if (typeof t != "string")
      throw new Error("初始化Node必须传入HTML字符串");
    if (!t)
      throw new Error("无法解析空的HTML字符串");
    const e = H(t);
    if (this.tagName = "", this.attributes = {}, this.styles = {}, this.textContent = "", this.children = [], this.parent = null, e.length === 1) {
      const n = e[0];
      this.tagName = n.tagName, this.attributes = { ...n.attributes }, this.styles = { ...n.styles }, this.textContent = n.textContent || "", n.children.length > 0 && (this.children = n.children.map((s) => {
        const i = y.fromNodeData(s);
        return i.parent = this, i;
      }));
    } else if (e.length > 1)
      this.tagName = "#fragment", this.children = e.map((n) => {
        const s = y.fromNodeData(n);
        return s.parent = this, s;
      });
    else
      throw new Error("无法解析无效的HTML字符串");
  }
  static fromNodeData(t) {
    const e = Object.create(y.prototype);
    return e.tagName = t.tagName, e.attributes = { ...t.attributes }, e.styles = { ...t.styles }, e.textContent = t.textContent || "", e.parent = null, e.children = t.children.map((n) => {
      const s = y.fromNodeData(n);
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
    const e = this.convertToNode(t), n = this.parent.children.findIndex((s) => s === this);
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
    const n = this.convertToNode(e);
    return n.tagName === "#fragment" ? n.children.forEach((s, i) => {
      s.parent = this, this.children.splice(t + i, 0, s);
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
    const e = j(t);
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
    const n = j(t);
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
      return this.children.map((s) => s.getHtml()).join("");
    let t = `<${this.tagName}`;
    const e = { ...this.attributes };
    if (Object.keys(this.styles).length > 0) {
      const s = Object.entries(this.styles).map(([i, a]) => `${M(i)}: ${a}`).join("; ");
      e.style = s;
    }
    for (const [s, i] of Object.entries(e))
      if (s !== "styleObj" && typeof i == "string") {
        const a = i.replace(/"/g, "&quot;");
        t += ` ${s}="${a}"`;
      }
    if (S.includes(this.tagName))
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
  convertToNode(t) {
    if (t instanceof y) return t;
    if (typeof t == "string") return new y(t);
    throw new Error("插入的节点必须是HTML字符串或Node实例");
  }
}
export {
  y as default
};
//# sourceMappingURL=parse_html.es.js.map
