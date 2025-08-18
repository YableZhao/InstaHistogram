// Instagram Photo Analyzer - Content Script
class InstagramPhotoAnalyzer {
  constructor() {
    this.activeAnalyzer = null;
    this.init();
  }

  init() {
    console.log('Instagram Photo Analyzer initialized');
    this.injectStyles();
    this.attachEventListeners();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .photo-analyzer-overlay {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        z-index: 9999;
        min-width: 250px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .photo-analyzer-toggle {
        position: fixed;
        top: 100px;
        right: 20px;
        background: #ff3040;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 25px;
        cursor: pointer;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(255, 48, 64, 0.3);
        transition: all 0.3s ease;
      }
      
      .photo-analyzer-toggle:hover {
        background: #e02d3c;
        transform: translateY(-2px);
      }
      
      .histogram-container {
        margin: 10px 0;
      }
      
      .histogram-canvas {
        width: 200px;
        height: 100px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
      }
      
      .color-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 8px;
      }
      
      .info-item {
        display: flex;
        justify-content: space-between;
      }
      
      .info-label {
        opacity: 0.8;
      }
      
      .info-value {
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }

  attachEventListeners() {
    // 创建分析开关按钮
    this.createToggleButton();
    
    // 监听鼠标移动以检测图片悬停
    document.addEventListener('mouseover', (e) => {
      if (this.isEnabled && this.isInstagramImage(e.target)) {
        this.showAnalysis(e.target);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (this.isInstagramImage(e.target)) {
        this.hideAnalysis();
      }
    });
  }

  createToggleButton() {
    const button = document.createElement('button');
    button.textContent = '📊 分析';
    button.className = 'photo-analyzer-toggle';
    button.onclick = () => this.toggleAnalyzer();
    document.body.appendChild(button);
    
    // 默认启用
    this.isEnabled = true;
  }

  toggleAnalyzer() {
    this.isEnabled = !this.isEnabled;
    const button = document.querySelector('.photo-analyzer-toggle');
    button.textContent = this.isEnabled ? '📊 分析' : '📊 关闭';
    button.style.background = this.isEnabled ? '#ff3040' : '#666';
    
    if (!this.isEnabled) {
      this.hideAnalysis();
    }
  }

  isInstagramImage(element) {
    // 检测Instagram的图片元素
    return element.tagName === 'IMG' && 
           (element.closest('article') || 
            element.closest('[role="dialog"]') ||
            element.src?.includes('instagram') ||
            element.src?.includes('cdninstagram'));
  }

  async showAnalysis(imgElement) {
    try {
      // 移除之前的分析面板
      this.hideAnalysis();
      
      // 创建分析面板
      const overlay = document.createElement('div');
      overlay.className = 'photo-analyzer-overlay';
      overlay.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold;">📊 图片分析</div>
        <div class="histogram-container">
          <div style="margin-bottom: 5px;">RGB 直方图:</div>
          <canvas class="histogram-canvas" width="200" height="100"></canvas>
        </div>
        <div class="color-info">
          <div class="info-item">
            <span class="info-label">平均亮度:</span>
            <span class="info-value" id="brightness">计算中...</span>
          </div>
          <div class="info-item">
            <span class="info-label">对比度:</span>
            <span class="info-value" id="contrast">计算中...</span>
          </div>
          <div class="info-item">
            <span class="info-label">色温:</span>
            <span class="info-value" id="colorTemp">计算中...</span>
          </div>
          <div class="info-item">
            <span class="info-label">饱和度:</span>
            <span class="info-value" id="saturation">计算中...</span>
          </div>
        </div>
      `;

      // 定位分析面板
      const container = imgElement.closest('article') || imgElement.parentElement;
      if (container) {
        container.style.position = 'relative';
        container.appendChild(overlay);
        this.activeAnalyzer = overlay;

        // 分析图片
        await this.analyzeImage(imgElement, overlay);
      }
    } catch (error) {
      console.error('分析图片时出错:', error);
    }
  }

  hideAnalysis() {
    if (this.activeAnalyzer) {
      this.activeAnalyzer.remove();
      this.activeAnalyzer = null;
    }
  }

  async analyzeImage(imgElement, overlay) {
    try {
      // 创建canvas来分析图片
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 等待图片加载完成
      await this.waitForImageLoad(imgElement);
      
      // 设置canvas尺寸
      const maxSize = 400; // 限制分析图片大小以提高性能
      const ratio = Math.min(maxSize / imgElement.naturalWidth, maxSize / imgElement.naturalHeight);
      canvas.width = imgElement.naturalWidth * ratio;
      canvas.height = imgElement.naturalHeight * ratio;

      // 绘制图片到canvas
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
      
      // 获取图片数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 分析图片数据
      const analysis = this.performImageAnalysis(data);
      
      // 绘制直方图
      this.drawHistogram(overlay.querySelector('.histogram-canvas'), analysis.histogram);
      
      // 更新信息显示
      overlay.querySelector('#brightness').textContent = `${analysis.brightness}%`;
      overlay.querySelector('#contrast').textContent = analysis.contrast.toFixed(1);
      overlay.querySelector('#colorTemp').textContent = `${analysis.colorTemp}K`;
      overlay.querySelector('#saturation').textContent = `${analysis.saturation}%`;
      
    } catch (error) {
      console.error('图片分析失败:', error);
      overlay.innerHTML = '<div style="color: #ff6b6b;">分析失败</div>';
    }
  }

  waitForImageLoad(img) {
    return new Promise((resolve, reject) => {
      if (img.complete && img.naturalHeight !== 0) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = reject;
        // 5秒超时
        setTimeout(() => reject(new Error('图片加载超时')), 5000);
      }
    });
  }

  performImageAnalysis(data) {
    const histogram = {
      red: new Array(256).fill(0),
      green: new Array(256).fill(0),
      blue: new Array(256).fill(0),
      luminance: new Array(256).fill(0)
    };

    let totalR = 0, totalG = 0, totalB = 0;
    let totalPixels = data.length / 4;
    let minLum = 255, maxLum = 0;

    // 计算直方图和基础统计信息
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      histogram.red[r]++;
      histogram.green[g]++;
      histogram.blue[b]++;
      
      // 计算亮度 (使用标准亮度公式)
      const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      histogram.luminance[luminance]++;
      
      totalR += r;
      totalG += g;
      totalB += b;
      
      minLum = Math.min(minLum, luminance);
      maxLum = Math.max(maxLum, luminance);
    }

    // 计算平均值
    const avgR = totalR / totalPixels;
    const avgG = totalG / totalPixels;
    const avgB = totalB / totalPixels;
    const avgLuminance = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114);

    // 计算色温 (简化公式)
    const colorTemp = this.calculateColorTemperature(avgR, avgG, avgB);
    
    // 计算饱和度
    const saturation = this.calculateSaturation(avgR, avgG, avgB);
    
    // 计算对比度
    const contrast = (maxLum - minLum) / 255 * 100;

    return {
      histogram,
      brightness: Math.round(avgLuminance / 255 * 100),
      contrast: contrast,
      colorTemp: Math.round(colorTemp),
      saturation: Math.round(saturation * 100),
      averageColor: { r: avgR, g: avgG, b: avgB }
    };
  }

  calculateColorTemperature(r, g, b) {
    // 简化的色温计算，基于RGB比例
    const ratio = r / (g + b);
    if (ratio > 1.0) {
      return 2000 + (ratio - 1.0) * 3000; // 暖色调
    } else {
      return 6500 + (1.0 - ratio) * 3500; // 冷色调
    }
  }

  calculateSaturation(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === 0) return 0;
    return (max - min) / max;
  }

  drawHistogram(canvas, histogram) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Lightroom风格背景 - 深灰色带边框
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制边框
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
    
    // 内部工作区域
    const margin = 2;
    const workWidth = width - margin * 2;
    const workHeight = height - margin * 2;
    
    // 找到全局最大值用于归一化
    const maxRed = Math.max(...histogram.red);
    const maxGreen = Math.max(...histogram.green); 
    const maxBlue = Math.max(...histogram.blue);
    const maxValue = Math.max(maxRed, maxGreen, maxBlue);
    
    if (maxValue === 0) return;
    
    // 绘制简洁的网格 (Lightroom风格)
    this.drawLightroomGrid(ctx, margin, workWidth, workHeight);
    
    // 使用Lightroom风格的RGB混合
    ctx.globalCompositeOperation = 'lighten';
    
    // RGB通道 - 使用Adobe风格的颜色
    this.drawAdobeHistogramChannel(ctx, histogram.red, maxValue, margin, workWidth, workHeight, 'rgba(255, 64, 64, 0.8)');
    this.drawAdobeHistogramChannel(ctx, histogram.green, maxValue, margin, workWidth, workHeight, 'rgba(64, 255, 64, 0.8)');
    this.drawAdobeHistogramChannel(ctx, histogram.blue, maxValue, margin, workWidth, workHeight, 'rgba(64, 64, 255, 0.8)');
    
    // 重置混合模式
    ctx.globalCompositeOperation = 'source-over';
    
    // 绘制高光区域溢出警告 (类似Lightroom)
    this.drawClippingWarnings(ctx, histogram, maxValue, margin, workWidth, workHeight);
  }

  drawLightroomGrid(ctx, margin, width, height) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    
    // 只绘制几条关键的垂直网格线 (Lightroom风格简洁网格)
    const divisions = 4;
    for (let i = 1; i < divisions; i++) {
      const x = margin + (width / divisions) * i;
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, margin + height);
      ctx.stroke();
    }
  }

  drawAdobeHistogramChannel(ctx, channelData, maxValue, margin, width, height, color) {
    ctx.fillStyle = color;
    const barWidth = width / 256;
    
    // Lightroom风格的填充直方图
    ctx.beginPath();
    ctx.moveTo(margin, margin + height);
    
    for (let i = 0; i < 256; i++) {
      const x = margin + i * barWidth;
      const barHeight = (channelData[i] / maxValue) * height;
      const y = margin + height - barHeight;
      
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.lineTo(margin + width, margin + height);
    ctx.closePath();
    ctx.fill();
  }

  drawClippingWarnings(ctx, histogram, maxValue, margin, width, height) {
    const barWidth = width / 256;
    
    // 检查阴影剪切 (纯黑区域)
    const shadowClipping = histogram.red[0] + histogram.green[0] + histogram.blue[0];
    if (shadowClipping > maxValue * 0.02) { // 超过2%的像素在纯黑
      ctx.fillStyle = 'rgba(0, 100, 200, 0.3)'; // 蓝色警告
      ctx.fillRect(margin, margin, barWidth * 5, height);
    }
    
    // 检查高光剪切 (纯白区域)  
    const highlightClipping = histogram.red[255] + histogram.green[255] + histogram.blue[255];
    if (highlightClipping > maxValue * 0.02) { // 超过2%的像素在纯白
      ctx.fillStyle = 'rgba(255, 50, 50, 0.3)'; // 红色警告
      ctx.fillRect(margin + width - barWidth * 5, margin, barWidth * 5, height);
    }
  }
}

// 初始化分析器
const analyzer = new InstagramPhotoAnalyzer();
