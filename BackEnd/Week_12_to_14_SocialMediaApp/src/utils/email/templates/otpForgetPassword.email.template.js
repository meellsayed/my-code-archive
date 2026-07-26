export const otpForgetPasswordTemplate = ({ 
    username = "User", 
     code = "000000", 
    expiresInMinutes = "10", 
    companyName = "Social Media App" 
}) => {
    return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f6f9;
            margin: 0;
            padding: 0;
            direction: ltr;
            text-align: left;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            border-top: 4px solid #007bff;
        }
        .header {
            padding: 25px;
            text-align: center;
            background-color: #f0f7ff;
        }
        .header img {
            max-width: 50px;
            margin-bottom: 10px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 22px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }
        .otp-container {
            text-align: center;
            margin: 25px 0;
        }
        .otp-code {
            display: inline-block;
            background-color: #f8f9fa;
            color: #007bff;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 6px;
            padding: 12px 30px;
            border: 2px dashed #007bff;
            border-radius: 6px;
        }
        .warning-text {
            color: #6c757d;
            font-size: 14px;
            margin-top: 20px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777777;
            border-top: 1px solid #eeeeee;
        }
    </style>
</head>
<body>

    <div class="email-container">
        <!-- Header / Logo -->
        <div class="header">
            <!-- Security key/shield icon -->
            <img src="https://flaticon.com" alt="Verification">
            <h1>Verify Your Identity</h1>
        </div>

        <!-- Email Body -->
        <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            <p>You requested a verification code to access your account. Please use the One-Time Password (OTP) below to complete your verification process:</p>
            
            <!-- OTP Display Area -->
            <div class="otp-container">
                <div class="otp-code">${code}</div>
            </div>

            <p>This code is highly confidential and is valid for the next <strong>${expiresInMinutes} minutes</strong>. Do not share this code with anyone, including our support team.</p>
            
            <p class="warning-text">If you did not request this code, please ignore this email or contact support if you suspect unauthorized access.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This is an automated security notification. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
    </div>

</body>
</html>`;
};
