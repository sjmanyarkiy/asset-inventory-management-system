"""
Authentication blueprint - handles user login, registration, email verification, and logout
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models.user import User
from extensions import db
from datetime import datetime
from functools import wraps
from utils.email import send_verification_email
import uuid



auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# Error response helper
def error_response(message, status_code=400):
    """Create standardized error response"""
    return jsonify({'error': message}), status_code


def success_response(data, message=None, status_code=200):
    """Create standardized success response"""
    response = {'data': data}
    if message:
        response['message'] = message
    return jsonify(response), status_code


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user (2-step verification)
    
    Expected JSON:
    {
        "username": "string",
        "email": "string",
        "password": "string (min 8 chars)",
        "first_name": "string (optional)",
        "last_name": "string (optional)"
    }
    
    Returns user ID and instructions to check email for verification.
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return error_response("Request body must be JSON")
        
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return error_response(f"'{field.replace('_', ' ')}' is required")
        
        # Check if user already exists
        existing_user = User.query.filter(
            (User.username == data['username']) | (User.email == data['email'])
        ).first()
        
        if existing_user:
            if existing_user.username == data['username']:
                return error_response("Username already exists", 409)
            else:
                return error_response("Email already exists", 409)
        
        # Create new user (unverified)
        new_user = User(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name', '').strip(),
            last_name=data.get('last_name', '').strip(),
            is_active=False,  # Inactive until verified
            is_email_verified=False
        )
        
        try:
            new_user.set_password(data['password'])
        except ValueError as e:
            return error_response(str(e), 400)
        
        # Generate email verification token
        new_user.generate_email_token()
        
        # Save to database
        db.session.add(new_user)
        db.session.commit()
        
        # Send verification email
        try:
            send_verification_email(
                new_user.email, 
                new_user.email_verification_token,
                new_user.first_name or new_user.username
            )
        except Exception as email_error:
            current_app.logger.error(f"Failed to send verification email: {email_error}")
            # Don't fail registration if email fails - user can resend
            pass
        
        return success_response(
            {'user_id': new_user.id},
            "Registration successful. Please check your email to verify your account.",
            201
        )
    
    except ValueError as e:
        db.session.rollback()
        return error_response(str(e), 400)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Registration failed: {str(e)}", 500)


@auth_bp.route('/verify-email/<token>', methods=['POST'])
def verify_email(token):
    """
    Verify user email using token from verification email
    """
    try:
        # Find user by token
        user = User.query.filter_by(email_verification_token=token).first()
        
        if not user:
            return error_response("Invalid verification token", 400)
        
        if user.is_email_verified:
            return success_response(
                {'user_id': user.id}, 
                "Email already verified"
            )
        
        if user.email_verification_expires < datetime.utcnow():
            return error_response("Verification token has expired", 400)
        
        # Mark as verified and activate
        user.is_email_verified = True
        user.is_active = True
        user.email_verification_token = None
        user.email_verification_expires = None
        
        db.session.commit()
        
        # Create JWT tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return success_response({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, "Email verified successfully. You are now logged in!")
    
    except Exception as e:
        db.session.rollback()
        return error_response(f"Email verification failed: {str(e)}", 500)


@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """
    Resend verification email
    
    Expected JSON:
    {
        "email": "string"
    }
    """
    try:
        data = request.get_json()
        if not data or not data.get('email'):
            return error_response("Email is required")
        
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return error_response("No account found with that email", 404)
        
        if user.is_email_verified:
            return error_response("Email already verified", 400)
        
        # Regenerate token and send email
        user.generate_email_token()
        db.session.commit()
        
        send_verification_email(
            user.email,
            user.email_verification_token,
            user.first_name or user.username
        )
        
        return success_response(None, "Verification email sent!")
    
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to resend email: {str(e)}", 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user and return JWT tokens (requires email verification)
    
    Expected JSON:
    {
        "username": "string",
        "password": "string"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body must be JSON")
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return error_response("Username and password are required")
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user:
            return error_response("Invalid username or password", 401)
        
        # Check if email verified
        if not user.is_email_verified:
            return error_response("Please verify your email before logging in", 403)
        
        # Check if user is active
        if not user.is_active:
            return error_response("Your account has been deactivated", 403)
        
        # Verify password
        if not user.check_password(password):
            return error_response("Invalid username or password", 401)
        
        # Update last login
        user.update_last_login()
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return success_response({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, "Login successful")
    
    except Exception as e:
        return error_response(f"Login failed: {str(e)}", 500)


# Keep all other endpoints unchanged
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user (token invalidation happens on frontend)
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", 404)
        
        return success_response(None, "Logout successful")
    
    except Exception as e:
        return error_response(f"Logout failed: {str(e)}", 500)



@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Get new access token using refresh token
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active or not user.is_email_verified:
            return error_response("User not found or inactive", 401)
        
        new_access_token = create_access_token(identity=str(user.id))
        
        return success_response({
            'access_token': new_access_token,
            'user': user.to_dict()
        }, "Token refreshed successfully")
    
    except Exception as e:
        return error_response(f"Token refresh failed: {str(e)}", 500)



@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user's information
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", 404)
        
        return success_response(user.to_dict())
    
    except Exception as e:
        return error_response(f"Failed to retrieve user: {str(e)}", 500)



@auth_bp.route('/validate-token', methods=['POST'])
@jwt_required()
def validate_token():
    """
    Validate if the JWT token is still valid
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", 404)
        
        return success_response({
            'valid': True,
            'user_id': user.id,
            'is_admin': user.is_admin,
            'is_email_verified': user.is_email_verified
        })
    
    except Exception as e:
        return error_response("Token validation failed", 401)
    

# @auth_bp.route('/test-resend', methods=['POST'])
# def test_resend():
#     """Test Resend email"""
#     from utils.email import send_verification_email
#     result = send_verification_email('sandra.manyarkiy@gmail.com', 'test-123', 'Sandra')
#     return jsonify({'success': result})