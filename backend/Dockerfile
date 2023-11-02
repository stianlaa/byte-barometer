FROM nvidia/cuda:12.0.0-runtime-ubuntu22.04

# SYSTEM
RUN apt-get update &&  \
    apt-get install --no-install-recommends -y git vim curl python3-pip python3-dev ffmpeg libsm6 libxext6 gcc g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only the requirements.txt first to leverage Docker cache
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the rest of the application
COPY . .

# Define default cache location 
ENV TRANSFORMERS_CACHE=/app/.cache

CMD ["gunicorn", "-k", "eventlet", "-b", "0.0.0.0:3000", "-t", "300", "app:app"]
