/**
 * محرك تتبع التحويلات المركزي الموحد - مؤسسة العتيق
 * يستخدم Event Delegation على مستوى document ويمنع تسجيل التحويلات المكررة
 */

(function () {
  'use strict';

  // التحقق من تهيئة dataLayer وتثبيت Google Tag لمرة واحدة فقط
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

  // ذاكرة لتسجيل الأحداث ومنع التكرار اللحظي المزدوج
  const firedEvents = new Set();

  /**
   * دالة إرسال أحداث التحويل دون إرسال أي بيانات شخصية (عدم إرسال هواتف أو نصوص)
   * @param {string} eventName اسم الحدث القياسي
   * @param {string} labelKey مفتاح التسمية في ملف الإعدادات
   */
  function trackConversion(eventName, labelKey) {
    const now = Date.now();
    const eventSignature = `${eventName}_${labelKey}`;

    // منع تكرار نفس الحدث خلال 1.5 ثانية (Debouncing)
    if (firedEvents.has(eventSignature)) return;
    firedEvents.add(eventSignature);
    setTimeout(() => firedEvents.delete(eventSignature), 1500);

    // إطلاق الحدث في dataLayer
    window.dataLayer.push({
      event: eventName,
      conversion_type: labelKey,
      timestamp: now
    });

    // إرسال التحويل إلى Google Ads عند توفر الإعدادات
    if (window.ADS_CONFIG && window.ADS_CONFIG.isEnabled) {
      const label = window.ADS_CONFIG.labels[labelKey];
      if (label) {
        gtag('event', 'conversion', {
          send_to: `${window.ADS_CONFIG.conversionId}/${label}`,
          event_callback: function () {
            // Callback آمن لا يعطل تجربة المستخدم
          }
        });
      }
    }
  }

  // رصد النقرات عبر مستمع الأحداث المركزي (Event Delegation)
  document.addEventListener('click', function (e) {
    const targetLink = e.target.closest('a');
    if (!targetLink) return;

    const href = targetLink.getAttribute('href') || '';

    // أ. رصد نقرات الاتصال الهاتفي (click_call)
    if (href.startsWith('tel:')) {
      trackConversion('click_call', 'call');
      return;
    }

    // ب. رصد نقرات الواتساب (click_whatsapp)
    if (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp.com')) {
      trackConversion('click_whatsapp', 'whatsapp');
      return;
    }
  }, { passive: true });

  // ج. توفير واجهة موحدة لتبليغ نجاح النموذج (form_submit_success)
  // لا يتم إطلاق هذا الحدث إلا بعد تأكيد الخادم الفعلي بنجاح المعالجة
  window.reportFormSuccess = function (formId) {
    trackConversion('form_submit_success', 'form');
  };

})();
