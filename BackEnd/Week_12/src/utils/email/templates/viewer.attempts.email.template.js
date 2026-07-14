export const emailViewerAttempts = ({username, viewsCount, profileUrl}) => {
    return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تنبيه أمني - زيارات متكررة لملفك الشخصي</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                width: 100% !important;
                background-color: #f4f6f8;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #333333;
            }
            .email-container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                border: 1px solid #e1e5ea;
            }
            .email-header {
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                padding: 35px 20px;
                text-align: center;
                color: #ffffff;
            }
            .email-header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
            }
            .email-body {
                padding: 40px 30px;
                line-height: 1.7;
                text-align: right;
            }
            .welcome-text {
                font-size: 18px;
                font-weight: bold;
                color: #1e3c72;
                margin-bottom: 20px;
            }
            .main-message {
                font-size: 16px;
                color: #555555;
                margin-bottom: 30px;
            }
            .alert-box {
                background-color: #f0f4f8;
                border-right: 4px solid #2a5298;
                padding: 20px;
                border-radius: 6px;
                margin-bottom: 30px;
                text-align: center;
            }
            .alert-number {
                font-size: 42px;
                font-weight: 800;
                color: #d9534f;
                line-height: 1;
                margin-bottom: 5px;
            }
            .alert-text {
                font-size: 16px;
                color: #2a5298;
                font-weight: 600;
            }
            .cta-button-container {
                text-align: center;
                margin-top: 35px;
                margin-bottom: 20px;
            }
            .cta-button {
                display: inline-block;
                background-color: #2a5298;
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 35px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 8px;
            }
            .email-footer {
                background-color: #f8f9fa;
                padding: 25px 30px;
                text-align: center;
                font-size: 12px;
                color: #777777;
                border-top: 1px solid #eef1f5;
            }
            .email-footer a {
                color: #2a5298;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>تنبيه النشاط والزيارات</h1>
            </div>
            <div class="email-body">
                <div class="welcome-text">مرحباً ${username}،</div>
                <p class="main-message">
                    لقد رصدت أنظمتنا نشاطاً ملحوظاً على حسابك خلال الساعات الأخيرة. يبدو أن هناك من يهتم بمتابعة صفحتك بشكل مكثف!
                </p>
                <div class="alert-box">
                    <div class="alert-number">+${viewsCount}</div>
                    <div class="alert-text">مرات تم فيها استعراض ملفك الشخصي بواسطة نفس الشخص</div>
                </div>
                <p class="main-message" style="font-size: 15px;">
                    لمعرفة هوية الزائر وتفاصيل الأوقات التي زار فيها حسابك، يمكنك الانتقال مباشرة إلى لوحة التحكم عبر الزر أدناه.
                </p>
                <div class="cta-button-container">
                    <a href="${profileUrl}" class="cta-button">اكتشف من زار بروفايلك الآن</a>
                </div>
            </div>
            <div class="email-footer">
                <p>تم إرسال هذا البريد تلقائياً بناءً على إعدادات الأمان والخصوصية في حسابك.</p>
                <p>© 2026 جميع الحقوق محفوظة. <a href="#">إلغاء الاشتراك</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
};

