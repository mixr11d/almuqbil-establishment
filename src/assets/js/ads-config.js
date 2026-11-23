/**
 * إعدادات Google Ads وقياس التحويلات - مؤسسة المقبل
 */

window.ADS_CONFIG = {
  // معرف حساب Google Ads الأساسي
  conversionId: 'AW-18582533101',

  // معرّفات التسميات الخاصة بكل إجراء تحويلي (Conversion Labels)
  labels: {
    call: 'YDtwCJLilL4dEO3n65xF',      // تحويل النقر على أرقام الاتصال
    whatsapp: 'bHMmCJXilL4dEO3n65xF',  // تحويل النقر على روابط واتساب
    form: 'IgyMCLj2lb4dEO3n65xF'       // تحويل إرسال النموذج بنجاح
  },

  // التحقق من حالة التفعيل
  get isEnabled() {
    return typeof this.conversionId === 'string' && this.conversionId.trim().length > 0;
  }
};
