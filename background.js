// Instagram Photo Analyzer - Background Script

class BackgroundService {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    console.log('Instagram Photo Analyzer background service started');
  }

  setupEventListeners() {
    // 处理扩展安装
    chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
    
    // 处理标签页更新
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
    
    // 处理来自content script的消息
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  async handleInstall(details) {
    if (details.reason === 'install') {
      console.log('Instagram Photo Analyzer installed');
      
      // 设置默认设置
      await chrome.storage.sync.set({
        enabled: true,
        showOnHover: true,
        histogramType: 'rgb',
        installDate: Date.now()
      });
      
      // 打开欢迎页面或使用说明
      this.showWelcome();
    } else if (details.reason === 'update') {
      console.log('Instagram Photo Analyzer updated');
      this.handleUpdate();
    }
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    // 当标签页更新且是Instagram页面时，确保content script正常工作
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('instagram.com')) {
      // 可以在这里注入额外的脚本或进行其他处理
      this.ensureContentScriptLoaded(tabId);
    }
  }

  async ensureContentScriptLoaded(tabId) {
    try {
      // 尝试ping content script
      const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      if (!response) {
        // Content script未响应，可能需要重新注入
        console.log('Content script not responding, re-injecting...');
      }
    } catch (error) {
      // Content script可能未加载，这是正常的
      console.log('Content script not loaded yet:', error);
    }
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'ping':
        sendResponse({ status: 'pong' });
        break;
        
      case 'getSettings':
        this.getSettings().then(sendResponse);
        return true; // 异步响应
        
      case 'updateSettings':
        this.updateSettings(message.settings).then(() => {
          sendResponse({ success: true });
        });
        return true;
        
      case 'logAnalysis':
        this.logAnalysis(message.data);
        break;
        
      default:
        console.log('Unknown message action:', message.action);
    }
  }

  async getSettings() {
    try {
      const settings = await chrome.storage.sync.get({
        enabled: true,
        showOnHover: true,
        histogramType: 'rgb'
      });
      return settings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return { enabled: true, showOnHover: true, histogramType: 'rgb' };
    }
  }

  async updateSettings(newSettings) {
    try {
      await chrome.storage.sync.set(newSettings);
      
      // 通知所有Instagram标签页设置已更新
      const tabs = await chrome.tabs.query({ url: '*://*.instagram.com/*' });
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'settingsUpdated',
          settings: newSettings
        }).catch(() => {
          // 忽略无法发送消息的标签页
        });
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }

  logAnalysis(data) {
    // 记录分析数据用于统计（可选）
    console.log('Image analysis completed:', data);
  }

  showWelcome() {
    // 显示欢迎信息或打开使用说明页面
    chrome.tabs.create({
      url: 'https://instagram.com',
      active: true
    });
  }

  handleUpdate() {
    // 处理扩展更新逻辑
    console.log('Extension updated, checking for new features...');
  }
}

// 初始化后台服务
new BackgroundService();
