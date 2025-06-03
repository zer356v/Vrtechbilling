import React, { useRef, useEffect } from 'react';

const Chart = ({ type, data, options = {}, height = 300 }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (type === 'line') {
      drawLineChart(ctx, data, canvas.width, canvas.height);
    } else if (type === 'bar') {
      drawBarChart(ctx, data, canvas.width, canvas.height);
    } else if (type === 'pie') {
      drawPieChart(ctx, data, canvas.width, canvas.height);
    } else if (type === 'doughnut') {
      drawDoughnutChart(ctx, data, canvas.width, canvas.height);
    }
    
  }, [type, data, options, canvasRef]);
  
  // Basic line chart drawing function (simplified)
  const drawLineChart = (ctx, data, width, height) => {
    const { labels, datasets } = data;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    // Find max value
    let maxValue = 0;
    datasets.forEach(dataset => {
      const max = Math.max(...dataset.data);
      if (max > maxValue) maxValue = max;
    });
    maxValue = Math.ceil(maxValue / 10000) * 10000;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.strokeStyle = '#ddd';
    ctx.stroke();
    
    // Draw horizontal grid lines
    const gridCount = 5;
    ctx.textAlign = 'right';
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    
    for (let i = 0; i <= gridCount; i++) {
      const y = padding + (graphHeight / gridCount) * i;
      const value = Math.round(maxValue - (maxValue / gridCount) * i);
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.strokeStyle = '#eee';
      ctx.stroke();
      
      ctx.fillText(value.toLocaleString(), padding - 10, y + 4);
    }
    
    // Draw labels on x-axis
    ctx.textAlign = 'center';
    const xStep = graphWidth / (labels.length - 1);
    labels.forEach((label, i) => {
      const x = padding + xStep * i;
      ctx.fillText(label, x, height - padding + 20);
    });
    
    // Draw datasets
    datasets.forEach(dataset => {
      const { data: points, borderColor, backgroundColor, fill, tension } = dataset;
      ctx.beginPath();
      
      points.forEach((value, i) => {
        const x = padding + (graphWidth / (points.length - 1)) * i;
        const y = height - padding - (value / maxValue) * graphHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      if (fill) {
        ctx.lineTo(padding + graphWidth, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.fillStyle = backgroundColor;
        ctx.fill();
      }
    });
  };
  
  // Basic bar chart drawing function (simplified)
  const drawBarChart = (ctx, data, width, height) => {
    const { labels, datasets } = data;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    // Find max value
    let maxValue = 0;
    datasets.forEach(dataset => {
      const max = Math.max(...dataset.data);
      if (max > maxValue) maxValue = max;
    });
    maxValue = Math.ceil(maxValue / 10) * 10;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.strokeStyle = '#ddd';
    ctx.stroke();
    
    // Draw grid lines
    const gridCount = 5;
    ctx.textAlign = 'right';
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    
    for (let i = 0; i <= gridCount; i++) {
      const y = padding + (graphHeight / gridCount) * i;
      const value = Math.round(maxValue - (maxValue / gridCount) * i);
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.strokeStyle = '#eee';
      ctx.stroke();
      
      ctx.fillText(value, padding - 10, y + 4);
    }
    
    // Draw bars
    const barWidth = graphWidth / labels.length / datasets.length;
    const padding2 = barWidth * 0.2;
    
    datasets.forEach((dataset, datasetIndex) => {
      const { data: values, backgroundColor } = dataset;
      
      values.forEach((value, i) => {
        const x = padding + i * (graphWidth / labels.length) + datasetIndex * barWidth;
        const barHeight = (value / maxValue) * graphHeight;
        const y = height - padding - barHeight;
        
        ctx.fillStyle = Array.isArray(backgroundColor) ? backgroundColor[i] : backgroundColor;
        ctx.fillRect(x + padding2, y, barWidth - padding2 * 2, barHeight);
      });
    });
    
    // Draw labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#666';
    labels.forEach((label, i) => {
      const x = padding + i * (graphWidth / labels.length) + (graphWidth / labels.length) / 2;
      ctx.fillText(label, x, height - padding + 20);
    });
  };
  
  // Basic pie chart drawing function (simplified)
  const drawPieChart = (ctx, data, width, height) => {
    const { labels, datasets } = data;
    const values = datasets[0].data;
    const colors = datasets[0].backgroundColor;
    const total = values.reduce((acc, val) => acc + val, 0);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    let startAngle = 0;
    
    // Draw pie slices
    values.forEach((value, i) => {
      const sliceAngle = 2 * Math.PI * value / total;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      // Draw labels
      const midAngle = startAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(midAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(midAngle) * (radius * 0.7);
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '12px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${Math.round(value / total * 100)}%`, labelX, labelY);
      
      startAngle += sliceAngle;
    });
    
    // Draw legend
    const legendX = width - 100;
    const legendY = 40;
    
    ctx.textAlign = 'left';
    ctx.font = '12px Arial';
    
    labels.forEach((label, i) => {
      const y = legendY + i * 25;
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legendX, y, 15, 15);
      
      ctx.fillStyle = '#666';
      ctx.fillText(label, legendX + 25, y + 12);
    });
  };
  
  // Basic doughnut chart (simplified)
  const drawDoughnutChart = (ctx, data, width, height) => {
    const { labels, datasets } = data;
    const values = datasets[0].data;
    const colors = datasets[0].backgroundColor;
    const total = values.reduce((acc, val) => acc + val, 0);
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 40;
    const innerRadius = outerRadius * 0.6;
    
    let startAngle = 0;
    
    // Draw doughnut slices
    values.forEach((value, i) => {
      const sliceAngle = 2 * Math.PI * value / total;
      
      ctx.beginPath();
      ctx.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      startAngle += sliceAngle;
    });
    
    // Draw center content
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '20px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`${total}`, centerX, centerY);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Total', centerX, centerY + 25);
    
    // Draw legend
    const legendX = width - 100;
    const legendY = 40;
    
    ctx.textAlign = 'left';
    ctx.font = '12px Arial';
    
    labels.forEach((label, i) => {
      const y = legendY + i * 25;
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legendX, y, 15, 15);
      
      ctx.fillStyle = '#666';
      ctx.fillText(label, legendX + 25, y + 12);
    });
  };

  return (
    <div className="rounded-lg p-4 bg-white shadow-md ">
      <canvas ref={canvasRef} height={height} className="min-w-full" />
    </div>
  );
};

export default Chart;