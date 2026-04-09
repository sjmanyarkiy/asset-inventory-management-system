"""
Authentication blueprint - handles user login, registration, and logout
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models.user import User
from extensions import db
from datetime import datetime
from functools import wraps

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
    Register a new user
    
    Expected JSON:
    {
        "username": "string",
        "email": "string",
        "password": "string (min 8 chars)",
        "first_name": "string (optional)",
        "last_name": "string (optional)"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return error_response("Request body must be JSON")
        
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return error_response(f"'{field}' is required")
        
        # Check if user already exists
        existing_user = User.query.filter(
            (User.username == data['username']) | (User.email == data['email'])
        ).first()
        
        if existing_user:
            if existing_user.username == data['username']:
                return error_response("Username already exists", 409)
            else:
                return error_response("Email already exists", 409)
        
        # Create new user
        new_user = User(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        
        try:
            new_user.set_password(data['password'])
        except ValueError as e:
            return error_response(str(e), 400)
        
        # Save to database
        db.session.add(new_user)
        db.session.commit()
        
        return success_response(
            new_user.to_dict(),
            "User registered successfully",
            201
        )
    
    except ValueError as e:
        db.session.rollback()
        return error_response(str(e), 400)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Registration failed: {str(e)}", 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user and return JWT tokens
    
    Expected JSON:
    {
        "username": "string",
        "password": "string"
    }
    
    Returns:
    {
        "access_token": "string",
        "refresh_token": "string",
        "user": {user object}
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
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return success_response({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, "Login successful")
    
    except Exception as e:
        return error_response(f"Login failed: {str(e)}", 500)


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
        
        if not user or not user.is_active:
            return error_response("User not found or inactive", 401)
        
        new_access_token = create_access_token(identity=user.id)
        
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
            'is_admin': user.is_admin
        })
    
    except Exception as e:
        return error_response("Token validation failed", 401)