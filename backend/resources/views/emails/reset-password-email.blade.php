<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            padding: 20px;
            line-height: 1.6;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%);
            padding: 40px 30px;
            text-align: center;
        }

        .email-header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }

        .email-body {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 20px;
            color: #1f2937;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .content {
            color: #4b5563;
            font-size: 16px;
            margin-bottom: 20px;
        }

        .button-container {
            text-align: center;
            margin: 35px 0;
        }

        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%);
            color: #ffffff;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(234, 88, 12, 0.4);
        }

        .expiry-notice {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .expiry-notice p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }

        .expiry-notice strong {
            color: #78350f;
        }

        .alternative-link {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }

        .alternative-link p {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 10px;
        }

        .alternative-link a {
            color: #ea580c;
            word-break: break-all;
            font-size: 12px;
        }

        .security-notice {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 25px 0;
            border-radius: 4px;
        }

        .security-notice p {
            color: #991b1b;
            font-size: 14px;
            margin: 0;
        }

        .email-footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .app-name {
            color: #1f2937;
            font-weight: 600;
        }

        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 25px 0;
        }

        @media only screen and (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }

            .email-header {
                padding: 30px 20px;
            }

            .email-header h1 {
                font-size: 24px;
            }

            .reset-button {
                padding: 14px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>🔐 Password Reset Request</h1>
        </div>

        <!-- Body -->
        <div class="email-body">
            <p class="greeting">Hello, {{ $user->name }}</p>

            <p class="content">
                You are receiving this email because we received a password reset request for your account.
            </p>

            <p class="content">
                Click the button below to reset your password:
            </p>

            <!-- Reset Button -->
            <div class="button-container">
                <a href="{{ $resetUrl }}" class="reset-button">Reset Password</a>
            </div>

            <!-- Expiry Notice -->
            <div class="expiry-notice">
                <p>
                    <strong>⏰ Important:</strong> This password reset link will expire in <strong>{{ $expiryMinutes }} minutes</strong>.
                </p>
            </div>

            <!-- Alternative Link -->
            <div class="alternative-link">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <a href="{{ $resetUrl }}">{{ $resetUrl }}</a>
            </div>

            <div class="divider"></div>

            <!-- Security Notice -->
            <div class="security-notice">
                <p>
                    <strong>🛡️ Security Notice:</strong> If you did not request a password reset, please ignore this email. No changes will be made to your account.
                </p>
            </div>

            <p class="content" style="margin-top: 30px;">
                If you're having trouble or didn't request this reset, please contact our support team immediately.
            </p>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p class="footer-text">
                Regards,<br>
                <span class="app-name">{{ $appName }}</span>
            </p>
            <p class="footer-text" style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
