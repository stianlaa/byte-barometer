FROM python:3.10.8

WORKDIR /app

# Copy only the requirements.txt first to leverage Docker cache
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN pip list

# Now copy the rest of the application
COPY . .


CMD ["python3", "app.py"]
