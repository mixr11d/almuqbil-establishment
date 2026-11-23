/**
 * محرك تتبع التحويلات المركزي الموحد - مؤسسة المقبل
 * متوافق 100% مع Google Ads و Google Tag Assistant
 */

(function () {
  'use strict';

  // 1. تهيئة dataLayer و gtag على النطاق العام للنافذة
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  // 2. تحميل مكتبة Google Tag إذا تم توفير معرّف الإعلانات الصحيح
  if (window.ADS_CONFIG && window.ADS_CONFIG.isEnabled) {
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(window.ADS_CONFIG.conversionId)}`;
    document.head.appendChild(gtagScript);

    window.gtag('js', new Date());
    window.gtag('config', window.ADS_CONFIG.conversionId);
  }

  // 3. ذاكرة مؤقتة لمنع تكرار التحويل المزدوج اللحظي
  const firedEvents = new Set();

  function trackConversion(eventName, labelKey, eventValue) {
    const now = Date.now();
    const eventSignature = `${eventName}_${labelKey}`;

    if (firedEvents.has(eventSignature)) return;
    firedEvents.add(eventSignature);
    setTimeout(() => firedEvents.delete(eventSignature), 1500);

    // تسجيل في dataLayer
    window.dataLayer.push({
      event: eventName,
      conversion_type: labelKey,
      timestamp: now
    });

    // إرسال الإحالة الناجحة إلى Google Ads
    if (window.ADS_CONFIG && window.ADS_CONFIG.isEnabled) {
      const label = window.ADS_CONFIG.labels[labelKey];
      if (label) {
        window.gtag('event', 'conversion', {
          send_to: `${window.ADS_CONFIG.conversionId}/${label}`,
          value: eventValue || 100.0,
          currency: 'SAR'
        });
      }
    }
  }

  // 4. رصد النقرات المركزي الموحد
  document.addEventListener('click', function (e) {
    const targetLink = e.target.closest('a');
    if (!targetLink) return;

    // استثناء روابط المطور
    if (
      targetLink.hasAttribute('data-no-track') ||
      targetLink.closest('[data-no-track="true"]') ||
      targetLink.href.includes('966578539687') ||
      targetLink.href.includes('0578539687')
    ) {
      return;
    }

    const href = targetLink.getAttribute('href') || targetLink.href || '';

    // أ. رصد نقرات الاتصال الهاتفي
    if (href.startsWith('tel:')) {
      trackConversion('click_call', 'call', 100.0);
      return;
    }

    // ب. رصد نقرات الواتساب
    if (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp.com')) {
      trackConversion('click_whatsapp', 'whatsapp', 80.0);
      return;
    }
  }, true);

  // 5. واجهة تبليغ نجاح النموذج الفعلي
  window.reportFormSuccess = function (formId) {
    trackConversion('form_submit_success', 'form', 120.0);
  };

})();
