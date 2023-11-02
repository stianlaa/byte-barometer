FROM python:3

WORKDIR /app

# Copy only the requirements.txt first to leverage Docker cache
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN pip list

# Now copy the rest of the application
COPY . .


CMD ["gunicorn", "-b", "0.0.0.0:2999", "-t", "300", "app:app"]
