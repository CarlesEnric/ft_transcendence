# 🔧 Google OAuth2 Setup Guide

## Pas 1: Crear projecte a Google Cloud Console

1. **Visita Google Cloud Console**: https://console.cloud.google.com/
2. **Crea un nou projecte** o selecciona un existent
3. **Nom del projecte**: `ft-transcendence` (o el que prefereixis)

## Pas 2: Habilitar Google+ API

1. Ves a **APIs & Services > Library**
2. Busca "Google+ API" o "People API"
3. Clica **Enable**

## Pas 3: Configurar OAuth consent screen

1. Ves a **APIs & Services > OAuth consent screen**
2. Selecciona **External** (per testing) o **Internal** (si tens G Suite)
3. Omple la informació requerida:
   - **App name**: `ft-transcendence`
   - **User support email**: El teu email
   - **Developer contact**: El teu email

## Pas 4: Crear OAuth2 Client ID

1. Ves a **APIs & Services > Credentials**
2. Clica **+ CREATE CREDENTIALS > OAuth client ID**
3. **Application type**: Web application
4. **Name**: `ft_transcendence_auth`
5. **Authorized redirect URIs**:
   ```
   https://localhost/auth/google/callback
   http://localhost/auth/google/callback  (per development)
   ```

## Pas 5: Obtenir credencials

Després de crear el client, obtindràs:
- **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

## ⚠️ Nota Important

**Mai comparteixis aquestes credencials** en repositories públics!
