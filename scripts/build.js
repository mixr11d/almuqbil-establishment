import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const srcDir = path.join(rootDir, 'src');
const pagesDir = path.join(srcDir, 'pages');
const componentsDir = path.join(srcDir, 'components');
const assetsDir = path.join(srcDir, 'assets');
const dataDir = path.join(srcDir, 'data');
const imagesDir = path.join(rootDir, 'images');
const distDir = path.join(rootDir, 'dist');

const siteConfig = JSON.parse(fs.readFileSync(path.join(dataDir, 'site-config.json'), 'utf8'));

const headerTemplate = fs.readFileSync(path.join(componentsDir, 'header.html'), 'utf8');
const footerTemplate = fs.readFileSync(path.join(componentsDir, 'footer.html'), 'utf8');
const floatingButtonsTemplate = fs.readFileSync(path.join(componentsDir, 'floating-buttons.html'), 'utf8');

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    ensureDirSync(dest);
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

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

console.log('--- بدء البناء ---');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
ensureDirSync(distDir);

// نسخ الأصول والمجلدات
copyRecursiveSync(imagesDir, path.join(distDir, 'images'));
copyRecursiveSync(assetsDir, path.join(distDir, 'assets'));

const pages = getHtmlFiles(pagesDir);
const generatedUrls = [];

pages.forEach(page => {
  let rawContent = fs.readFileSync(page.fullPath, 'utf8');

  let routePath = '/' + page.relPath.replace(/\.html$/, '');
  if (routePath.endsWith('/index')) {
    routePath = routePath.replace(/\/index$/, '/');
  } else {
    routePath += '/';
  }
  if (routePath === '//') routePath = '/';

  const canonicalUrl = `${siteConfig.business.domain}${routePath}`;
  generatedUrls.push({ url: canonicalUrl, priority: routePath === '/' ? '1.0' : '0.8' });

  let activeHeader = headerTemplate.replace(
    new RegExp(`(data-path="${routePath}")`, 'g'),
    `$1 class="active" aria-current="page"`
  );

  let finalHtml = rawContent
    .replace('<!-- {{HEADER}} -->', activeHeader)
    .replace('<!-- {{FOOTER}} -->', footerTemplate)
    .replace('<!-- {{FLOATING_BUTTONS}} -->', floatingButtonsTemplate)
    .replace('<!-- {{CANONICAL_URL}} -->', canonicalUrl);

  let outputFilePath;
  if (routePath === '/') {
    outputFilePath = path.join(distDir, 'index.html');
  } else {
    const subDir = path.join(distDir, routePath.replace(/^\//, '').replace(/\/$/, ''));
    ensureDirSync(subDir);
    outputFilePath = path.join(subDir, 'index.html');
  }

  fs.writeFileSync(outputFilePath, finalHtml, 'utf8');
});

// خريطة الموقع sitemap.xml
const now = new Date().toISOString().split('T')[0];
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
generatedUrls.forEach(item => {
  sitemapContent += `  <url>\n    <loc>${item.url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${item.priority}</priority>\n  </url>\n`;
});
sitemapContent += `</urlset>`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent, 'utf8');

// نسخ ملفات التكوين وصورة الشعار الجذرية للواتساب
['_headers', '_redirects', 'robots.txt', 'logo-muqbil.jpeg'].forEach(file => {
  const srcFile = path.join(rootDir, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(distDir, file));
    console.log(`✓ تم نسخ ملف: ${file}`);
  }
});

console.log('--- اكتمل البناء بنجاح 100% ---');
