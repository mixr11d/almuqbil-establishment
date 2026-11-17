/**
 * إعدادات Google Ads وقياس التحويلات - مؤسسة العتيق
 * ضع المعرفات الصحيحة هنا عند توفرها من حساب الإعلانات
 */

window.ADS_CONFIG = {
  // معرف حساب Google Ads الأساسي (مثال: 'AW-123456789')
  conversionId: '',

  // معرّفات التسميات الخاصة بكل إجراء تحويلي (Conversion Labels)
  labels: {
    call: '',      // Label تحويل النقر على أرقام الاتصال (click_call)
    whatsapp: '',  // Label تحويل النقر على روابط واتساب (click_whatsapp)
    form: ''       // Label تحويل إرسال النموذج بنجاح (form_submit_success)
  },

  // حالة التفعيل (تتحول إلى true تلقائياً بمجرد إدخال conversionId)
  get isEnabled() {
    return typeof this.conversionId === 'string' && this.conversionId.trim().length > 0;
  }
};
