/**
 * محرك تتبع التحويلات المركزي الموحد - مؤسسة المقبل
 * يستخدم Event Delegation على مستوى document ويمنع تسجيل التحويلات المكررة
 * ويستثني تماماً نقرات المطور لحماية دقة إعلانات Google Ads
 */

(function () {
  'use strict';

  // تهيئة dataLayer لمرة واحدة فقط
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  // تحميل مكتبة Google Tag إذا تم توفير معرّف الإعلانات الصحيح
  if (window.ADS_CONFIG && window.ADS_CONFIG.isEnabled) {
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(window.ADS_CONFIG.conversionId)}`;
    document.head.appendChild(gtagScript);

    gtag('js', new Date());
    gtag('config', window.ADS_CONFIG.conversionId);
  }

  // ذاكرة لمنع تكرار التحويل المزدوج اللحظي
  const firedEvents = new Set();

  function trackConversion(eventName, labelKey) {
    const now = Date.now();
    const eventSignature = `${eventName}_${labelKey}`;

    if (firedEvents.has(eventSignature)) return;
    firedEvents.add(eventSignature);
    setTimeout(() => firedEvents.delete(eventSignature), 1500);

    window.dataLayer.push({
      event: eventName,
      conversion_type: labelKey,
      timestamp: now
    });

    if (window.ADS_CONFIG && window.ADS_CONFIG.isEnabled) {
      const label = window.ADS_CONFIG.labels[labelKey];
      if (label) {
        gtag('event', 'conversion', {
          send_to: `${window.ADS_CONFIG.conversionId}/${label}`
        });
      }
    }
  }

  // رصد النقرات المركزي
  document.addEventListener('click', function (e) {
    const targetLink = e.target.closest('a');
    if (!targetLink) return;

    // استثناء صريح: إذا كان الرابط يخص المطور أو يحمل data-no-track="true"
    if (
      targetLink.hasAttribute('data-no-track') ||
      targetLink.closest('[data-no-track="true"]') ||
      targetLink.href.includes('966578539687') ||
      targetLink.href.includes('0578539687')
    ) {
      // السماح بفتح الرابط بشكل طبيعي دون إرسال أي حدث لـ Google Ads
      return;
    }

    const href = targetLink.getAttribute('href') || '';

    // أ. رصد نقرات الاتصال الهاتفي لعملاء المؤسسة فقط
    if (href.startsWith('tel:')) {
      trackConversion('click_call', 'call');
      return;
    }

    // ب. رصد نقرات الواتساب لعملاء المؤسسة فقط
    if (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp.com')) {
      trackConversion('click_whatsapp', 'whatsapp');
      return;
    }
  }, { passive: true });

  // ج. واجهة تبليغ نجاح النموذج الفعلي
  window.reportFormSuccess = function (formId) {
    trackConversion('form_submit_success', 'form');
  };

})();
