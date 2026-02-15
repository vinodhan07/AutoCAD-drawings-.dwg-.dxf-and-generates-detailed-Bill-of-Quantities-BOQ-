# Use official Python runtime as specific as possible
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for ODAFileConverter and Python packages
# libgl1, libglib2.0-0, libsm6, libxext6, libxrender1 are often needed for Qt apps (ODA)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Install ODA File Converter (User must provide the .deb file)
# We copy any .deb file from the backend directory
COPY ODAFileConverter*.deb /tmp/

# Install the .deb file if it exists, otherwise warn
RUN if ls /tmp/ODAFileConverter*.deb 1> /dev/null 2>&1; then \
        dpkg -i /tmp/ODAFileConverter*.deb || apt-get install -f -y; \
        echo "ODA File Converter installed"; \
    else \
        echo "WARNING: ODAFileConverter .deb not found. DWG conversion will not work."; \
    fi

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port (Render sets PORT env var, but good to document)
EXPOSE 8000

# Run the application
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
