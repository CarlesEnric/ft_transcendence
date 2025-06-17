#!/bin/sh
key_file="/app/key.pem"
crt_file="/app/cert.pem"

# Elimina carpetes si existeixen amb aquests noms
if [ -d "$key_file" ]; then
  echo "DEBUG: $key_file és un directori, s'elimina."
  rm -rf "$key_file"
fi
if [ -d "$crt_file" ]; then
  echo "DEBUG: $crt_file és un directori, s'elimina."
  rm -rf "$crt_file"
fi

if [ -e $key_file ] && [ -e $crt_file ]; then
    echo "Certificate already exists"
else
    openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout $key_file -out $crt_file -subj "/CN=localhost"
fi
exec "$@"