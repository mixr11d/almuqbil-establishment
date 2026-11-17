/**
 * Cloudflare Pages Function: معالجة نموذج طلبات المعاينة والتواصل
 * Endpoint: /api/contact
 * تعمل على حافة الشبكة (Edge) لضمان أعلى سرعة وأمان
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // التحقق من نوع المحتوى
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'صيغة الطلب غير صحيحة، يجب أن تكون JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  try {
    const data = await request.json();
    const { name, phone, service, notes } = data;

    // 1. التحقق من صحة المدخلات الإلزامية (Validation)
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'يرجى إدخال اسم صحيح' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return new Response(JSON.stringify({ error: 'يرجى إدخال رقم جوال صحيح' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    if (!service || typeof service !== 'string') {
      return new Response(JSON.stringify({ error: 'يرجى تحديد الخدمة المطلوبة' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // تجهيز تفاصيل الطلب النظيفة
    const sanitizedPayload = {
      clientName: name.trim().slice(0, 80),
      clientPhone: phone.trim().slice(0, 20),
      serviceType: service.trim().slice(0, 100),
      projectNotes: (notes || '').trim().slice(0, 500),
      submittedAt: new Date().toISOString()
    };

    /**
     * 2. إرسال إشعار بريدي عبر مزود خارجي (مثل Resend أو SendGrid) عند توفر المفاتيح
     * يتم وضع المتغيرات في Cloudflare Pages Environment Variables:
     * - RESEND_API_KEY
     * - NOTIFICATION_EMAIL
     */
    if (env.RESEND_API_KEY && env.NOTIFICATION_EMAIL) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'موقع مؤسسة المقبل <onboarding@resend.dev>',
          to: env.NOTIFICATION_EMAIL,
          subject: `طلب معاينة جديد: ${sanitizedPayload.serviceType} - ${sanitizedPayload.clientName}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #172536;">
              <h2 style="color: #C5A46D;">طلب معاينة جديد من موقع مؤسسة المقبل</h2>
              <p><strong>اسم العميل:</strong> ${sanitizedPayload.clientName}</p>
              <p><strong>رقم الجوال:</strong> ${sanitizedPayload.clientPhone}</p>
              <p><strong>الخدمة المطلوبة:</strong> ${sanitizedPayload.serviceType}</p>
              <p><strong>تفاصيل الطلب والحي:</strong> ${sanitizedPayload.projectNotes || 'لا توجد ملاحظات إضافية'}</p>
              <p style="font-size: 0.85em; color: #68717C;">تاريخ ووقت الطلب: ${sanitizedPayload.submittedAt}</p>
            </div>
          `
        })
      });
    }

    // تسجيل ملخص الطلب في سجلات Cloudflare دون كشف أسرار
    console.log(`[طلب جديد استُلم بنجاح]: ${sanitizedPayload.serviceType} من ${sanitizedPayload.clientPhone}`);

    // إرجاع رد التأكيد الإيجابي الصريح (200 OK)
    return new Response(JSON.stringify({
      success: true,
      message: 'تم استلام طلبكم بنجاح ومطابقة البيانات'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'حدث خطأ أثناء معالجة الطلب في الخادم' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
