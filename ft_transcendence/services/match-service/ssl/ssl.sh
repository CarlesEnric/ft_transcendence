#!/bin/sh
set -e  # Exit on any error

key_file="/app/ssl/key.pem"
crt_file="/app/ssl/cert.pem"

# Check if openssl is available
if ! command -v openssl >/dev/null 2>&1; then
    echo "ERROR: openssl is not installed"
    exit 1
fi

# Create SSL directory if it doesn't exist
mkdir -p /app/ssl

# Clean up if paths are accidentally directories
if [ -d "$key_file" ]; then
  echo "DEBUG: $key_file is a directory, removing it."
  rm -rf "$key_file"
fi
if [ -d "$crt_file" ]; then
  echo "DEBUG: $crt_file is a directory, removing it."
  rm -rf "$crt_file"
fi

# Check if certificates exist as regular files
if [ -f "$key_file" ] && [ -f "$crt_file" ]; then
    echo "SSL certificates already exist"
else
    echo "Generating SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
        -keyout "$key_file" -out "$crt_file" \
        -subj "/CN=match-service"
    echo "SSL certificates generated successfully"
fi

# Validate generated certificates
if [ -f "$key_file" ] && [ -f "$crt_file" ]; then
    echo "SSL certificate validation:"
    openssl x509 -in "$crt_file" -text -noout | grep -E "(Subject|Issuer|Not Before|Not After)"
else
    echo "ERROR: SSL certificate generation failed"
    exit 1
fi

# Execute the command passed to the script
exec "$@"
