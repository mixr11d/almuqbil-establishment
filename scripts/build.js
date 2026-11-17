/**
 * محرك البناء والتوليد والفحص الذاتي لموقع مؤسسة العتيق
 * Pure Vanilla Node.js SSG Engine
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// مسارات المجلدات الرئيسية
const srcDir = path.join(rootDir, 'src');
const pagesDir = path.join(srcDir, 'pages');
const componentsDir = path.join(srcDir, 'components');
const assetsDir = path.join(srcDir, 'assets');
const dataDir = path.join(srcDir, 'data');
const imagesDir = path.join(rootDir, 'images');
const distDir = path.join(rootDir, 'dist');

// قراءة الإعدادات المركزية
const siteConfig = JSON.parse(fs.readFileSync(path.join(dataDir, 'site-config.json'), 'utf8'));

// قراءة المكونات المشتركة
const headerTemplate = fs.readFileSync(path.join(componentsDir, 'header.html'), 'utf8');
const footerTemplate = fs.readFileSync(path.join(componentsDir, 'footer.html'), 'utf8');
const floatingButtonsTemplate = fs.readFileSync(path.join(componentsDir, 'floating-buttons.html'), 'utf8');

// قائمة الصور المعتمدة للتحقق الصارم
const recognizedImages = new Set([
  'logo-muqbil_result.webp',
  'muqbil-homepage-1_result.webp',
  'muqbil-homepage-2_result.webp',
  'muqbil-homepage-3_result.webp',
  'muqbil-homepage-4_result.webp',
  'muqbil-homepage-5_result.webp',
  'muqbil-homepage-6_result.webp',
  'chipboard-alternative-5_result.webp',
  'chipboard-alternative-6_result.webp',
  'chipboard-alternative-7_result.webp',
  'chipboard-alternative-8_result.webp',
  'chipboard-alternative-9_result.webp',
  'chipboard-alternative-10_result.webp',
  'chipboard-alternative-25_result.webp',
  'chipboard-alternative-26_result.webp',
  'chipboard-alternative-28_result.webp',
  'chipboard-alternative(1)_result_result_result.webp',
  'chipboard-alternative(14)_result_result_result.webp',
  'chipboard-alternative-24_result_result.webp',
  'marble-alternative-4_result_result.webp',
  'marble-alternative-02_result.webp',
  'marble-alternative-2_result_result.webp',
  'marble-alternative-03_result.webp',
  'marble-alternative-3_result_result.webp',
  'marble-alternative-04_result.webp',
  'marble-alternative-05_result.webp',
  'marble-alternative-7_result_result.webp',
  'marble-alternative-8_result_result.webp',
  'marble-alternative-01_result.webp',
  'marble-alternative_result_result_result.webp',
  'marble-alternative-1_result_result.webp',
  'herringbone-parquet-7_result_result_result.webp',
  'herringbone-parquet-8_result_result_result.webp',
  'spc-parquet-1_result_result_result.webp',
  'spc-parquet-2_result_result_result.webp',
  'spc-parquet-3_result_result_result.webp',
  'spc-parquet-4_result_result_result.webp',
  'spc-parquet-5_result_result_result.webp',
  'spc-parquet-6_result_result_result.webp',
  'spc-parquet-7_result_result_result.webp',
  'spc-parquet-8_result_result_result.webp',
  'spc-parquet-9_result_result_result.webp',
  'spc-parquet-10_result_result_result.webp',
  'foam-frames-02_result.webp',
  'foam-frames(3)_result_result.webp',
  'foam-frames(1).jpeg',
  'foam-frames(2).jpeg',
  'foam-frames(4).jpeg',
  'foam-frames(5).jpeg',
  'foam-frames(6).jpeg',
  'foam-frames(1).jpg',
  'foam-frames(2).jpg',
  'foam-frames-02.jpeg',
  'foam-frames-01.jpeg',
  'renovation-finishing-6_result.webp',
  'renovation-finishing-9_result.webp',
  'renovation-finishing-12.webp',
  'renovation-finishing-9.jpeg',
  'renovation-finishing-2.jpg',
  'renovation-finishing-3.jpg',
  'renovation-finishing-4.jpg',
  'renovation-finishing-5.jpg',
  'renovation-finishing-6.jpg',
  'renovation-finishing-7.jpg',
  'interior-painting-2_result.webp',
  'interior-painting-6_result.webp',
  'interior-painting(1)_result.webp',
  'interior-painting(2)_result.webp',
  'interior-painting-13_result_result.webp',
  'interior-painting-14_result_result.webp',
  'interior-painting-15_result.webp',
  'interior-painting-16_result.webp',
  'interior-painting-17_result.webp',
  'interior-painting-18_result.webp',
  'interior-painting-13_result.webp',
  'Exterior-Painting(3)_result_result_result_result.webp',
  'Exterior-Painting(1)_result_result.webp',
  'Exterior-Painting(2)_result_result.webp',
  'exterior-painting-11_result.webp',
  'Exterior-Painting(4)_result_result.webp',
  'exterior-painting-14_result.webp',
  'Exterior-Painting(6).jpeg',
  'Exterior-Painting(8)_result_result.webp',
  'exterior-painting-13.jpeg',
  'exterior-painting-12.jpeg',
  'gypsum-8.webp',
  'gypsum-5.webp',
  'gypsum-6.webp',
  'gypsum-7.webp',
  'gypsum-2.webp',
  'gypsum-3.webp',
  'gypsum-4.webp',
  'Gypsum-Partitions(8).jpg',
  'tv-wall-gypsum(5)_result.webp',
  'tv-wall-gypsum(6)_result.webp',
  'tv-wall-gypsum(7)_result.webp',
  'tv-wall-gypsum(8)_result.webp',
  'wood-alternative-7_result.webp',
  'wood-alternative-3.webp',
  'wood-alternative-6.webp',
  'wood-alternative-4.webp',
  'wood-alternative.jpg',
  'wood-alternative-3_result_result.webp',
  'wood-alternative-6.jpg',
  'wood-alternative-7.jpg',
  'wood-alternative-5.jpg',
  'wood-alternative-8.jpg',
  'wood-alternative-2.jpg',
  'wood-alternative-3.jpg',
  'wood-decor-13.jpeg',
  'wood-decor-7.jpeg',
  'wood-decor-1.jpeg',
  'wood-decor-2.jpeg',
  'wood-decor-3.jpeg',
  'wood-decor-4.jpeg',
  'wood-decor-5.jpeg',
  'wood-decor-6.jpeg',
  'wood-decor-8.jpeg',
  'wood-decor-16.jpeg',
  'linen-wallpaper-1_result.webp',
  'wallpaper-5_result_result.webp',
  'wallpaper-installation-1_result_result.webp',
  'wallpaper-installation-2_result_result.webp',
  'wallpaper-installation-3_result_result.webp',
  'linen-wallpaper-5_result_result.webp',
  'linen-wallpaper-6_result_result.webp',
  'linen-wallpaper-7_result_result.webp',
  'linen-wallpaper-9_result_result.webp',
  'linen-wallpaper-10_result_result.webp',
  '3d-wallpaper-7_result.webp',
  '3d-wallpaper-5_result.webp',
  '3d-wallpaper-6_result.webp',
  '3d-wallpaper-9_result.webp',
  '3d-wallpaper-4_result.webp',
  '3d-wallpaper-2_result.webp'
]);

// دوال مساعدة لإنشاء ونسخ المجلدات
function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    ensureDirSync(dest);
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
}

// دالة فحص الصور المستخدمة في محتوى الصفحة
function validateImagesInContent(content, filePath) {
  const imgRegex = /src=["']\/?images\/([^"']+)["']/g;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const imageName = match[1];
    if (!recognizedImages.has(imageName)) {
      console.warn(`[تحذير صورة]: الصورة "${imageName}" في الملف "${filePath}" ليست ضمن القائمة المعتمدة.`);
    }
  }
}

// مسح واكتشاف جميع ملفات الصفحات داخل src/pages
function getHtmlFiles(dir, baseDir = '') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const relPath = path.join(baseDir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath, relPath));
    } else if (file.endsWith('.html')) {
      results.push({ fullPath, relPath: relPath.replace(/\\/g, '/') });
    }
  });
  return results;
}

// البدء في عملية البناء
console.log('--- بدء عملية البناء الفعلي لموقع مؤسسة العتيق ---');

// 1. تنظيف وتجهيز مجلد dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
ensureDirSync(distDir);

// 2. نسخ مجلد الصور كاملاً إلى dist/images
if (fs.existsSync(imagesDir)) {
  copyRecursiveSync(imagesDir, path.join(distDir, 'images'));
  console.log('✓ تم نسخ مجلد images كاملاً إلى dist/images');
} else {
  console.log('ℹ ملاحظة: مجلد images غير متواجد محلياً في الجذر الآن، سيتم جلبه عند النشر في المستودع.');
}

// 3. نسخ الأصول (assets) إلى dist/assets
if (fs.existsSync(assetsDir)) {
  copyRecursiveSync(assetsDir, path.join(distDir, 'assets'));
  console.log('✓ تم نسخ مجلد assets إلى dist/assets');
}

// 4. معالجة الصفحات وتوليد HTML النهائي
const pages = getHtmlFiles(pagesDir);
const generatedUrls = [];

pages.forEach(page => {
  let rawContent = fs.readFileSync(page.fullPath, 'utf8');

  // التحقق الصارم من الصور
  validateImagesInContent(rawContent, page.relPath);

  // تحديد المسار النظيف والـ Canonical
  let routePath = '/' + page.relPath.replace(/\.html$/, '');
  if (routePath.endsWith('/index')) {
    routePath = routePath.replace(/\/index$/, '/');
  } else {
    routePath += '/';
  }
  if (routePath === '//') routePath = '/';

  const canonicalUrl = `${siteConfig.business.domain}${routePath}`;
  generatedUrls.push({ url: canonicalUrl, priority: routePath === '/' ? '1.0' : '0.8' });

  // تمييز الرابط النشط في الهيدر برمجياً
  let activeHeader = headerTemplate.replace(
    new RegExp(`(data-path="${routePath}")`, 'g'),
    `$1 class="active" aria-current="page"`
  );

  // تجميع الصفحة الكاملة
  let finalHtml = rawContent
    .replace('<!-- {{HEADER}} -->', activeHeader)
    .replace('<!-- {{FOOTER}} -->', footerTemplate)
    .replace('<!-- {{FLOATING_BUTTONS}} -->', floatingButtonsTemplate)
    .replace('<!-- {{CANONICAL_URL}} -->', canonicalUrl);

  // تحديد مسار الإخراج النظيف
  let outputFilePath;
  if (routePath === '/') {
    outputFilePath = path.join(distDir, 'index.html');
  } else {
    const subDir = path.join(distDir, routePath.replace(/^\//, '').replace(/\/$/, ''));
    ensureDirSync(subDir);
    outputFilePath = path.join(subDir, 'index.html');
  }

  fs.writeFileSync(outputFilePath, finalHtml, 'utf8');
  console.log(`✓ تم توليد الصفحة: ${routePath} -> ${path.relative(rootDir, outputFilePath)}`);
});

// 5. توليد sitemap.xml تلقائياً بالدومين المعتمد
const now = new Date().toISOString().split('T')[0];
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

generatedUrls.forEach(item => {
  sitemapContent += `  <url>\n`;
  sitemapContent += `    <loc>${item.url}</loc>\n`;
  sitemapContent += `    <lastmod>${now}</lastmod>\n`;
  sitemapContent += `    <changefreq>weekly</changefreq>\n`;
  sitemapContent += `    <priority>${item.priority}</priority>\n`;
  sitemapContent += `  </url>\n`;
});
sitemapContent += `</urlset>`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent, 'utf8');
console.log('✓ تم توليد خريطة الموقع sitemap.xml بنجاح');

// 6. نسخ ملفات التكوين الثابتة إلى dist
const rootConfigs = ['robots.txt', '_headers', '_redirects'];
rootConfigs.forEach(file => {
  const srcFile = path.join(rootDir, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(distDir, file));
    console.log(`✓ تم نسخ ملف التكوين: ${file}`);
  }
});

console.log('--- اكتملت عملية البناء بنجاح 100% ---');
