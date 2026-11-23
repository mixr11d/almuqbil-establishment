/**
 * إعدادات Google Ads وقياس التحويلات - مؤسسة العتيق
 * ضع المعرفات الصحيحة هنا عند توفرها من حساب الإعلانات
 */

window.ADS_CONFIG = {
  // معرف حساب Google Ads الأساسي (مثال: 'AW-123456789')
  conversionId: 'AW-18582533101',

  // معرّفات التسميات الخاصة بكل إجراء تحويلي (Conversion Labels)
  labels: {
    call: 'YDtwCJLilL4dEO3n65xF',      // Label تحويل النقر على أرقام الاتصال (click_call)
    whatsapp: 'bHMmCJXilL4dEO3n65xF',  // Label تحويل النقر على روابط واتساب (click_whatsapp)
    form: 'IgyMCLj2lb4dEO3n65xF'       // Label تحويل إرسال النموذج بنجاح (form_submit_success)
  },

  // حالة التفعيل (تتحول إلى true تلقائياً بمجرد إدخال conversionId)
  get isEnabled() {
    return typeof this.conversionId === 'string' && this.conversionId.trim().length > 0;
  }
};
