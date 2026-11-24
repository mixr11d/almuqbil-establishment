/**
 * محرك تتبع التحويلات المركزي الشامل - مؤسسة المقبل
 * يعتمد كلياً على القيم والعملات المحددة داخل حساب إعلانات Google Ads
 */

(function () {
  'use strict';

  // 1. التحقق من وجود ملف الإعدادات المركزي وصلاحية المعرّف
  if (!window.ADS_CONFIG || !window.ADS_CONFIG.isEnabled) {
    return;
  }

  const G_ID = String(window.ADS_CONFIG.conversionId || '').trim();
  if (!G_ID.startsWith('AW-')) {
    return;
  }

  // 2. تهيئة dataLayer و دالة gtag دون الكتابة فوق التهيئة السابقة إن وجدت
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  // 3. حقن سكربت قوقل فقط إذا لم يكن محقوناً مسبقاً في <head> لمنع التكرار
  const existingGtagScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (!existingGtagScript) {
    window.gtag('js', new Date());
    window.gtag('config', G_ID);

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(G_ID);
    (document.head || document.documentElement).appendChild(script);
  }

  // 4. منع تكرار التحويل المزدوج السريع على الجوال (Cooldown 2s)
  const firedEvents = new Set();

  function sendConversion(labelKey) {
    const labels = window.ADS_CONFIG.labels || {};
    const rawLabel = labels[labelKey];
    if (!rawLabel || !String(rawLabel).trim()) return;

    const cleanLabel = String(rawLabel).trim();
    const signature = `${labelKey}_${cleanLabel}`;
    if (firedEvents.has(signature)) return;

    firedEvents.add(signature);
    setTimeout(function () {
      firedEvents.delete(signature);
    }, 2000);

    // إرسال الإحالة عبر beacon لضمان وصولها لجوجل قبل مغادرة المتصفح لتطبيق الاتصال أو الواتساب
    window.gtag('event', 'conversion', {
      send_to: `${G_ID}/${cleanLabel}`,
      transport_type: 'beacon'
    });
  }

  // 5. مراقبة نقر جميع روابط الموقع تلقائياً (اتصال + واتساب)
  document.addEventListener('click', function (e) {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const link = e.target.closest('a');
    if (!link) return;

    // استثناء المطور الصارم
    if (
      link.getAttribute('data-no-track') === 'true' ||
      link.hasAttribute('data-no-track') ||
      link.closest('[data-no-track="true"]')
    ) {
      return;
    }

    const rawHref = (link.getAttribute('href') || link.href || '').trim();
    if (!rawHref) return;

    const lowerHref = rawHref.toLowerCase();
    const cleanDigits = rawHref.replace(/\D/g, '');

    // استثناء أرقام المطور حتى لو كُتبت بمسافات أو رموز
    if (cleanDigits.includes('966578539687') || cleanDigits.includes('0578539687')) {
      return;
    }

    // تتبع أي اتصال في أي صفحة
    if (lowerHref.startsWith('tel:')) {
      sendConversion('call');
      return;
    }

    // تتبع أي واتساب في أي صفحة
    if (
      lowerHref.includes('wa.me') ||
      lowerHref.includes('api.whatsapp.com') ||
      lowerHref.includes('whatsapp.com/send') ||
      lowerHref.startsWith('whatsapp://')
    ) {
      sendConversion('whatsapp');
      return;
    }
  }, { capture: true, passive: true });

  // 6. واجهة تتبع إرسال النموذج بنجاح
  window.reportFormSuccess = function () {
    sendConversion('form');
  };
  window.trackGoogleConversion = sendConversion;

})();
