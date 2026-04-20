"""
Gunicorn configuration for production (Render)
"""

import os
import sys

# Add backend to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pre_start import pre_exec_app

# Gunicorn settings
bind = f"0.0.0.0:{os.getenv('PORT', 5000)}"
workers = int(os.getenv('WEB_CONCURRENCY', 2))
worker_class = 'sync'
max_requests = 1000
timeout = 60
keepalive = 5

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Application
pythonpath = os.path.dirname(os.path.abspath(__file__))


def on_starting(server):
    """Called before Gunicorn starts"""
    print("\n" + "=" * 70)
    print("🚀 Gunicorn starting - Running pre-start initialization...")
    print("=" * 70)
    pre_exec_app(None)
