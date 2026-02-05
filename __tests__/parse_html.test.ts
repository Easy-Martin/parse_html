import { describe, it, expect } from 'vitest';
import Node from '../lib/parse_html';

describe('Node 构造函数', () => {
  it('应该正确解析单根 HTML', () => {
    const html = '<div class="container">Hello</div>';
    const node = new Node(html);
    
    expect(node.tagName).toBe('div');
    expect(node.getAttr('class')).toBe('container');
    expect(node.textContent).toBe('Hello');
    expect(node.children).toHaveLength(0);
  });

  it('应该正确解析嵌套 HTML', () => {
    const html = '<div><p>Hello <strong>World</strong></p></div>';
    const node = new Node(html);
    
    expect(node.tagName).toBe('div');
    expect(node.children).toHaveLength(1);
    expect(node.children[0].tagName).toBe('p');
    expect(node.children[0].textContent).toBe('');
    expect(node.children[0].children).toHaveLength(2);
    expect(node.children[0].children[0].tagName).toBe('#text');
    expect(node.children[0].children[0].textContent).toBe('Hello ');
    expect(node.children[0].children[1].tagName).toBe('strong');
    expect(node.children[0].children[1].textContent).toBe('World');
  });

  it('应该正确解析多根 HTML 片段', () => {
    const html = '<p>First</p><div>Second</div><span>Third</span>';
    const node = new Node(html);
    
    expect(node.tagName).toBe('#fragment');
    expect(node.children).toHaveLength(3);
    expect(node.children[0].tagName).toBe('p');
    expect(node.children[1].tagName).toBe('div');
    expect(node.children[2].tagName).toBe('span');
  });

  it('应该正确解析自闭合标签', () => {
    const html = '<img src="test.jpg" alt="test" /><br />';
    const node = new Node(html);
    
    expect(node.tagName).toBe('#fragment');
    expect(node.children).toHaveLength(2);
    expect(node.children[0].tagName).toBe('img');
    expect(node.children[0].getAttr('src')).toBe('test.jpg');
    expect(node.children[1].tagName).toBe('br');
  });

  it('应该正确解析文本节点', () => {
    const html = 'Hello World';
    const node = new Node(html);
    
    expect(node.tagName).toBe('#text');
    expect(node.textContent).toBe('Hello World');
  });

  it('应该正确解析混合文本和标签', () => {
    const html = 'Hello <strong>World</strong>!';
    const node = new Node(html);
    
    expect(node.tagName).toBe('#fragment');
    expect(node.children).toHaveLength(3);
    expect(node.children[0].tagName).toBe('#text');
    expect(node.children[0].textContent).toBe('Hello ');
    expect(node.children[1].tagName).toBe('strong');
    expect(node.children[2].tagName).toBe('#text');
    expect(node.children[2].textContent).toBe('!');
  });

  it('应该正确处理样式属性', () => {
    const html = '<div style="color: red; font-size: 14px;">Test</div>';
    const node = new Node(html);
    
    expect(node.getStyle('color')).toBe('red');
    expect(node.getStyle('fontSize')).toBe('14px');
    expect(node.getStyle('font-size')).toBe('14px'); // 支持短横线格式
  });

  it('应该抛出错误当传入非字符串', () => {
    expect(() => new Node(123 as any)).toThrow('初始化Node必须传入HTML字符串');
  });

  it('应该抛出错误当传入空字符串', () => {
    expect(() => new Node('')).toThrow('无法解析空的HTML字符串');
  });

  it.skip('应该抛出错误当传入无效 HTML', () => {
    expect(() => new Node('<div><p>')).toThrow('无法解析无效的HTML字符串');
  });
});

describe('child() 方法', () => {
  it('应该返回子节点的浅拷贝', () => {
    const html = '<div><p>1</p><p>2</p></div>';
    const node = new Node(html);
    const children = node.child();
    
    expect(children).toHaveLength(2);
    expect(children[0].tagName).toBe('p');
    expect(children[1].tagName).toBe('p');
    
    // 验证是浅拷贝
    expect(children).not.toBe(node.children);
    expect(children[0]).toBe(node.children[0]);
  });

  it('片段节点应该返回所有根节点', () => {
    const html = '<p>First</p><div>Second</div>';
    const node = new Node(html);
    const children = node.child();
    
    expect(children).toHaveLength(2);
    expect(children[0].tagName).toBe('p');
    expect(children[1].tagName).toBe('div');
  });

  it('文本节点应该返回空数组', () => {
    const node = new Node('Hello World');
    expect(node.child()).toHaveLength(0);
  });
});

describe('before() 和 after() 方法', () => {
  it('应该在当前节点之前插入新节点', () => {
    const parent = new Node('<div><p>Original</p></div>');
    const child = parent.children[0];
    
    child.before('<span>Before</span>');
    
    expect(parent.children).toHaveLength(2);
    expect(parent.children[0].tagName).toBe('span');
    expect(parent.children[0].textContent).toBe('Before');
    expect(parent.children[1].tagName).toBe('p');
  });

  it('应该在当前节点之后插入新节点', () => {
    const parent = new Node('<div><p>Original</p></div>');
    const child = parent.children[0];
    
    child.after('<span>After</span>');
    
    expect(parent.children).toHaveLength(2);
    expect(parent.children[0].tagName).toBe('p');
    expect(parent.children[1].tagName).toBe('span');
    expect(parent.children[1].textContent).toBe('After');
  });

  it('应该支持链式调用', () => {
    const parent = new Node('<div><p>Original</p></div>');
    const child = parent.children[0];
    
    const result = child.before('<span>Before</span>');
    expect(result).toBe(child);
  });

  it('应该抛出错误当没有父节点', () => {
    const node = new Node('<div>Test</div>');
    expect(() => node.before('<span>Test</span>')).toThrow('当前节点没有父节点');
  });
});

describe('insert() 方法', () => {
  it('应该在指定位置插入新节点', () => {
    const node = new Node('<div></div>');
    
    node.insert(0, '<span>First</span>');
    node.insert(1, '<span>Second</span>');
    node.insert(0, '<span>Zero</span>');
    
    expect(node.children).toHaveLength(3);
    expect(node.children[0].textContent).toBe('Zero');
    expect(node.children[1].textContent).toBe('First');
    expect(node.children[2].textContent).toBe('Second');
  });

  it('应该正确处理片段节点的插入', () => {
    const node = new Node('<div></div>');
    const fragment = new Node('<p>1</p><span>2</span>');
    
    node.insert(0, fragment);
    
    expect(node.children).toHaveLength(2);
    expect(node.children[0].tagName).toBe('p');
    expect(node.children[1].tagName).toBe('span');
  });

  it('应该抛出错误当位置无效', () => {
    const node = new Node('<div></div>');
    
    expect(() => node.insert(-1, '<span>Test</span>')).toThrow('插入位置-1无效');
    expect(() => node.insert(2, '<span>Test</span>')).toThrow('插入位置2无效');
  });
});

describe('属性操作方法', () => {
  it('getAttr() 应该返回属性值', () => {
    const node = new Node('<div id="test" class="container"></div>');
    
    expect(node.getAttr('id')).toBe('test');
    expect(node.getAttr('class')).toBe('container');
    expect(node.getAttr('nonexistent')).toBeNull();
  });

  it('getAttr() 对片段和文本节点返回 null', () => {
    const fragment = new Node('<p>1</p><div>2</div>');
    const text = new Node('Hello');
    
    expect(fragment.getAttr('id')).toBeNull();
    expect(text.getAttr('id')).toBeNull();
  });

  it('setAttr() 应该设置属性', () => {
    const node = new Node('<div></div>');
    
    node.setAttr('id', 'test');
    expect(node.getAttr('id')).toBe('test');
    
    node.setAttr('data-test', 'value');
    expect(node.getAttr('data-test')).toBe('value');
  });

  it('setAttr() 应该删除属性当值为 null 或 undefined', () => {
    const node = new Node('<div id="test" class="container"></div>');
    
    node.setAttr('id', null);
    expect(node.getAttr('id')).toBeNull();
    
    node.setAttr('class', undefined);
    expect(node.getAttr('class')).toBeNull();
  });

  it('setAttr() 应该支持链式调用', () => {
    const node = new Node('<div></div>');
    const result = node.setAttr('id', 'test');
    expect(result).toBe(node);
  });

  it('setAttr() 应该对片段和文本节点抛出错误', () => {
    const fragment = new Node('<p>1</p><div>2</div>');
    const text = new Node('Hello');
    
    expect(() => fragment.setAttr('id', 'test')).toThrow('片段/文本节点不支持设置属性');
    expect(() => text.setAttr('id', 'test')).toThrow('片段/文本节点不支持设置属性');
  });

  it('setAttrs() 应该批量设置属性', () => {
    const node = new Node('<div></div>');
    
    node.setAttrs({
      'id': 'test',
      'class': 'container',
      'data-value': '123',
      'data-remove': null
    });
    
    expect(node.getAttr('id')).toBe('test');
    expect(node.getAttr('class')).toBe('container');
    expect(node.getAttr('data-value')).toBe('123');
    expect(node.getAttr('data-remove')).toBeNull();
  });

  it('setAttrs() 应该支持链式调用', () => {
    const node = new Node('<div></div>');
    const result = node.setAttrs({ 'id': 'test' });
    expect(result).toBe(node);
  });
});

describe('样式操作方法', () => {
  it('getStyle() 应该返回样式值', () => {
    const node = new Node('<div style="color: red; font-size: 14px;"></div>');
    
    expect(node.getStyle('color')).toBe('red');
    expect(node.getStyle('fontSize')).toBe('14px');
    expect(node.getStyle('font-size')).toBe('14px');
    expect(node.getStyle('background-color')).toBeNull();
  });

  it('getStyle() 对片段和文本节点返回 null', () => {
    const fragment = new Node('<p>1</p><div>2</div>');
    const text = new Node('Hello');
    
    expect(fragment.getStyle('color')).toBeNull();
    expect(text.getStyle('color')).toBeNull();
  });

  it('setStyle() 应该设置样式', () => {
    const node = new Node('<div></div>');
    
    node.setStyle('color', 'red');
    expect(node.getStyle('color')).toBe('red');
    
    node.setStyle('font-size', '14px');
    expect(node.getStyle('fontSize')).toBe('14px');
    expect(node.getStyle('font-size')).toBe('14px');
  });

  it('setStyle() 应该删除样式当值为 null 或 undefined', () => {
    const node = new Node('<div style="color: red;"></div>');
    
    expect(node.getStyle('color')).toBe('red');
    node.setStyle('color', null);
    expect(node.getStyle('color')).toBeNull();
  });

  it('setStyle() 应该支持链式调用', () => {
    const node = new Node('<div></div>');
    const result = node.setStyle('color', 'red');
    expect(result).toBe(node);
  });

  it('setStyle() 应该对片段和文本节点抛出错误', () => {
    const fragment = new Node('<p>1</p><div>2</div>');
    const text = new Node('Hello');
    
    expect(() => fragment.setStyle('color', 'red')).toThrow('片段/文本节点不支持设置样式');
    expect(() => text.setStyle('color', 'red')).toThrow('片段/文本节点不支持设置样式');
  });

  it('setStyles() 应该批量设置样式', () => {
    const node = new Node('<div></div>');
    
    node.setStyles({
      'color': 'red',
      'font-size': '14px',
      'backgroundColor': '#fff',
      'margin': null
    });
    
    expect(node.getStyle('color')).toBe('red');
    expect(node.getStyle('fontSize')).toBe('14px');
    expect(node.getStyle('backgroundColor')).toBe('#fff');
    expect(node.getStyle('margin')).toBeNull();
  });

  it('setStyles() 应该支持链式调用', () => {
    const node = new Node('<div></div>');
    const result = node.setStyles({ 'color': 'red' });
    expect(result).toBe(node);
  });
});

describe('getHtml() 方法', () => {
  it('应该生成正确的 HTML', () => {
    const html = '<div id="test" class="container" style="color: red;">Hello</div>';
    const node = new Node(html);
    
    expect(node.getHtml()).toBe('<div id="test" class="container" style="color: red">Hello</div>');
  });

  it('应该处理嵌套 HTML', () => {
    const html = '<div><p>Hello <strong>World</strong></p></div>';
    const node = new Node(html);
    
    expect(node.getHtml()).toBe('<div><p>Hello <strong>World</strong></p></div>');
  });

  it('应该处理自闭合标签', () => {
    const html = '<img src="test.jpg" alt="test" />';
    const node = new Node(html);
    
    expect(node.getHtml()).toBe('<img src="test.jpg" alt="test"/>');
  });

  it('应该处理文本节点', () => {
    const node = new Node('Hello World');
    expect(node.getHtml()).toBe('Hello World');
  });

  it('应该处理片段节点', () => {
    const html = '<p>First</p><div>Second</div>';
    const node = new Node(html);
    
    expect(node.getHtml()).toBe('<p>First</p><div>Second</div>');
  });

  it('应该转义属性值中的双引号', () => {
    const node = new Node('<div data-test="test"></div>');
    node.setAttr('data-value', 'Hello "World"');
    
    expect(node.getHtml()).toContain('data-value="Hello &quot;World&quot;"');
  });

  it('应该保持样式属性的一致性', () => {
    const node = new Node('<div></div>');
    node.setStyle('color', 'red');
    node.setStyle('fontSize', '14px');
    
    const html = node.getHtml();
    expect(html).toContain('style="');
    expect(html).toContain('color: red');
    expect(html).toContain('font-size: 14px');
  });
});

describe('复杂场景', () => {
  it('应该处理复杂的 DOM 操作', () => {
    const container = new Node('<div class="container"></div>');
    
    // 插入多个子节点
    container.insert(0, '<p>Paragraph 1</p>');
    container.insert(1, '<p>Paragraph 2</p>');
    
    // 修改第一个段落的属性
    const firstPara = container.children[0];
    firstPara.setAttrs({
      'id': 'para1',
      'class': 'paragraph highlight'
    });
    firstPara.setStyles({
      'color': 'blue',
      'font-weight': 'bold'
    });
    
    // 在第二个段落前插入新元素
    const secondPara = container.children[1];
    secondPara.before('<span>Inserted</span>');
    
    // 验证结果
    expect(container.children).toHaveLength(3);
    expect(firstPara.getAttr('id')).toBe('para1');
    expect(firstPara.getStyle('color')).toBe('blue');
    expect(container.children[1].tagName).toBe('span');
    
    // 验证生成的 HTML
    const html = container.getHtml();
    expect(html).toContain('class="container"');
    expect(html).toContain('class="paragraph highlight"');
    expect(html).toContain('style="color: blue; font-weight: bold"');
    expect(html).toContain('<span>Inserted</span>');
  });

  it('应该正确处理片段节点的展开', () => {
    const container = new Node('<div></div>');
    const fragment = new Node('<p>A</p><span>B</span>');
    
    container.insert(0, fragment);
    
    expect(container.children).toHaveLength(2);
    expect(container.children[0].tagName).toBe('p');
    expect(container.children[1].tagName).toBe('span');
    expect(container.children[0].parent).toBe(container);
    expect(container.children[1].parent).toBe(container);
  });
});