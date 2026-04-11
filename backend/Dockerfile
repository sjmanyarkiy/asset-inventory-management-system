FROM python:3.11-slim
WORKDIR /app
COPY ./backend /app/backend
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
ENV FLASK_APP=backend.wsgi:app
EXPOSE 5000
CMD ["gunicorn", "-b", "0.0.0.0:5000", "backend.wsgi:app"]
