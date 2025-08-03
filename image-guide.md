# 个人网站图片添加与排版指南

## 📸 图片添加方法

### 1. 基础图片添加

#### HTML 结构
```html
<!-- 基础图片 -->
<img src="path/to/your/image.jpg" alt="图片描述" class="profile-image">

<!-- 响应式图片 -->
<img src="path/to/your/image.jpg" alt="图片描述" class="responsive-image">

<!-- 带链接的图片 -->
<a href="https://your-link.com" target="_blank">
    <img src="path/to/your/image.jpg" alt="图片描述" class="linked-image">
</a>
```

#### CSS 样式
```css
/* 基础图片样式 */
.profile-image {
    width: 200px;
    height: 200px;
    border-radius: 50%; /* 圆形头像 */
    object-fit: cover;
    border: 3px solid var(--primary);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

/* 响应式图片 */
.responsive-image {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1rem auto;
}

/* 带链接的图片 */
.linked-image {
    transition: transform 0.3s ease;
}

.linked-image:hover {
    transform: scale(1.05);
}
```

### 2. 图片网格布局

#### HTML 结构
```html
<div class="image-gallery">
    <div class="gallery-item">
        <img src="project1.jpg" alt="项目1" class="gallery-image">
        <div class="gallery-caption">项目1描述</div>
    </div>
    <div class="gallery-item">
        <img src="project2.jpg" alt="项目2" class="gallery-image">
        <div class="gallery-caption">项目2描述</div>
    </div>
    <div class="gallery-item">
        <img src="project3.jpg" alt="项目3" class="gallery-image">
        <div class="gallery-caption">项目3描述</div>
    </div>
</div>
```

#### CSS 样式
```css
/* 图片网格 */
.image-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem 0;
}

.gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: transform 0.3s ease;
}

.gallery-item:hover {
    transform: translateY(-5px);
}

.gallery-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
    display: block;
}

.gallery-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    color: white;
    padding: 1rem;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-caption {
    transform: translateY(0);
}
```

### 3. 终端风格的图片展示

#### HTML 结构
```html
<div class="terminal-image-container">
    <div class="terminal-header">
        <span class="terminal-button red"></span>
        <span class="terminal-button yellow"></span>
        <span class="terminal-button green"></span>
        <span class="terminal-title">图片预览器</span>
    </div>
    <div class="terminal-content">
        <img src="your-image.jpg" alt="图片" class="terminal-image">
        <div class="image-info">
            <p>文件名: your-image.jpg</p>
            <p>大小: 1.2MB</p>
            <p>分辨率: 1920x1080</p>
        </div>
    </div>
</div>
```

#### CSS 样式
```css
/* 终端风格图片容器 */
.terminal-image-container {
    background: var(--background);
    border: 1px solid #444;
    border-radius: 8px;
    margin: 1rem 0;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.terminal-header {
    background: #333;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.terminal-button {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.terminal-button.red { background: #ff5f56; }
.terminal-button.yellow { background: #ffbd2e; }
.terminal-button.green { background: #27ca3f; }

.terminal-title {
    margin-left: 1rem;
    color: var(--foreground);
    font-size: 0.9rem;
}

.terminal-content {
    padding: 1rem;
}

.terminal-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin-bottom: 1rem;
}

.image-info {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.8rem;
    color: var(--secondary);
}

.image-info p {
    margin: 0.2rem 0;
}
```

## 🎨 排版技巧

### 1. 响应式设计

```css
/* 移动端适配 */
@media (max-width: 768px) {
    .image-gallery {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .profile-image {
        width: 150px;
        height: 150px;
    }
    
    .terminal-image-container {
        margin: 0.5rem 0;
    }
}
```

### 2. 图片懒加载

```html
<!-- 使用 loading="lazy" 属性 -->
<img src="image.jpg" alt="描述" loading="lazy" class="lazy-image">
```

### 3. 图片优化

```css
/* 图片加载动画 */
.lazy-image {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.lazy-image.loaded {
    opacity: 1;
}
```

```javascript
// 图片加载完成后的处理
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.lazy-image');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});
```

## 📁 文件组织建议

```
your-website/
├── images/
│   ├── profile/
│   │   ├── avatar.jpg
│   │   └── avatar-mobile.jpg
│   ├── projects/
│   │   ├── project1.jpg
│   │   ├── project2.jpg
│   │   └── project3.jpg
│   ├── gallery/
│   │   ├── gallery1.jpg
│   │   └── gallery2.jpg
│   └── icons/
│       ├── github.svg
│       ├── linkedin.svg
│       └── email.svg
├── index.html
├── styles.css
└── script.js
```

## 🚀 集成到您的终端网站

### 在您的 index.html 中添加图片功能

```html
<!-- 在终端输出中添加图片展示命令 -->
<script>
// 在 processCommand 函数中添加新命令
case 'show-image':
    showImageGallery();
    break;
case 'profile-pic':
    showProfileImage();
    break;

// 添加图片展示函数
const showImageGallery = () => {
    const galleryHTML = `
<div class="terminal-image-container">
    <div class="terminal-header">
        <span class="terminal-button red"></span>
        <span class="terminal-button yellow"></span>
        <span class="terminal-button green"></span>
        <span class="terminal-title">项目图片库</span>
    </div>
    <div class="terminal-content">
        <div class="image-gallery">
            <div class="gallery-item">
                <img src="images/projects/project1.jpg" alt="项目1" class="gallery-image">
                <div class="gallery-caption">AI聊天助手</div>
            </div>
            <div class="gallery-item">
                <img src="images/projects/project2.jpg" alt="项目2" class="gallery-image">
                <div class="gallery-caption">个人网站</div>
            </div>
        </div>
    </div>
</div>
    `;
    printToTerminal(galleryHTML);
};
</script>
```

## 💡 最佳实践

1. **图片格式选择**
   - JPEG: 照片和复杂图像
   - PNG: 需要透明背景的图像
   - WebP: 现代浏览器，更好的压缩
   - SVG: 图标和简单图形

2. **图片优化**
   - 压缩图片文件大小
   - 使用适当的图片尺寸
   - 提供多种分辨率版本

3. **可访问性**
   - 始终添加 alt 属性
   - 使用描述性的文件名
   - 考虑色盲用户

4. **性能优化**
   - 使用懒加载
   - 预加载关键图片
   - 使用 CDN 加速

## 🎯 快速开始

1. 创建 `images` 文件夹
2. 添加您的图片文件
3. 在 HTML 中引用图片
4. 添加相应的 CSS 样式
5. 测试响应式效果

这样您就可以在保持终端风格的同时，优雅地展示图片内容了！ 