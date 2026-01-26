interface IAttributeData {
    [key: string]: string | Record<string, string> | undefined;
    styleObj?: Record<string, string>;
}
declare class Node {
    #private;
    tagName: string;
    attributes: IAttributeData;
    styles: Record<string, string>;
    textContent: string;
    children: Node[];
    parent: Node | null;
    /**
     * 构造函数：通过HTML字符串初始化节点（支持单根/多根）
     * @param {string} html - HTML字符串（单根/多根均可）
     */
    constructor(html: string);
    /**
     * 子集管理：获取当前节点的所有子节点
     * @returns {Node[]} 子节点数组（浅拷贝）
     */
    child(): Node[];
    /**
     * DOM操作：在当前节点之后插入新元素
     * @param {string|Node} newNode - 要插入的HTML字符串或Node实例
     * @returns {Node} 当前节点（链式调用）
     */
    before(newNode: string | Node): Node;
    /**
     * DOM操作：在当前节点之后插入新元素
     * @param {string|Node} newNode - 要插入的HTML字符串或Node实例
     * @returns {Node} 当前节点（链式调用）
     */
    after(newNode: string | Node): Node;
    /**
     * DOM操作：在指定位置插入新元素
     * @param {number} position - 插入位置（0 ~ children.length）
     * @param {string|Node} newNode - 要插入的HTML字符串或Node实例
     * @returns {Node} 当前节点（链式调用）
     */
    insert(position: number, newNode: string | Node): Node;
    /**
     * 属性操作：获取指定属性的值
     * @param {string} attrName - 属性名
     * @returns {string|null} 属性值（不存在返回null）
     */
    getAttr(attrName: string): string | null;
    /**
     * 属性操作：设置指定属性的值
     * @param {string} attrName - 属性名
     * @param {string|null|undefined} value - 属性值（null/undefined删除属性）
     * @returns {Node} 当前节点（链式调用）
     */
    setAttr(attrName: string, value: string | null | undefined): Node;
    /**
     * 属性操作：批量设置多个属性
     * @param {Record<string, string | null | undefined>} attrs - 包含属性名-属性值键值对的对象
     * @returns {Node} 当前节点（链式调用）
     */
    setAttrs(attrs: Record<string, string | null | undefined>): Node;
    /**
     * 样式操作：获取指定样式属性的值
     * @param {string} styleProp - 样式属性名（支持驼峰/短横线）
     * @returns {string|null} 样式值（不存在返回null）
     */
    getStyle(styleProp: string): string | null;
    /**
     * 样式操作：设置指定样式属性的值
     * @param {string} styleProp - 样式属性名（支持驼峰/短横线）
     * @param {string|null|undefined} value - 样式值（null/undefined删除样式）
     * @returns {Node} 当前节点（链式调用）
     */
    setStyle(styleProp: string, value: string | null | undefined): Node;
    /**
     * 样式操作：批量设置多个样式属性
     * @param {Record<string, string | null | undefined>} styles - 包含样式属性名-样式值键值对的对象
     * @returns {Node} 当前节点（链式调用）
     */
    setStyles(styles: Record<string, string | null | undefined>): Node;
    /**
     * 获取当前节点的完整HTML文本
     * @returns {string} HTML字符串
     */
    getHtml(): string;
}
export default Node;
