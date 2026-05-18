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
4. Pollamundialista: migrar desde `Tonner Cup`.
5. Manager: decidir si queda como admin interno protegido o app separada.

Comandos:

```bash
npm install
npm run dev
npm run build
```

Puerto local por defecto: `5192`.

Variables de entorno:

```bash
VITE_GOOGLE_MAPS_API_KEY=
```

Si `VITE_GOOGLE_MAPS_API_KEY` existe, puntos de venta usa Google Maps. Si no existe o Google no carga, usa el mapa Leaflet con tiles retina como respaldo.
