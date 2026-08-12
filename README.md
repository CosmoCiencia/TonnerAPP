# TonnerApp

Nueva app unificada del ecosistema Tonner.

Estado inicial:
- Home/shell tomado desde `Tonnerhub`.
- Splash, home, perfil, navegación inferior y tarjetas principales ya viven aquí.
- Los módulos existentes siguen intactos en sus carpetas originales.

Plan de migración:
1. Home: Hub.
2. Portafolio y puntos de venta: migrar desde `Tonner Catalog`.
3. Tonner Paint: migrar desde `TonnerPaint/ui`.
4. Herramientas de pintura: mantener Tonner Paint como módulo principal.
5. Manager: decidir si queda como admin interno protegido o app separada.

Comandos:

```bash
npm install
npm run dev
npm run build
```

Puerto local por defecto: `5192`.

Para preparar una compilación iOS, siempre sincroniza el build web antes de abrir Xcode:

```bash
npm run cap:sync:ios
npx cap open ios
```

El comando verifica que Supabase y TonnerPaint hayan quedado incorporados en
`ios/App/App/public`. Si falta alguna variable, se detiene antes de generar la
compilación para evitar enviar una app sin inicio de sesión.

Después de un rechazo, incrementa el número de compilación en Xcode. El proyecto
queda preparado para enviar la corrección como versión `1.0`, compilación `14`.

Si usas Xcode Cloud, configura en el workflow estas variables de entorno:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_TONNER_PAINT_API_URL
```

El script `ci_scripts/ci_post_clone.sh` sincroniza automáticamente los assets
web antes de compilar.

Variables de entorno:

```bash
VITE_GOOGLE_MAPS_API_KEY=
```

Si `VITE_GOOGLE_MAPS_API_KEY` existe, puntos de venta usa Google Maps. Si no existe o Google no carga, usa el mapa Leaflet con tiles retina como respaldo.
