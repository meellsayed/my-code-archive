export const loginDetectedTemplate = ({
  username = "User",
  device = "Unknown Device",
  location = "Unknown Location",
  ipAddress = "0.0.0.0",
  dateTime = new Date().toLocaleString(),
  resetLink = "#",
  companyName = "Social Media App",
}) => {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert: New Login Detected</title>
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
            border-top: 4px solid #dc3545;
        }
        .header {
            padding: 25px;
            text-align: center;
            background-color: #fff5f5;
        }
        .header img {
            max-width: 50px;
            margin-bottom: 10px;
        }
        .header h1 {
            color: #dc3545;
            margin: 0;
            font-size: 22px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }
        .alert-box {
            background-color: #f8f9fa;
            border-left: 4px solid #6c757d;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .alert-item {
            margin-bottom: 10px;
            font-size: 15px;
        }
        .alert-item strong {
            color: #555555;
            display: inline-block;
            width: 130px;
        }
        .btn {
            display: inline-block;
            background-color: #dc3545;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 15px;
            text-align: center;
        }
        .btn:hover {
            background-color: #bd2130;
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
        <div class="header">
            <img src="https://flaticon.com" alt="Security Alert">
            <h1>New Login Activity Detected</h1>
        </div>

        <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            <p>We noticed a recent login to your account from a new device or location. Please review the details below to ensure this activity was authorized:</p>
            
            <div class="alert-box">
                <div class="alert-item"><strong>Device / Browser:</strong> ${device}</div>
                <div class="alert-item"><strong>Location:</strong> ${location}</div>
                <div class="alert-item"><strong>IP Address:</strong> ${ipAddress}</div>
                <div class="alert-item"><strong>Date & Time:</strong> ${dateTime}</div>
            </div>

            <p><strong>Was this you?</strong></p>
            <p>If this was you, no further action is needed.</p>
            <p>If you don't recognize this login, your account might be compromised. Please secure your account immediately by changing your password.</p>
            
            <div style="text-align: center;">
                <a href="${resetLink}" class="btn">Secure Your Account</a>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated security notification. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
    </div>

</body>
</html>`;
};
