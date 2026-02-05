// 定义核心接口：扩展属性对象（包含内部使用的styleObj）
interface IAttributeData {
  [key: string]: string | Record<string, string> | undefined; // 允许值是字符串、样式对象或undefined
  styleObj?: Record<string, string>; // 新增：显式声明styleObj属性（可选）
}

// 定义核心接口：节点数据结构（解析后的原始数据）
interface INodeData {
  tagName: string; // #text | #fragment | 标签名（如div/p）
  textContent: string;
  attributes: IAttributeData; // 修改：使用扩展后的属性接口
  styles: Record<string, string>; // 样式键值对（驼峰格式）
  children: INodeData[];
  parent: INodeData | null;
}

// 自闭合标签常量（只读数组）
const SELF_CLOSING_TAGS: readonly string[] = ["img", "br", "input", "meta", "link", "hr", "area", "base", "col", "embed", "param", "source", "track", "wbr"];

// 工具函数：驼峰转短横线（用于样式属性）
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

// 工具函数：短横线转驼峰（用于样式属性）
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_: string, match: string) => match.toUpperCase());
}

// 工具函数：解析属性字符串为属性对象（修改返回类型为IAttributeData）
function parseAttributes(attrStr: string): IAttributeData {
  const attrs: IAttributeData = {}; // 修改：使用扩展后的属性接口
  if (!attrStr) return attrs;

  // 匹配属性键值对：key="value" / key='value' / key=value
  const attrRegex = /([a-zA-Z0-9-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(attrStr)) !== null) {
    const [, key, doubleVal, singleVal, noQuoteVal] = match;
    const value = doubleVal || singleVal || noQuoteVal || "";
    attrs[key] = value;
  }

  // 解析style属性为样式对象（内部属性，不对外输出）
  if (attrs.style) {
    const styleObj: Record<string, string> = {};
    const styleRegex = /([a-zA-Z0-9-]+)\s*:\s*([^;]+)/g;
    let styleMatch: RegExpExecArray | null;

    while ((styleMatch = styleRegex.exec(attrs.style as string)) !== null) {
      const [, prop, val] = styleMatch;
      styleObj[kebabToCamel(prop.trim())] = val.trim();
    }

    attrs.styleObj = styleObj; // 现在类型匹配，无TS错误
    delete attrs.style; // 替换为结构化的样式对象
  }

  return attrs;
}

// 核心工具函数：解析单个节点（内部使用）
function parseSingleNode(html: string): INodeData | null {
  html = html;
  if (!html) return null;

  // 文本节点（非标签内容）
  if (!html.startsWith("<")) {
    return {
      tagName: "#text",
      textContent: html,
      attributes: {}, // 符合IAttributeData类型
      styles: {},
      children: [],
      parent: null,
    };
  }

  const selfClosingRegex = /<([a-zA-Z0-9]+)\s*(.*?)\/?>/;
  const selfClosingMatch = html.match(selfClosingRegex);

  // 处理自闭合标签
  if (selfClosingMatch) {
    const [, tagName, attrStr] = selfClosingMatch;
    if (SELF_CLOSING_TAGS.includes(tagName.toLowerCase())) {
      const attrs = parseAttributes(attrStr);
      return {
        tagName: tagName.toLowerCase(),
        attributes: attrs, // 类型匹配
        styles: attrs.styleObj || {}, // styleObj是Record<string, string>，符合styles类型
        textContent: "",
        children: [],
        parent: null,
      };
    }
  }

  // 匹配开始标签
  const startTagRegex = /<([a-zA-Z0-9]+)\s*(.*?)>/;
  const startTagMatch = html.match(startTagRegex);
  if (!startTagMatch) return null;

  const [startTag, tagName, attrStr] = startTagMatch;
  const lowerTagName = tagName.toLowerCase();
  const endTag = `</${lowerTagName}>`;

  // 查找匹配的结束标签（处理嵌套）
  let endTagIndex = -1;
  let tagCount = 1;
  let currentIndex = startTag.length;

  while (currentIndex < html.length && tagCount > 0) {
    const nextStart = html.indexOf(`<${lowerTagName}`, currentIndex);
    const nextEnd = html.indexOf(endTag, currentIndex);

    if (nextEnd === -1) break;
    if (nextStart !== -1 && nextStart < nextEnd) {
      tagCount++;
      currentIndex = nextStart + `<${lowerTagName}`.length;
    } else {
      tagCount--;
      if (tagCount === 0) endTagIndex = nextEnd;
      currentIndex = nextEnd + endTag.length;
    }
  }

  // 提取标签内容（开始标签和结束标签之间）
  const content = endTagIndex !== -1 ? html.slice(startTag.length, endTagIndex) : html.slice(startTag.length);

  // 构建基础节点数据
  const attrs = parseAttributes(attrStr);
  const nodeData: INodeData = {
    tagName: lowerTagName,
    attributes: attrs, // 类型匹配
    styles: attrs.styleObj || {}, // 类型匹配
    textContent: "",
    children: [],
    parent: null,
  };

  // 解析子节点
  if (content) {
    const childNodes: INodeData[] = [];
    let remaining = content;

    while (remaining) {
      const tagStart = remaining.indexOf("<");
      if (tagStart === -1) {
        // 纯文本内容
        const textNode = parseSingleNode(remaining);
        if (textNode) childNodes.push(textNode);
        remaining = "";
      } else {
        if (tagStart > 0) {
          // 标签前的文本
          const textNode = parseSingleNode(remaining.slice(0, tagStart));
          if (textNode) childNodes.push(textNode);
          remaining = remaining.slice(tagStart);
        } else {
          // 解析嵌套标签
          const tempTagMatch = remaining.match(startTagRegex);
          if (!tempTagMatch) {
            const textNode = parseSingleNode(remaining);
            if (textNode) childNodes.push(textNode);
            remaining = "";
            continue;
          }

          const tempTagName = tempTagMatch[1].toLowerCase();
          const tempEndTag = `</${tempTagName}>`;

          // 自闭合标签直接处理
          if (SELF_CLOSING_TAGS.includes(tempTagName)) {
            const selfNode = parseSingleNode(remaining.slice(0, tempTagMatch[0].length));
            if (selfNode) childNodes.push(selfNode);
            remaining = remaining.slice(tempTagMatch[0].length);
            continue;
          }

          // 查找嵌套标签的结束位置
          let tempEndIndex = -1;
          let tempTagCount = 1;
          let tempCurrentIndex = tempTagMatch[0].length;

          while (tempCurrentIndex < remaining.length && tempTagCount > 0) {
            const nextTempStart = remaining.indexOf(`<${tempTagName}`, tempCurrentIndex);
            const nextTempEnd = remaining.indexOf(tempEndTag, tempCurrentIndex);

            if (nextTempEnd === -1) break;
            if (nextTempStart !== -1 && nextTempStart < nextTempEnd) {
              tempTagCount++;
              tempCurrentIndex = nextTempStart + `<${tempTagName}`.length;
            } else {
              tempTagCount--;
              if (tempTagCount === 0) tempEndIndex = nextTempEnd;
              tempCurrentIndex = nextTempEnd + tempEndTag.length;
            }
          }

          // 提取子节点HTML并递归解析
          if (tempEndIndex !== -1) {
            const childHTML = remaining.slice(0, tempEndIndex + tempEndTag.length);
            const childNode = parseSingleNode(childHTML);
            if (childNode) childNodes.push(childNode);
            remaining = remaining.slice(tempEndIndex + tempEndTag.length);
          } else {
            const childNode = parseSingleNode(remaining);
            if (childNode) childNodes.push(childNode);
            remaining = "";
          }
        }
      }
    }

    // 过滤无效节点并赋值
    nodeData.children = childNodes.filter(Boolean);
    // 单一文本子节点直接合并到textContent
    if (nodeData.children.length === 1 && nodeData.children[0].tagName === "#text") {
      nodeData.textContent = nodeData.children[0].textContent;
      nodeData.children = [];
    }
  }

  return nodeData;
}

// 新增：解析HTML片段（支持多根节点）
function parseHTMLFragment(html: string): INodeData[] {
  html = html;
  if (!html) return [];

  const fragmentNodes: INodeData[] = [];
  let remaining = html;

  while (remaining) {
    const tagStart = remaining.indexOf("<");
    if (tagStart === -1) {
      // 剩余纯文本
      const textNode = parseSingleNode(remaining);
      if (textNode) fragmentNodes.push(textNode);
      remaining = "";
    } else {
      if (tagStart > 0) {
        // 标签前的文本节点
        const textNode = parseSingleNode(remaining.slice(0, tagStart));
        if (textNode) fragmentNodes.push(textNode);
        remaining = remaining.slice(tagStart);
      } else {
        // 解析单个标签节点
        const startTagRegex = /<([a-zA-Z0-9]+)\s*(.*?)>/;
        const tempTagMatch = remaining.match(startTagRegex);

        if (!tempTagMatch) {
          const textNode = parseSingleNode(remaining);
          if (textNode) fragmentNodes.push(textNode);
          remaining = "";
          continue;
        }

        const tempTagName = tempTagMatch[1].toLowerCase();

        // 自闭合标签
        if (SELF_CLOSING_TAGS.includes(tempTagName)) {
          const selfClosingRegex = /<([a-zA-Z0-9]+)\s*(.*?)\/?>/;
          const selfClosingMatch = remaining.match(selfClosingRegex);

          if (selfClosingMatch) {
            const selfNode = parseSingleNode(selfClosingMatch[0]);
            if (selfNode) fragmentNodes.push(selfNode);
            remaining = remaining.slice(selfClosingMatch[0].length);
          } else {
            const textNode = parseSingleNode(remaining);
            if (textNode) fragmentNodes.push(textNode);
            remaining = "";
          }
        } else {
          // 非自闭合标签，找匹配的结束标签
          const tempEndTag = `</${tempTagName}>`;
          let tempEndIndex = -1;
          let tempTagCount = 1;
          let tempCurrentIndex = tempTagMatch[0].length;

          while (tempCurrentIndex < remaining.length && tempTagCount > 0) {
            const nextTempStart = remaining.indexOf(`<${tempTagName}`, tempCurrentIndex);
            const nextTempEnd = remaining.indexOf(tempEndTag, tempCurrentIndex);

            if (nextTempEnd === -1) break;
            if (nextTempStart !== -1 && nextTempStart < nextTempEnd) {
              tempTagCount++;
              tempCurrentIndex = nextTempStart + `<${tempTagName}`.length;
            } else {
              tempTagCount--;
              if (tempTagCount === 0) tempEndIndex = nextTempEnd;
              tempCurrentIndex = nextTempEnd + tempEndTag.length;
            }
          }

          if (tempEndIndex !== -1) {
            const childHTML = remaining.slice(0, tempEndIndex + tempEndTag.length);
            const childNode = parseSingleNode(childHTML);
            if (childNode) fragmentNodes.push(childNode);
            remaining = remaining.slice(tempEndIndex + tempEndTag.length);
          } else {
            const childNode = parseSingleNode(remaining);
            if (childNode) fragmentNodes.push(childNode);
            remaining = "";
          }
        }
      }
    }
  }

  // 过滤无效节点
  return fragmentNodes.filter(Boolean);
}

// 核心Node类实现（支持片段/多根节点）
class Node {
  public tagName: string;
  public attributes: IAttributeData; // 修改：使用扩展后的属性接口
  public styles: Record<string, string>;
  public textContent: string;
  public children: Node[];
  public parent: Node | null;

  /**
   * 构造函数：通过HTML字符串初始化节点（支持单根/多根）
   * @param {string} html - HTML字符串（单根/多根均可）
   */
  constructor(html: string) {
    if (typeof html !== "string") {
      throw new Error("初始化Node必须传入HTML字符串");
    }

    const htmlTrimmed = html;
    if (!htmlTrimmed) {
      throw new Error("无法解析空的HTML字符串");
    }

    // 尝试解析为单一节点
    const singleNodeData = parseSingleNode(htmlTrimmed);
    // 解析为片段（多根节点）
    const fragmentNodeData = parseHTMLFragment(htmlTrimmed);

    // 初始化默认属性
    this.tagName = "";
    this.attributes = {}; // 符合IAttributeData类型
    this.styles = {};
    this.textContent = "";
    this.children = [];
    this.parent = null;

    // 节点核心属性赋值
    if (singleNodeData && fragmentNodeData.length === 1) {
      // 单根节点
      this.tagName = singleNodeData.tagName;
      this.attributes = { ...singleNodeData.attributes };
      this.styles = { ...singleNodeData.styles };
      this.textContent = singleNodeData.textContent || "";

      // 子节点转换为Node实例
      if (singleNodeData.children.length > 0) {
        this.children = singleNodeData.children.map((childData) => {
          const childNode = new Node(this.#generateHTMLFromData(childData));
          childNode.parent = this;
          return childNode;
        });
      }
    } else if (fragmentNodeData.length > 0) {
      // 多根节点 → 标记为片段节点
      this.tagName = "#fragment";
      this.attributes = {}; // 符合IAttributeData类型
      this.styles = {};
      this.textContent = "";

      // 片段的子节点是多个根节点
      this.children = fragmentNodeData.map((childData) => {
        const childNode = new Node(this.#generateHTMLFromData(childData));
        childNode.parent = this;
        return childNode;
      });
    } else {
      throw new Error("无法解析无效的HTML字符串");
    }
  }

  /**
   * 私有方法：从节点数据生成HTML字符串（用于子节点初始化）
   * @param {INodeData} nodeData - 节点数据
   * @returns {string} HTML字符串
   */
  #generateHTMLFromData(nodeData: INodeData): string {
    if (nodeData.tagName === "#text") return nodeData.textContent;

    // 构建开始标签
    let startTag = `<${nodeData.tagName}`;
    const attrs = { ...nodeData.attributes };

    // 拼接样式属性（覆盖原始style）
    if (Object.keys(nodeData.styles).length > 0) {
      const styleStr = Object.entries(nodeData.styles)
        .map(([key, val]) => `${camelToKebab(key)}: ${val}`)
        .join("; ");
      attrs.style = styleStr;
    }

    // 拼接所有属性：过滤内部属性styleObj
    for (const [key, val] of Object.entries(attrs)) {
      if (key === "styleObj") continue; // 核心修复：跳过内部样式对象属性
      // 确保val是字符串（IAttributeData中除了styleObj都是string）
      if (typeof val === "string") {
        startTag += ` ${key}="${val}"`;
      }
    }

    // 自闭合标签处理
    if (SELF_CLOSING_TAGS.includes(nodeData.tagName)) {
      startTag += "/>";
      return startTag;
    }

    startTag += ">";

    // 拼接内容（文本+子节点）
    let content = nodeData.textContent;
    if (nodeData.children.length > 0) {
      content += nodeData.children.map((child) => this.#generateHTMLFromData(child)).join("");
    }

    return `${startTag}${content}</${nodeData.tagName}>`;
  }

  /**
   * 子集管理：获取当前节点的所有子节点
   * @returns {Node[]} 子节点数组（浅拷贝）
   */
  child(): Node[] {
    return [...this.children];
  }

  /**
   * DOM操作：在当前节点之后插入新元素
   * @param {string|Node} newNode - 要插入的HTML字符串或Node实例
   * @returns {Node} 当前节点（链式调用）
   */
  before(newNode: string | Node): Node {
    if (!this.parent) {
      throw new Error("当前节点没有父节点，无法执行before操作");
    }

    const nodeToInsert = this.#convertToNode(newNode);
    const currentIndex = this.parent.children.findIndex((child) => child === this);

    if (currentIndex === -1) {
      throw new Error("当前节点不在父节点的子节点列表中");
    }

    // 插入到当前节点前一个位置
    this.parent.children.splice(currentIndex, 0, nodeToInsert);
    nodeToInsert.parent = this.parent;

    return this;
  }

  /**
   * DOM操作：在当前节点之后插入新元素
   * @param {string|Node} newNode - 要插入的HTML字符串或Node实例
   * @returns {Node} 当前节点（链式调用）
   */
  after(newNode: string | Node): Node {
    if (!this.parent) {
      throw new Error("当前节点没有父节点，无法执行after操作");
    }

    const nodeToInsert = this.#convertToNode(newNode);
    const currentIndex = this.parent.children.findIndex((child) => child === this);

    if (currentIndex === -1) {
      throw new Error("当前节点不在父节点的子节点列表中");
    }

    // 插入到当前节点下一个位置
    this.parent.children.splice(currentIndex + 1, 0, nodeToInsert);
    nodeToInsert.parent = this.parent;

    return this;
  }

  /**
   * DOM操作：在指定位置插入新元素
   * @param {number} position - 插入位置（0 ~ children.length）
   * @param {string|Node} newNode - 要插入的HTML字符串或Node实例
   * @returns {Node} 当前节点（链式调用）
   */
  insert(position: number, newNode: string | Node): Node {
    if (typeof position !== "number" || position < 0 || position > this.children.length) {
      throw new Error(`插入位置${position}无效，必须是0到${this.children.length}之间的整数`);
    }

    const nodeToInsert = this.#convertToNode(newNode);
    // 如果插入的是片段节点，展开其所有子节点（符合DOM标准）
    if (nodeToInsert.tagName === "#fragment") {
      nodeToInsert.children.forEach((child, index) => {
        child.parent = this;
        this.children.splice(position + index, 0, child);
      });
    } else {
      this.children.splice(position, 0, nodeToInsert);
      nodeToInsert.parent = this;
    }

    return this;
  }

  /**
   * 属性操作：获取指定属性的值
   * @param {string} attrName - 属性名
   * @returns {string|null} 属性值（不存在返回null）
   */
  getAttr(attrName: string): string | null {
    if (this.tagName === "#fragment" || this.tagName === "#text") {
      return null; // 片段/文本节点无属性
    }
    if (typeof attrName !== "string") {
      throw new Error("属性名必须是字符串");
    }
    // 只返回字符串类型的属性（排除styleObj）
    return typeof this.attributes[attrName] === "string" ? this.attributes[attrName] : null;
  }

  /**
   * 属性操作：设置指定属性的值
   * @param {string} attrName - 属性名
   * @param {string|null|undefined} value - 属性值（null/undefined删除属性）
   * @returns {Node} 当前节点（链式调用）
   */
  setAttr(attrName: string, value: string | null | undefined): Node {
    if (this.tagName === "#fragment" || this.tagName === "#text") {
      throw new Error("片段/文本节点不支持设置属性");
    }
    if (typeof attrName !== "string") {
      throw new Error("属性名必须是字符串");
    }

    if (value === null || value === undefined) {
      delete this.attributes[attrName];
    } else {
      // 确保属性值是字符串（符合IAttributeData的基础约束）
      this.attributes[attrName] = String(value);
    }

    return this;
  }

  /**
   * 属性操作：批量设置多个属性
   * @param {Record<string, string | null | undefined>} attrs - 包含属性名-属性值键值对的对象
   * @returns {Node} 当前节点（链式调用）
   */
  setAttrs(attrs: Record<string, string | null | undefined>): Node {
    if (this.tagName === "#fragment" || this.tagName === "#text") {
      throw new Error("片段/文本节点不支持设置属性");
    }
    if (typeof attrs !== "object" || attrs === null) {
      throw new Error("属性对象必须是非空对象");
    }

    for (const [attrName, value] of Object.entries(attrs)) {
      this.setAttr(attrName, value);
    }

    return this;
  }

  /**
   * 样式操作：获取指定样式属性的值
   * @param {string} styleProp - 样式属性名（支持驼峰/短横线）
   * @returns {string|null} 样式值（不存在返回null）
   */
  getStyle(styleProp: string): string | null {
    if (this.tagName === "#fragment" || this.tagName === "#text") {
      return null; // 片段/文本节点无样式
    }
    if (typeof styleProp !== "string") {
      throw new Error("样式属性名必须是字符串");
    }

    const camelProp = kebabToCamel(styleProp);
    return this.styles[camelProp] || this.styles[styleProp] || null;
  }

  /**
   * 样式操作：设置指定样式属性的值
   * @param {string} styleProp - 样式属性名（支持驼峰/短横线）
   * @param {string|null|undefined} value - 样式值（null/undefined删除样式）
   * @returns {Node} 当前节点（链式调用）
   */
  setStyle(styleProp: string, value: string | null | undefined): Node {
    if (this.tagName === "#fragment" || this.tagName === "#text") {
      throw new Error("片段/文本节点不支持设置样式");
    }
    if (typeof styleProp !== "string") {
      throw new Error("样式属性名必须是字符串");
    }

    const camelProp = kebabToCamel(styleProp);
    if (value === null || value === undefined) {
      delete this.styles[camelProp];
      delete this.styles[styleProp];
    } else {
      this.styles[camelProp] = String(value);
    }

    return this;
  }

  /**
   * 样式操作：批量设置多个样式属性
   * @param {Record<string, string | null | undefined>} styles - 包含样式属性名-样式值键值对的对象
   * @returns {Node} 当前节点（链式调用）
   */
  setStyles(styles: Record<string, string | null | undefined>): Node {
    if (this.tagName === "#fragment" || this.tagName === "#text") {
      throw new Error("片段/文本节点不支持设置样式");
    }
    if (typeof styles !== "object" || styles === null) {
      throw new Error("样式对象必须是非空对象");
    }

    for (const [styleProp, value] of Object.entries(styles)) {
      this.setStyle(styleProp, value);
    }

    return this;
  }

  /**
   * 获取当前节点的完整HTML文本
   * @returns {string} HTML字符串
   */
  getHtml(): string {
    // 文本节点直接返回文本
    if (this.tagName === "#text") {
      return this.textContent;
    }

    // 片段节点返回所有子节点的HTML拼接
    if (this.tagName === "#fragment") {
      return this.children.map((child) => child.getHtml()).join("");
    }

    // 普通元素节点
    let startTag = `<${this.tagName}`;
    const attrs = { ...this.attributes };

    // 拼接样式属性（覆盖原始style）
    if (Object.keys(this.styles).length > 0) {
      const styleStr = Object.entries(this.styles)
        .map(([key, val]) => `${camelToKebab(key)}: ${val}`)
        .join("; ");
      attrs.style = styleStr;
    }

    // 拼接所有属性：过滤内部属性styleObj，确保值是字符串
    for (const [key, val] of Object.entries(attrs)) {
      if (key === "styleObj") continue; // 核心修复：跳过内部样式对象属性
      if (typeof val === "string") {
        const safeVal = val.replace(/"/g, "&quot;");
        startTag += ` ${key}="${safeVal}"`;
      }
    }

    // 自闭合标签处理
    if (SELF_CLOSING_TAGS.includes(this.tagName)) {
      startTag += "/>";
      return startTag;
    }

    startTag += ">";

    // 拼接内容（文本+子节点HTML）
    let content = this.textContent;
    if (this.children.length > 0) {
      content += this.children.map((child) => child.getHtml()).join("");
    }

    return `${startTag}${content}</${this.tagName}>`;
  }

  /**
   * 私有辅助方法：统一转换插入的节点为Node实例
   * @param {string|Node} node - HTML字符串或Node实例
   * @returns {Node} Node实例
   */
  #convertToNode(node: string | Node): Node {
    if (node instanceof Node) return node;
    if (typeof node === "string") return new Node(node);
    throw new Error("插入的节点必须是HTML字符串或Node实例");
  }
}

export default Node;
