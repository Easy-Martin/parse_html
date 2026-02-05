import Node from "./lib/parse_html";
// ------------------------------ 测试示例（含多根节点） ------------------------------
try {
  // 1. 测试单根节点（原有逻辑）
  const singleRootHtml = `
    <div class="container" id="main" style="color: red; background-color: #fff;">
      <p>Hello World</p>
      <img src="test.jpg" alt="test" />
    </div>
  `;
  const singleRootNode = new Node(singleRootHtml);
  console.log("单根节点HTML:", singleRootNode.getHtml());

  // 2. 测试多根节点（新增支持）
  const multiRootHtml = `
    <p>第一段文本</p>
    <div class="box" style="font-size: 14px;">第二段内容</div>
    <span>第三段</span>
  `;
  const multiRootNode = new Node(multiRootHtml);
  console.log("多根节点类型:", multiRootNode.tagName); // 输出：#fragment
  console.log("多根节点子节点数:", multiRootNode.child().length); // 输出：3
  console.log("多根节点HTML:", multiRootNode.getHtml()); // 输出拼接后的完整HTML

  // 3. 测试片段插入（符合DOM标准，展开子节点）
  const parentNode = new Node('<div id="parent"></div>');
  parentNode.insert(0, multiRootHtml);
  console.log("插入片段后子节点数:", parentNode.child().length); // 输出：3

  // 4. 测试属性/样式操作（片段节点保护）
  console.log("片段节点获取属性:", multiRootNode.getAttr("class")); // 输出：null
  console.log("单根节点样式:", singleRootNode.getStyle("backgroundColor")); // 输出：#fff
} catch (error) {
  console.error("测试出错:", (error as Error).message);
}
