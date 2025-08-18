# 🤝 Contributing to Instagram Photo Analyzer

感谢您对Instagram Photo Analyzer项目的关注！我们欢迎所有形式的贡献。

## 🔧 开发环境设置

1. **Fork本仓库**到您的GitHub账户
2. **Clone您的Fork**：
   ```bash
   git clone https://github.com/YOUR_USERNAME/instagram-photo-analyzer.git
   cd instagram-photo-analyzer
   ```
3. **加载扩展程序**：
   - 打开Chrome浏览器
   - 访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"并选择项目文件夹

## 📋 贡献类型

### 🐛 Bug报告
如果您发现了bug，请[创建Issue](../../issues)并包含：
- 详细的bug描述
- 复现步骤
- 预期行为 vs 实际行为
- 浏览器版本和操作系统
- 如果可能，请提供截图

### ✨ 功能请求
我们欢迎新功能建议！请[创建Issue](../../issues)并说明：
- 功能的详细描述
- 使用场景和目标用户
- 可能的实现方案（如果有想法）

### 🔀 代码贡献
1. **创建Issue**讨论您要实现的功能
2. **创建分支**：`git checkout -b feature/your-feature-name`
3. **编写代码**并遵循现有代码风格
4. **测试您的更改**在多个Instagram页面上
5. **提交更改**：`git commit -m "Add: your feature description"`
6. **推送分支**：`git push origin feature/your-feature-name`
7. **创建Pull Request**

## 💻 代码规范

### JavaScript代码风格
- 使用2个空格缩进
- 使用camelCase命名变量和函数
- 使用PascalCase命名类
- 添加适当的注释解释复杂逻辑
- 保持函数简洁，单一职责

### 提交信息规范
使用清晰的提交信息：
- `Add: 新功能描述`
- `Fix: 修复的问题描述`
- `Update: 更新的内容描述`
- `Refactor: 重构的部分描述`

## 🧪 测试

在提交PR之前，请确保：
- [ ] 扩展程序可以正常加载
- [ ] 在Instagram主页上功能正常
- [ ] 在Instagram个人页面上功能正常
- [ ] 在Instagram Story查看页面上功能正常
- [ ] 开关按钮正常工作
- [ ] 设置面板正常工作
- [ ] 没有控制台错误

## 📁 项目结构

```
instagram-photo-analyzer/
├── manifest.json          # Chrome扩展配置
├── content.js             # 内容脚本（核心功能）
├── content.css            # 样式文件
├── popup.html             # 扩展弹窗界面
├── popup.js              # 弹窗逻辑
├── background.js         # 后台服务工作者
├── icons/                # 扩展图标
├── generate-icons.html   # 图标生成工具
├── README.md             # 项目说明
├── INSTALL.md           # 安装指南
└── CONTRIBUTING.md      # 贡献指南
```

## 🎯 优先级功能

我们特别欢迎以下方面的贡献：

### 高优先级
- [ ] Firefox浏览器兼容性改进
- [ ] 性能优化（特别是大图片处理）
- [ ] 更多色彩分析功能（HSV、LAB色彩空间）
- [ ] 快捷键支持

### 中优先级
- [ ] 更好的UI/UX设计
- [ ] 多语言支持（英语、日语、韩语等）
- [ ] 导出分析结果功能
- [ ] 批量分析模式

### 低优先级
- [ ] 其他社交媒体平台支持
- [ ] 高级统计功能
- [ ] 云同步设置

## 🚀 发布流程

维护者会定期发布新版本：
1. 收集和审查所有PR
2. 更新版本号
3. 创建GitHub Release
4. 更新Chrome Web Store
5. 更新Firefox Add-ons

## 📞 联系方式

- 通过GitHub Issues报告问题或建议
- 通过Pull Request提交代码
- 在Discussions中进行技术讨论

## 📄 许可证

通过贡献代码，您同意您的贡献将在MIT许可证下发布。

---

再次感谢您的贡献！每一个PR都让这个工具变得更好。 🙏
