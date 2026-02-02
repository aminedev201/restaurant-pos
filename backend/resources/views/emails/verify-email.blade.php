<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email Address</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f4f4f4;
            border-radius: 5px;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%);
            color: white;
            padding: 10px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        .link {
            word-break: break-all;
            color: #ea580c;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <h2>Hello {{ $user->name }}!</h2>

            <p>Thank you for registering! Please click the button below to verify your email address.</p>

            <center>
                <a href="{{ $verificationUrl }}" class="button">Verify Email Address</a>
            </center>

            <p>If you did not create an account, no further action is required.</p>

            <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>

            <p class="link">{{ $verificationUrl }}</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Your Company. All rights reserved.</p>
            <p>This link will expire in 60 minutes.</p>
        </div>
    </div>
</body>
</html>
