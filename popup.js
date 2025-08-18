// Instagram Photo Analyzer - Popup Script

class PopupController {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.attachEventListeners();
    this.updateStatus();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        enabled: true,
        showOnHover: true,
        histogramType: 'rgb'
      });
      this.settings = result;
      
      // 更新UI
      document.getElementById('enableAnalyzer').checked = this.settings.enabled;
    } catch (error) {
      console.error('加载设置失败:', error);
      this.settings = { enabled: true, showOnHover: true, histogramType: 'rgb' };
    }
  }

  attachEventListeners() {
    // 启用/禁用分析器
    document.getElementById('enableAnalyzer').addEventListener('change', (e) => {
      this.settings.enabled = e.target.checked;
      this.saveSettings();
      this.updateStatus();
      this.notifyContentScript();
    });
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set(this.settings);
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }

  updateStatus() {
    const statusElement = document.getElementById('status');
    if (this.settings.enabled) {
      statusElement.textContent = '✅ 分析器已启用';
      statusElement.className = 'status active';
    } else {
      statusElement.textContent = '❌ 分析器已禁用';
      statusElement.className = 'status inactive';
    }
  }

  async notifyContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url.includes('instagram.com')) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: this.settings
        });
      }
    } catch (error) {
      console.error('通知内容脚本失败:', error);
    }
  }

  // 检查当前标签页是否为Instagram
  async checkInstagramPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab && tab.url.includes('instagram.com');
    } catch (error) {
      return false;
    }
  }
}

// 当弹出窗口加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// 添加一些统计信息显示
document.addEventListener('DOMContentLoaded', async () => {
  // 检查是否在Instagram页面
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isInstagram = tab && tab.url.includes('instagram.com');
  
  if (!isInstagram) {
    // 如果不在Instagram页面，显示提示
    const instructionsElement = document.querySelector('.instructions');
    instructionsElement.innerHTML = `
      <strong style="color: #ffeb3b;">⚠️ 注意:</strong><br>
      请先访问 Instagram.com 使用此工具<br><br>
      <strong>使用方法:</strong><br>
      1. 访问 Instagram.com<br>
      2. 将鼠标悬停在任何图片上<br>
      3. 查看自动显示的分析面板
    `;
  }
});
