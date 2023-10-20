FROM python:3.10.13

WORKDIR /usr/src/app

# Copy only the requirements.txt first to leverage Docker cache
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the rest of the application
COPY . .

CMD [ "python", "backend_server.py" ]
