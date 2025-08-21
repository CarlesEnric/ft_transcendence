# Ejemplo Completo de Uso del 2FA

## 🚀 **Escenario: Usuario Nuevo Configurando 2FA**

### **Paso 1: Registro y Login**
```bash
# Registro
curl -k -X POST -H "Content-Type: application/json" \
  -d '{"username":"juan","email":"juan@example.com","password":"mipassword123"}' \
  https://localhost:3000/api/auth/register

# Login
curl -k -X POST -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"mipassword123"}' \
  https://localhost:3000/api/auth/login -c juan_cookies.txt
```

### **Paso 2: Verificar Estado del 2FA**
```bash
curl -k -b juan_cookies.txt https://localhost:3000/api/auth/2fa/status

# Respuesta esperada:
# {"success":true,"enabled":false,"backupCodesRemaining":0}
```

### **Paso 3: Configurar 2FA**
```bash
curl -k -b juan_cookies.txt https://localhost:3000/api/auth/2fa/setup

# Respuesta incluye:
# - secret: "JBSWY3DPEHPK3PXP"
# - qrCode: "data:image/png;base64,iVBORw0KGgoAAAA..."
# - manualEntryKey: Para introducir manualmente en la app
# - backupCodes: ["A1B2C3D4", "E5F6G7H8", ...]
```

### **Paso 4: Escanear QR y Habilitar**
```bash
# Usuario escanea QR con Google Authenticator
# App genera código: 123456

curl -k -X POST -b juan_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"token":"123456","secret":"JBSWY3DPEHPK3PXP"}' \
  https://localhost:3000/api/auth/2fa/verify-setup

# Respuesta:
# {"success":true,"message":"2FA has been successfully enabled","backupCodes":[...]}
```

## 🔄 **Escenario: Usuario con 2FA Haciendo Login**

### **Paso 1: Login Inicial**
```bash
curl -k -X POST -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"mipassword123"}' \
  https://localhost:3000/api/auth/login -c juan_session.txt

# Usuario obtiene JWT pero necesita verificar 2FA
```

### **Paso 2: Verificar 2FA**
```bash
# Con código de la app (cambia cada 30 segundos)
curl -k -X POST -b juan_session.txt \
  -H "Content-Type: application/json" \
  -d '{"token":"654321"}' \
  https://localhost:3000/api/auth/2fa/verify

# O con código de respaldo (si no tiene el móvil)
curl -k -X POST -b juan_session.txt \
  -H "Content-Type: application/json" \
  -d '{"token":"A1B2C3D4","isBackupCode":true}' \
  https://localhost:3000/api/auth/2fa/verify
```

### **Paso 3: Acceso Completo**
```bash
# Ahora puede acceder a todas las funciones protegidas
curl -k -b juan_session.txt https://localhost:3000/api/auth/profile
curl -k -b juan_session.txt https://localhost:3000/api/matches/
# etc...
```

## 🛡️ **Gestión de Emergencia**

### **Si pierde el móvil:**
```bash
# Usar código de respaldo
curl -k -X POST -b juan_session.txt \
  -H "Content-Type: application/json" \
  -d '{"token":"E5F6G7H8","isBackupCode":true}' \
  https://localhost:3000/api/auth/2fa/verify

# Generar nuevos códigos de respaldo
curl -k -X POST -b juan_session.txt \
  https://localhost:3000/api/auth/2fa/regenerate-backup-codes
```

### **Si quiere deshabilitar 2FA:**
```bash
# Con contraseña
curl -k -X POST -b juan_session.txt \
  -H "Content-Type: application/json" \
  -d '{"password":"mipassword123"}' \
  https://localhost:3000/api/auth/2fa/disable

# O con código TOTP actual
curl -k -X POST -b juan_session.txt \
  -H "Content-Type: application/json" \
  -d '{"token":"789012"}' \
  https://localhost:3000/api/auth/2fa/disable
```

## 📱 **Apps Compatibles**
- Google Authenticator
- Authy
- Microsoft Authenticator
- 1Password
- Bitwarden
- Cualquier app TOTP

## 🔧 **Integración Frontend**

Para integrar en tu frontend:

1. **Verificar estado** en dashboard
2. **Mostrar QR** para configuración
3. **Solicitar código** en login si está activado
4. **Guardar códigos de respaldo** para el usuario
5. **Permitir gestión** (activar/desactivar/regenerar)

El sistema es completamente funcional y listo para producción! 🚀
