/**
 * الوظائف التفاعلية العامة لواجهة موقع مؤسسة العتيق
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

  // 2. سلوك زر الصعود للأعلى (Scroll To Top) الثابت يسار الشاشة
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

  // 3. إدارة عناصر الأسئلة الشائعة الأكورديون (Accordion FAQ)
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

  // 4. معالجة نموذج التواصل بشكل حقيقي وآمن (عند توفره)
  const contactForm = document.getElementById('mainContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const formAlert = document.getElementById('formAlert');
      
      // منع التكرار أثناء المعالجة
      if (submitBtn) submitBtn.disabled = true;
      if (formAlert) {
        formAlert.className = 'form-alert';
        formAlert.style.display = 'none';
      }

      const formData = new FormData(contactForm);
      const dataPayload = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataPayload)
        });

        if (response.ok) {
          if (formAlert) {
            formAlert.textContent = 'تم استلام طلبكم بنجاح! سيتواصل معكم فريق العمل في أقرب وقت.';
            formAlert.classList.add('success');
          }
          contactForm.reset();
          // إطلاق حدث التحويل الفعلي المعتمد لـ Google Ads
          if (typeof window.reportFormSuccess === 'function') {
            window.reportFormSuccess('mainContactForm');
          }
        } else {
          throw new Error('فشل إرسال الطلب');
        }
      } catch (err) {
        if (formAlert) {
          formAlert.textContent = 'نعتذر، تعذر إرسال الطلب حالياً. يرجى الاتصال بنا مباشرة أو عبر واتساب.';
          formAlert.classList.add('error');
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});
