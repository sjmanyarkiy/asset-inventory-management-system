#!/usr/bin/env bash

echo "Starting deployment..."

# Run migrations
flask db upgrade

# Start server
gunicorn wsgi:app --bind 0.0.0.0:$PORT