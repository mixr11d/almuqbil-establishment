/**
 * محرك تتبع التحويلات المركزي الشامل - مؤسسة المقبل
 * يعتمد كلياً على القيم والعملات المحددة داخل حساب إعلانات Google Ads
 */

(function () {
  'use strict';

  // 1. التحقق من وجود ملف الإعدادات المركزي
  if (!window.ADS_CONFIG || !window.ADS_CONFIG.isEnabled) {
    return;
  }

  const G_ID = window.ADS_CONFIG.conversionId;

  // 2. تهيئة dataLayer و دالة gtag المركزية
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', G_ID);

  // 3. حقن سكربت قوقل الرسمي تلقائياً في هيدر أي صفحة تفتح
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(G_ID)}`;
  (document.head || document.documentElement).appendChild(script);

  // 4. منع تكرار التحويل المزدوج السريع
  const firedEvents = new Set();

  function sendConversion(labelKey) {
    const label = window.ADS_CONFIG.labels[labelKey];
    if (!label) return;

    const signature = `${labelKey}_${label}`;
    if (firedEvents.has(signature)) return;
    firedEvents.add(signature);
    setTimeout(() => firedEvents.delete(signature), 2000);

    // إرسال الإحالة فقط (وقوقل سيطبق القيمة والعملة المحددة في حسابك تلقائياً)
    window.gtag('event', 'conversion', {
      send_to: `${G_ID}/${label}`
    });
  }

  // 5. مراقبة ونقر جميع روابط الموقع تلقائياً (اتصال + واتساب)
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;

    // استثناء أرقام المطور
    const href = link.getAttribute('href') || link.href || '';
    if (href.includes('966578539687') || href.includes('0578539687') || link.hasAttribute('data-no-track')) {
      return;
    }

    // تتبع أي اتصال في أي صفحة
    if (href.startsWith('tel:')) {
      sendConversion('call');
      return;
    }

    // تتبع أي واتساب في أي صفحة
    if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      sendConversion('whatsapp');
      return;
    }
  }, true);

  // 6. واجهة تتبع إرسال النموذج بنجاح
  window.reportFormSuccess = function () {
    sendConversion('form');
  };

})();
