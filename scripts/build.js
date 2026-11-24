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
const baseDomain = String(siteConfig.business.domain || '').replace(/\/+$/, '');

const headerTemplate = fs.readFileSync(path.join(componentsDir, 'header.html'), 'utf8');
const footerTemplate = fs.readFileSync(path.join(componentsDir, 'footer.html'), 'utf8');
const floatingButtonsTemplate = fs.readFileSync(path.join(componentsDir, 'floating-buttons.html'), 'utf8');

// قراءة معرّف Google Ads مركزياً من src/assets/js/ads-config.js
let googleAdsId = '';
const adsConfigPath = path.join(assetsDir, 'js', 'ads-config.js');
if (fs.existsSync(adsConfigPath)) {
  const adsConfigRaw = fs.readFileSync(adsConfigPath, 'utf8');
  const idMatch = adsConfigRaw.match(/conversionId\s*:\s*['"]([^'"]+)['"]/);
  if (idMatch && idMatch[1] && idMatch[1].trim().startsWith('AW-')) {
    googleAdsId = idMatch[1].trim();
  }
}

const googleAdsHeadSnippet = googleAdsId
  ? `<!-- Google tag (gtag.js) - حقن مركزي تلقائي من ads-config.js -->\n  <script async src="https://www.googletagmanager.com/gtag/js?id=${googleAdsId}"></script>\n  <script>\n    window.dataLayer = window.dataLayer || [];\n    function gtag(){dataLayer.push(arguments);}\n    gtag('js', new Date());\n    gtag('config', '${googleAdsId}');\n  </script>`
  : '';

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

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  const rawContent = fs.readFileSync(page.fullPath, 'utf8');
  const is404 = page.relPath === '404.html';

  let routePath = '/' + page.relPath.replace(/\.html$/, '');
  if (routePath.endsWith('/index')) {
    routePath = routePath.replace(/\/index$/, '/');
  } else {
    routePath += '/';
  }
  if (routePath === '//') routePath = '/';

  const canonicalUrl = is404 ? `${baseDomain}/404.html` : `${baseDomain}${routePath}`;
  if (!is404) {
    generatedUrls.push({ url: canonicalUrl, priority: routePath === '/' ? '1.0' : '0.8' });
  }

  let activeHeader = headerTemplate;
  if (!is404) {
    const linkRegex = new RegExp(`(<[^>]*data-path="${escapeRegExp(routePath)}"[^>]*>)`, 'g');
    activeHeader = headerTemplate.replace(linkRegex, tag => {
      let updatedTag = tag;
      if (/class=["'][^"']*["']/.test(updatedTag)) {
        updatedTag = updatedTag.replace(/class=(["'])([^"']*)\1/, 'class=$1$2 active$1');
      } else {
        updatedTag = updatedTag.replace(/>$/, ' class="active">');
      }
      if (!/aria-current=/.test(updatedTag)) {
        updatedTag = updatedTag.replace(/>$/, ' aria-current="page">');
      }
      return updatedTag;
    });
  }

  let finalHtml = rawContent
    .replaceAll('<!-- {{HEADER}} -->', activeHeader)
    .replaceAll('<!-- {{FOOTER}} -->', footerTemplate)
    .replaceAll('<!-- {{FLOATING_BUTTONS}} -->', floatingButtonsTemplate)
    .replaceAll('<!-- {{CANONICAL_URL}} -->', canonicalUrl);

  // إزالة أي كود Google Ads (gtag.js) مكتوب يدوياً داخل الصفحة لمنع التكرار أو بقاء معرّف قديم
  finalHtml = finalHtml
    .replace(/<!--\s*Google tag \(gtag\.js\)[^>]*-->\s*/gi, '')
    .replace(/<script[^>]*src=["']https?:\/\/www\.googletagmanager\.com\/gtag\/js[^"']*["'][^>]*><\/script>\s*/gi, '')
    .replace(/<script>\s*window\.dataLayer\s*=\s*window\.dataLayer[\s\S]*?gtag\(\s*['"]config['"][\s\S]*?<\/script>\s*/gi, '');

  // حقن كود Google Ads الموحد في <head> تلقائياً
  if (finalHtml.includes('<!-- {{GOOGLE_ADS_HEAD}} -->')) {
    finalHtml = finalHtml.replaceAll('<!-- {{GOOGLE_ADS_HEAD}} -->', googleAdsHeadSnippet);
  } else if (googleAdsHeadSnippet && finalHtml.includes('</head>')) {
    finalHtml = finalHtml.replace('</head>', `  ${googleAdsHeadSnippet}\n</head>`);
  }

  // توحيد استدعاء ملفات التتبع والتفاعل قبل </body> ومنع تكرارها في جميع الصفحات
  finalHtml = finalHtml
    .replace(/<script[^>]*src=["']\/assets\/js\/ads-config\.js["'][^>]*><\/script>\s*/gi, '')
    .replace(/<script[^>]*src=["']\/assets\/js\/tracking\.js["'][^>]*><\/script>\s*/gi, '')
    .replace(/<script[^>]*src=["']\/assets\/js\/site\.js["'][^>]*><\/script>\s*/gi, '');

  const coreScripts = [
    '<script src="/assets/js/ads-config.js"></script>',
    '<script src="/assets/js/tracking.js"></script>',
    '<script src="/assets/js/site.js"></script>'
  ].join('\n  ');

  if (finalHtml.includes('</body>')) {
    finalHtml = finalHtml.replace('</body>', `  ${coreScripts}\n</body>`);
  }

  let outputFilePath;
  if (is404) {
    outputFilePath = path.join(distDir, '404.html');
  } else if (routePath === '/') {
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
