import { defineConfig } from "vite";
import { resolve } from "node:path";
import packageJson from "./package.json";
import dts from "vite-plugin-dts"; // 引入类型生成插件

// Vite 库打包核心配置
export default defineConfig({
  // 1. 基础配置：开发服务器（工具库可选，主要用于本地测试）
  server: {
    open: false, // 不自动打开浏览器
    port: 3000,
  },
  // 2. 解析配置：别名（可选，简化内部导入）
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"), // 配置 @ 指向 src
    },
  },
  // 3. 核心：库打包配置
  build: {
    // 打包产物目录（默认 dist，可修改）
    outDir: "dist",
    // 清空打包目录（Vite 4+ 默认为 true，可选）
    emptyOutDir: true,
    // 库打包模式（关键）
    lib: {
      // 库入口：必须是绝对路径（resolve 拼接）
      entry: resolve(__dirname, "lib/parse_html.ts"),
      // 库的全局变量名（UMD/IFFE 格式，浏览器 CDN 引入时可用 window.XXX 访问）
      // 建议驼峰命名，如 Vue、React、Lodash
      name: "parse_html",
      // 输出格式：数组支持多格式，推荐 ['es', 'cjs', 'umd']
      formats: ["es", "cjs", "umd"],
      // 输出文件名：[name] 为库名，[format] 为格式，可自定义
      fileName: (format) => `parse_html.${format}.js`,
    },
    // 4. Rollup 底层配置（Vite 基于 Rollup，可自定义打包规则）
    rollupOptions: {
      // 关键：排除第三方依赖（避免打包到库中，让用户自己安装）
      external: [],
      // 输出配置：UMD 格式下，外部依赖的全局变量映射（浏览器环境）
      output: {
        globals: {},
        // 可选：添加版权注释（打包后的文件头部）
        banner: `/* parse_html v${packageJson.version} | MIT License */`,
      },
    },
    // 5. 优化配置：压缩、SourceMap
    minify: "esbuild", // 生产压缩（terser 比 esbuild 更适合库，支持删除console）
    sourcemap: true, // 生成 SourceMap（方便用户调试，可选）
  },
  // 核心：添加 dts 插件配置
  plugins: [
    dts({
      tsconfigPath: resolve(__dirname, "tsconfig.json"), // 指定 tsconfig 路径（可选，默认根目录）
    }),
  ],
});
