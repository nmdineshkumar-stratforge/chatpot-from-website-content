FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install dependencies
COPY ./backend/requirements.txt /app/requirements.txt

# Install system dependencies for spaCy
RUN apt-get update && apt-get install -y gcc libffi-dev libpq-dev curl

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY ./backend .

# Download the spaCy model
RUN python -m spacy download en_core_web_md

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
