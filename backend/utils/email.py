"""
Resend Email Utility - Email verification for Asset Inventory
"""
from flask import current_app
import os

def send_verification_email(email, token, name="User"):
    print(f"🔍 Resend: Sending to {email}, token: {token}")
    
    api_key = current_app.config.get('RESEND_API_KEY')
    if not api_key:
        print("❌ RESEND_API_KEY missing")
        print(f"📧 Manual: http://localhost:3000/check-email?token={token}")
        return False
    
    try:
        import resend
        resend.api_key = api_key
        
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        verify_url = f"{frontend_url}/check-email?token={token}"
        
        params = {
            "from": f"Asset Inventory <noreply@resend.dev>>",
            "to": email, 
            "subject": "Verify Your Email - Asset Inventory Management",
            "html": f"""
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome, {name}!</h2>
                <p>Click to verify your email:</p>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="{verify_url}" style="background: #2563eb; color: white; padding: 16px 32px; 
                            text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Verify Email
                    </a>
                </div>
                <p style="font-size: 14px;"><strong>Or copy:</strong> {verify_url}</p>
            </div>
            """
        }
        
        result = resend.Emails.send(params)
        print(f"✅ Resend SUCCESS! ID: {result.get('id')}")
        return True
        
    except Exception as e:
        print(f"❌ Resend error: {str(e)}")
        return False
    
def send_password_reset_email(email, token, name="User"):
    """Send password reset email via Resend"""
    
    api_key = current_app.config.get('RESEND_API_KEY')
    if not api_key:
        print("❌ RESEND_API_KEY missing")
        print(f"🔗 Manual reset: {current_app.config.get('FRONTEND_URL')}/reset-password/{token}")
        return False
    
    try:
        import resend
        resend.api_key = api_key
        
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        reset_url = f"{frontend_url}/reset-password/{token}"
        
        params = {
            "from": "Asset Inventory <noreply@resend.dev>",
            "to": email,
            "subject": "Reset Your Password",
            "html": f"""
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Password Reset Request</h2>
                
                <p>Hi {name},</p>
                
                <p>You requested to reset your password.</p>
                
                <div style="text-align: center; margin: 40px 0;">
                    <a href="{reset_url}" style="background: #dc2626; color: white; padding: 16px 32px; 
                            text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Reset Password
                    </a>
                </div>
                
                <p style="font-size: 14px;"><strong>Or copy:</strong> {reset_url}</p>
                
                <p style="font-size: 13px; color: #6b7280;">
                    This link expires in 30 minutes.<br>
                    If you didn’t request this, you can ignore this email.
                </p>
            </div>
            """
        }
        
        result = resend.Emails.send(params)
        print(f"✅ Password reset email sent! ID: {result.get('id')}")
        return True
        
    except Exception as e:
        print(f"❌ Reset email error: {str(e)}")
        return False