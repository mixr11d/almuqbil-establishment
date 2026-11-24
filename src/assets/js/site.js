/**
 * الوظائف التفاعلية العامة لواجهة موقع مؤسسة المقبل
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // 1. إدارة قائمة الجوال المنسدلة (Off-Canvas Drawer)
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    if (drawerBackdrop) drawerBackdrop.classList.add('active');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openDrawer);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  // إغلاق القائمة عند الضغط على زر ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // 2. سلوك زر الصعود للأعلى (Scroll To Top)
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');

  if (scrollToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 350) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 3. إدارة عناصر الأسئلة الشائعة (Accordion FAQ)
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(function (button) {
    button.addEventListener('click', function () {
      const faqItem = this.closest('.faq-item');
      if (!faqItem) return;

      const isOpen = faqItem.classList.contains('active');

      // إغلاق باقي العناصر المفتوحة
      document.querySelectorAll('.faq-item').forEach(function (item) {
        item.classList.remove('active');
      });

      if (!isOpen) {
        faqItem.classList.add('active');
      }
    });
  });

  // استخراج رقم واتساب العميل ديناميكياً من الصفحة (مع استثناء رقم المطور) أو استخدام الرقم الافتراضي
  function getClientWhatsappNumber() {
    if (window.ADS_CONFIG && window.ADS_CONFIG.whatsappNumber) {
      return String(window.ADS_CONFIG.whatsappNumber).replace(/\D/g, '');
    }
    const waLinks = document.querySelectorAll('a[href*="wa.me/"]:not([data-no-track="true"])');
    for (let i = 0; i < waLinks.length; i++) {
      const href = waLinks[i].getAttribute('href') || '';
      const match = href.match(/wa\.me\/(\d+)/);
      if (match && match[1] && !match[1].includes('966578539687')) {
        return match[1];
      }
    }
    return '966500214364';
  }

  // 4. معالجة نموذج التواصل وإرساله عبر واتساب + إطلاق إحالة النموذج لإعلانات جوجل
  const whatsappForms = document.querySelectorAll('#mainContactForm, form[data-whatsapp-form="true"]');

  whatsappForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formAlert = form.querySelector('.form-alert') || document.getElementById('formAlert');
      const submitBtn = form.querySelector('button[type="submit"]');

      const formData = new FormData(form);
      const clientName = String(formData.get('name') || '').trim();
      const clientPhone = String(formData.get('phone') || '').trim();
      const serviceType = String(formData.get('service') || '').trim();
      const projectNotes = String(formData.get('notes') || formData.get('message') || '').trim();

      if (!clientName || !clientPhone) {
        if (formAlert) {
          formAlert.textContent = 'يرجى إدخال الاسم ورقم الجوال بشكل صحيح.';
          formAlert.className = 'form-alert error';
          formAlert.style.display = 'block';
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      // تنسيق رسالة الواتساب الاحترافية
      const messageLines = [
        'مرحبًا مؤسسة المقبل، أرغب في طلب معاينة مجانية:',
        `• الاسم: ${clientName}`,
        `• رقم الجوال: ${clientPhone}`
      ];

      if (serviceType) {
        messageLines.push(`• الخدمة المطلوبة: ${serviceType}`);
      }
      if (projectNotes) {
        messageLines.push(`• التفاصيل والحي: ${projectNotes}`);
      }

      // إضافة أي حقول إضافية إذا وُجدت في نماذج مستقبلية
      formData.forEach(function (value, key) {
        if (!['name', 'phone', 'service', 'notes', 'message'].includes(key)) {
          const cleanVal = String(value || '').trim();
          if (cleanVal) {
            messageLines.push(`• ${key}: ${cleanVal}`);
          }
        }
      });

      const whatsappNumber = getClientWhatsappNumber();
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageLines.join('\n'))}`;

      // إطلاق حدث التحويل الفعلي لإعلانات جوجل (لإرسال النموذج فقط دون تكرار مع نقر الواتساب)
      if (typeof window.reportFormSuccess === 'function') {
        window.reportFormSuccess(form.id || 'whatsappForm');
      }

      if (formAlert) {
        formAlert.textContent = 'تم تجهيز طلبكم بنجاح! جاري تحويلكم إلى واتساب لإرسال التفاصيل...';
        formAlert.className = 'form-alert success';
        formAlert.style.display = 'block';
      }

      form.reset();
      if (submitBtn) submitBtn.disabled = false;

      // فتح الواتساب بشكل متزامن مع دعم متصفحات الجوال التي تحظر النوافذ المنبثقة
      const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!win || win.closed) {
        window.location.href = whatsappUrl;
      }
    });
  });

});
