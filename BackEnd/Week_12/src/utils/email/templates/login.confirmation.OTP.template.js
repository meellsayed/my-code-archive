export const loginConfirmationOTP = ({username, otp, verificationUrl}) => {
    return `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert: Two-Step Verification Code</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                width: 100% !important;
                background-color: #f4f6f8;
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
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
                background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
                padding: 35px 20px;
                text-align: center;
                color: #ffffff;
            }
            .email-header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }
            .email-body {
                padding: 40px 30px;
                line-height: 1.7;
                text-align: left;
            }
            .welcome-text {
                font-size: 18px;
                font-weight: bold;
                color: #111827;
                margin-bottom: 20px;
            }
            .main-message {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 25px;
            }
            .otp-container {
                background-color: #f3f4f6;
                border-left: 4px solid #3b82f6;
                padding: 20px;
                border-radius: 6px;
                margin-bottom: 30px;
                text-align: center;
            }
            .otp-code {
                font-size: 36px;
                font-weight: 800;
                color: #2563eb;
                letter-spacing: 4px;
                line-height: 1;
                margin-bottom: 8px;
            }
            .otp-hint {
                font-size: 13px;
                color: #6b7280;
            }
            .cta-button-container {
                text-align: center;
                margin-top: 35px;
                margin-bottom: 25px;
            }
            .cta-button {
                display: inline-block;
                background-color: #2563eb;
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 35px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
            }
            .warning-text {
                font-size: 14px;
                color: #9ca3af;
                border-top: 1px dashed #e5e7eb;
                padding-top: 20px;
                margin-top: 20px;
            }
            .email-footer {
                background-color: #f9fafb;
                padding: 25px 30px;
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
                border-top: 1px solid #f3f4f6;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Security Notification</h1>
            </div>
            <div class="email-body">
                <div class="welcome-text">Hi ${username},</div>
                <p class="main-message">
                    We detected a sign-in attempt to your account. Since you have **Two-Step Verification** enabled, please use the following One-Time Password (OTP) to verify your identity:
                </p>
                
                <div class="otp-container">
                    <div class="otp-code">${otp}</div>
                    <div class="otp-hint">This code is valid for 10 minutes. Do not share it with anyone.</div>
                </div>

                <p class="main-message">
                    Click the button below to go directly to the verification page and enter your code:
                </p>

                <div class="cta-button-container">
                    <a href="${verificationUrl}" class="cta-button">Verify Sign-In Attempt</a>
                </div>

                <p class="warning-text">
                    <strong>If this wasn't you:</strong> Someone else might have your password. We strongly recommend changing your password immediately to keep your account secure.
                </p>
            </div>
            <div class="email-footer">
                <p>This is an automated security alert sent to protect your account.</p>
                <p>© 2026 YourCompany. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
