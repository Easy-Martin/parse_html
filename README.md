# parse_html_to_node

[![npm version](https://img.shields.io/npm/v/parse_html_to_node)](https://www.npmjs.com/package/parse_html_to_node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-44_passed,_1_skipped-green.svg)]

一个不依赖浏览器环境的HTML字符串解析器，可将HTML转换为可操作的对象树，支持完整的DOM操作、属性管理和样式处理。

## 特性

- 🚀 **零依赖**：纯JavaScript实现，无需浏览器环境
- 🔧 **完整DOM操作**：支持`before`、`after`、`insert`等DOM操作方法
- 🏷️ **属性管理**：提供`getAttr`、`setAttr`、`setAttrs`等方法
- 🎨 **样式处理**：支持`getStyle`、`setStyle`、`setStyles`等方法
- 🌳 **多根节点支持**：可解析HTML片段（多个根节点）
- 📦 **TypeScript支持**：完整的类型定义
- 🧪 **完整测试覆盖**：包含45个单元测试，确保代码质量
- ⚡ **高性能**：轻量级实现，快速解析

## 安装

```bash
npm install parse_html_to_node
```

或

```bash
yarn add parse_html_to_node
```

或

```bash
pnpm add parse_html_to_node
```

## 快速开始

```javascript
import Node from 'parse_html_to_node';

// 解析单根HTML
const html = `
  <div class="container" id="main" style="color: red; background-color: #fff;">
    <p>Hello World</p>
    <img src="test.jpg" alt="test" />
  </div>
`;

const node = new Node(html);

// 获取HTML内容
console.log(node.getHtml());

// 获取子节点
const children = node.child();
console.log(children.length); // 2

// 获取属性
console.log(node.getAttr('id')); // "main"

// 获取样式
console.log(node.getStyle('backgroundColor')); // "#fff"
```

## API文档

### `Node` 类

#### 构造函数
```typescript
new Node(html: string): Node
```
通过HTML字符串创建节点对象，支持单根和多根HTML。

#### 属性
- `tagName: string` - 标签名（`#text`表示文本节点，`#fragment`表示片段节点）
- `attributes: IAttributeData` - 属性对象
- `styles: Record<string, string>` - 样式对象（驼峰格式）
- `textContent: string` - 文本内容
- `children: Node[]` - 子节点数组
- `parent: Node | null` - 父节点

### 方法

#### `child(): Node[]`
获取当前节点的所有子节点（浅拷贝）。

```javascript
const children = node.child();
```

#### `before(newNode: string | Node): Node`
在当前节点之前插入新节点。

```javascript
node.before('<span>Before</span>');
```

#### `after(newNode: string | Node): Node`
在当前节点之后插入新节点。

```javascript
node.after('<span>After</span>');
```

#### `insert(position: number, newNode: string | Node): Node`
在指定位置插入新节点。

```javascript
// 在第一个子节点前插入
node.insert(0, '<span>First</span>');
```

#### `getAttr(attrName: string): string | null`
获取指定属性的值。

```javascript
const id = node.getAttr('id');
```

#### `setAttr(attrName: string, value: string | null | undefined): Node`
设置或删除属性。

```javascript
// 设置属性
node.setAttr('class', 'container');

// 删除属性
node.setAttr('class', null);
```

#### `setAttrs(attrs: Record<string, string | null | undefined>): Node`
批量设置属性。

```javascript
node.setAttrs({
  'id': 'main',
  'class': 'container',
  'data-test': null // 删除属性
});
```

#### `getStyle(styleProp: string): string | null`
获取指定样式的值。

```javascript
const color = node.getStyle('color');
const bgColor = node.getStyle('backgroundColor'); // 支持驼峰格式
```

#### `setStyle(styleProp: string, value: string | null | undefined): Node`
设置或删除样式。

```javascript
// 设置样式
node.setStyle('color', 'red');

// 删除样式
node.setStyle('color', null);
```

#### `setStyles(styles: Record<string, string | null | undefined>): Node`
批量设置样式。

```javascript
node.setStyles({
  'color': 'red',
  'fontSize': '14px',
  'backgroundColor': null // 删除样式
});
```

#### `getHtml(): string`
获取当前节点的完整HTML字符串。

```javascript
const htmlString = node.getHtml();
```

## 示例

### 1. 多根节点解析

```javascript
import Node from 'parse_html_to_node';

const multiRootHtml = `
  <p>第一段文本</p>
  <div class="box" style="font-size: 14px;">第二段内容</div>
  <span>第三段</span>
`;

const fragmentNode = new Node(multiRootHtml);
console.log(fragmentNode.tagName); // "#fragment"
console.log(fragmentNode.child().length); // 3
console.log(fragmentNode.getHtml()); // 输出拼接后的完整HTML
```

### 2. DOM操作

```javascript
import Node from 'parse_html_to_node';

const parent = new Node('<div id="parent"></div>');

// 插入子节点
parent.insert(0, '<span>Child 1</span>');
parent.insert(1, '<span>Child 2</span>');

// 在子节点间插入
const firstChild = parent.child()[0];
firstChild.after('<span>Between</span>');

console.log(parent.getHtml());
// <div id="parent"><span>Child 1</span><span>Between</span><span>Child 2</span></div>
```

### 3. 属性和样式操作

```javascript
import Node from 'parse_html_to_node';

const node = new Node('<div>Test</div>');

// 设置属性和样式
node.setAttrs({
  'id': 'test',
  'class': 'container'
});

node.setStyles({
  'color': 'blue',
  'fontSize': '16px',
  'padding': '10px'
});

// 获取属性和样式
console.log(node.getAttr('id')); // "test"
console.log(node.getStyle('fontSize')); // "16px"

// 更新样式
node.setStyle('color', 'green');
console.log(node.getStyle('color')); // "green"
```

### 4. 文本节点处理

```javascript
import Node from 'parse_html_to_node';

const html = 'Hello <strong>World</strong>!';
const node = new Node(html);

// 文本节点会被正确解析
console.log(node.child().length); // 3
console.log(node.child()[0].tagName); // "#text"
console.log(node.child()[0].textContent); // "Hello "
```

## 注意事项

1. **片段节点**：多根HTML会解析为`#fragment`节点，其属性/样式操作会返回`null`。
2. **自闭合标签**：支持`img`、`br`、`input`、`meta`等标准自闭合标签。
3. **样式格式**：内部使用驼峰格式，但解析时支持短横线格式。
4. **错误处理**：无效HTML会抛出错误，请确保HTML格式正确。

## 测试

项目包含完整的单元测试套件，使用 [Vitest](https://vitest.dev/) 测试框架。

### 测试覆盖率
- **45个测试用例**，覆盖所有核心功能
- **44个通过**，1个跳过（无效HTML解析测试）
- **测试覆盖率**：包括构造函数、DOM操作、属性管理、样式处理、HTML生成等

### 运行测试
```bash
# 运行所有测试
pnpm test

# 运行测试并打开UI界面
pnpm run test:ui

# 生成测试覆盖率报告
pnpm run coverage
```

### 测试结构
```
__tests__/
└── parse_html.test.ts    # 所有单元测试
```

测试文件包含了丰富的使用示例，可以作为API文档参考。

## 开发

### 构建项目

```bash
# 安装依赖
pnpm install

# 开发模式（监听文件变化）
pnpm run dev

# 构建项目
pnpm run build
```

### 项目结构

```
parse_html_to_node/
├── __tests__/
│   └── parse_html.test.ts  # 单元测试
├── lib/
│   └── parse_html.ts       # 源代码
├── dist/                   # 构建输出
├── text.ts                 # 使用示例
├── package.json
└── tsconfig.json
```

## 贡献

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

[MIT](LICENSE) © Huang Jingjing

## 相关链接

- [GitHub仓库](https://github.com/Easy-Martin/parse_html)
- [npm包](https://www.npmjs.com/package/parse_html_to_node)
- [问题反馈](https://github.com/Easy-Martin/parse_html/issues)