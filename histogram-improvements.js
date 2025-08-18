// Instagram Photo Analyzer - 改进的直方图绘制方案

// 方案1: 专业的混合模式直方图
function drawProfessionalHistogram(canvas, histogram) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // 清空画布，使用深色专业背景
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(1, '#0d1117');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 找到全局最大值用于归一化
  const maxRed = Math.max(...histogram.red);
  const maxGreen = Math.max(...histogram.green); 
  const maxBlue = Math.max(...histogram.blue);
  const maxValue = Math.max(maxRed, maxGreen, maxBlue);
  
  if (maxValue === 0) return;
  
  const barWidth = width / 256;
  
  // 使用additive混合模式绘制更专业的直方图
  ctx.globalCompositeOperation = 'screen'; // 叠加模式，更好的混合效果
  
  // 绘制平滑的直方图曲线而不是矩形条
  const smoothness = 2; // 平滑因子
  
  // 红色通道 - 使用更柔和的红色
  ctx.strokeStyle = 'rgba(255, 99, 99, 0.9)';
  ctx.fillStyle = 'rgba(255, 99, 99, 0.3)';
  ctx.lineWidth = 1.5;
  drawSmoothHistogramChannel(ctx, histogram.red, maxValue, width, height, smoothness);
  
  // 绿色通道 - 使用更柔和的绿色
  ctx.strokeStyle = 'rgba(99, 255, 99, 0.9)';
  ctx.fillStyle = 'rgba(99, 255, 99, 0.3)';
  drawSmoothHistogramChannel(ctx, histogram.green, maxValue, width, height, smoothness);
  
  // 蓝色通道 - 使用更柔和的蓝色
  ctx.strokeStyle = 'rgba(99, 99, 255, 0.9)';
  ctx.fillStyle = 'rgba(99, 99, 255, 0.3)';
  drawSmoothHistogramChannel(ctx, histogram.blue, maxValue, width, height, smoothness);
  
  // 重置混合模式
  ctx.globalCompositeOperation = 'source-over';
  
  // 绘制更清晰的网格
  drawProfessionalGrid(ctx, width, height);
  
  // 添加通道标识
  drawChannelLabels(ctx, width, height);
}

function drawSmoothHistogramChannel(ctx, channelData, maxValue, width, height, smoothness) {
  const barWidth = width / 256;
  
  // 创建路径用于填充
  ctx.beginPath();
  ctx.moveTo(0, height);
  
  // 绘制平滑曲线
  for (let i = 0; i < 256; i++) {
    const x = i * barWidth;
    const normalizedHeight = (channelData[i] / maxValue) * height;
    const y = height - normalizedHeight;
    
    if (i === 0) {
      ctx.lineTo(x, y);
    } else {
      // 使用二次贝塞尔曲线平滑连接点
      const prevX = (i - 1) * barWidth;
      const prevY = height - (channelData[i - 1] / maxValue) * height;
      const cpX = (prevX + x) / 2;
      ctx.quadraticCurveTo(cpX, prevY, x, y);
    }
  }
  
  // 完成填充路径
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
  
  // 绘制边缘线
  ctx.beginPath();
  ctx.moveTo(0, height - (channelData[0] / maxValue) * height);
  for (let i = 1; i < 256; i++) {
    const x = i * barWidth;
    const y = height - (channelData[i] / maxValue) * height;
    const prevX = (i - 1) * barWidth;
    const prevY = height - (channelData[i - 1] / maxValue) * height;
    const cpX = (prevX + x) / 2;
    ctx.quadraticCurveTo(cpX, prevY, x, y);
  }
  ctx.stroke();
}

function drawProfessionalGrid(ctx, width, height) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 2]); // 虚线网格更专业
  
  // 水平网格线 - 更多分割线
  for (let i = 1; i < 5; i++) {
    const y = (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // 垂直网格线 - 代表关键的亮度区域
  const keyPoints = [64, 128, 192]; // 阴影、中间调、高光
  keyPoints.forEach(point => {
    const x = (point / 256) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  });
  
  ctx.setLineDash([]); // 重置虚线
}

function drawChannelLabels(ctx, width, height) {
  ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'right';
  
  // RGB标签
  ctx.fillStyle = 'rgba(255, 99, 99, 0.8)';
  ctx.fillText('R', width - 5, 15);
  
  ctx.fillStyle = 'rgba(99, 255, 99, 0.8)';
  ctx.fillText('G', width - 5, 27);
  
  ctx.fillStyle = 'rgba(99, 99, 255, 0.8)';
  ctx.fillText('B', width - 5, 39);
  
  // 底部刻度标签
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'center';
  ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
  
  // 关键数值
  const labels = [
    { value: 0, label: '0' },
    { value: 64, label: '64' },
    { value: 128, label: '128' },
    { value: 192, label: '192' },
    { value: 255, label: '255' }
  ];
  
  labels.forEach(({ value, label }) => {
    const x = (value / 256) * width;
    ctx.fillText(label, x, height - 2);
  });
}

// 方案2: 分离式三通道显示
function drawSeparatedChannelHistogram(canvas, histogram) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // 背景
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);
  
  const maxValue = Math.max(
    Math.max(...histogram.red),
    Math.max(...histogram.green),
    Math.max(...histogram.blue)
  );
  
  if (maxValue === 0) return;
  
  const channelHeight = height / 3;
  const barWidth = width / 256;
  
  // 绘制三个分离的通道
  const channels = [
    { data: histogram.red, color: 'rgba(255, 120, 120, 0.8)', y: 0 },
    { data: histogram.green, color: 'rgba(120, 255, 120, 0.8)', y: channelHeight },
    { data: histogram.blue, color: 'rgba(120, 120, 255, 0.8)', y: channelHeight * 2 }
  ];
  
  channels.forEach(({ data, color, y }) => {
    ctx.fillStyle = color;
    for (let i = 0; i < 256; i++) {
      const x = i * barWidth;
      const barHeight = (data[i] / maxValue) * (channelHeight - 2);
      ctx.fillRect(x, y + channelHeight - barHeight - 1, barWidth, barHeight);
    }
    
    // 分割线
    if (y > 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  });
}

// 方案3: Photoshop风格的直方图
function drawPhotoshopStyleHistogram(canvas, histogram) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Photoshop风格的背景
  ctx.fillStyle = '#2d2d2d';
  ctx.fillRect(0, 0, width, height);
  
  const maxValue = Math.max(
    Math.max(...histogram.red),
    Math.max(...histogram.green),
    Math.max(...histogram.blue)
  );
  
  if (maxValue === 0) return;
  
  const barWidth = width / 256;
  
  // 绘制亮度直方图作为基础
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 256; i++) {
    const x = i * barWidth;
    const luminance = Math.round(
      histogram.red[i] * 0.299 +
      histogram.green[i] * 0.587 +
      histogram.blue[i] * 0.114
    );
    const barHeight = (luminance / maxValue) * height;
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
  }
  
  // 叠加RGB通道
  ctx.globalCompositeOperation = 'overlay';
  
  const channels = [
    { data: histogram.red, color: 'rgba(255, 0, 0, 0.5)' },
    { data: histogram.green, color: 'rgba(0, 255, 0, 0.5)' },
    { data: histogram.blue, color: 'rgba(0, 0, 255, 0.5)' }
  ];
  
  channels.forEach(({ data, color }) => {
    ctx.fillStyle = color;
    for (let i = 0; i < 256; i++) {
      const x = i * barWidth;
      const barHeight = (data[i] / maxValue) * height;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    }
  });
  
  ctx.globalCompositeOperation = 'source-over';
  
  // 添加专业网格
  drawProfessionalGrid(ctx, width, height);
}
