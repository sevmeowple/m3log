# m3log

一个基于简单易用的日志协议的多平台日志工具，使用 Tauri + SvelteKit + TypeScript 构建。

<img width="1184" alt="image" src="https://github.com/user-attachments/assets/0b0fa536-6173-49e3-8706-76099b3f9494" />


## 项目介绍

m3log 是一个遵循自定义日志协议标准的日志查看和分析工具。该工具提供简洁的用户界面，支持多平台运行，能够高效处理和分析日志数据。

## 协议标准

本项目基于 m3log 协议标准（版本 0.1.0）构建，该协议具有以下特点：

- 简单的文本格式：`@时间戳 [标签列表] #日志级别: 消息内容`
- 支持多标签分类和过滤
- 标准日志级别：DEBUG、INFO、WARN、ERROR、FATAL
- UTF-8 编码，简单明确的转义规则

更多详情请查看 [协议标准文档](./v1.md)

示例logger输出实现见 [m3log-impl](https://github.com/sevmeowple/m3log-impl)

## 开发环境设置

- [VS Code](https://code.visualstudio.com/)
- [Svelte 插件](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [Tauri 插件](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 安装与运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建生产版本
npm run tauri build
```

## TODO 列表

- [x] 实现基础日志解析功能
  - [x] 解析时间戳
  - [x] 解析标签列表
  - [x] 解析日志级别
  - [x] 解析消息内容

- [x] 用户界面开发
  - [ ] 日志条目列表视图
  - [x] 标签过滤器
  - [x] 日志级别过滤
  - [ ] 时间范围选择器

- [x] 核心功能
  - [x] 实时日志追踪
  - [ ] 日志搜索
  - [ ] 标签统计和分析
  - [ ] 导出功能

- [ ] 文档
  - [ ] 完善用户指南
  - [ ] API 文档
  - [ ] 示例和最佳实践

## 贡献

欢迎提交 Pull Requests 和 Issues！

## 许可

[MIT](LICENSE)
