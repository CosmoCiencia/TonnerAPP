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

La corrección del mapa queda preparada para Android `1.0.13` (código `14`) e iOS
`1.0.3` (compilación `17`). Sincroniza los assets antes de compilar. Si esas
compilaciones ya se usaron en las tiendas, incrementa su número antes del envío.

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

Si `VITE_GOOGLE_MAPS_API_KEY` existe, puntos de venta usa Google Maps. Si no existe,
la carga falla o la clave se rechaza, usa Leaflet con el mapa estándar de OpenStreetMap.
La carga de Google tiene un límite de 10 segundos antes de pasar al respaldo.

El respaldo usa `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, sin clave CARTO,
con atribución visible, caché normal del navegador y sin descargas masivas ni modo
offline. Las apps móviles se identifican con `appendUserAgent` en Capacitor.
Consulta la [política del proveedor](https://operations.osmfoundation.org/policies/tiles/).

Las coordenadas faltantes, fuera de rango o `0,0` no generan pines ni afectan el
encuadre. Esos distribuidores permanecen en Lista y su botón Ruta busca por nombre,
dirección y ciudad. Completa sus coordenadas reales en TonnerManager para que
aparezcan en el mapa; no se sustituyen por ubicaciones aproximadas.

Para comprobar la validación de coordenadas y enlaces de ruta:

```bash
npm run test:maps
```

Un despliegue web publica la corrección del mapa en la web. Android e iOS incluyen
el código y la URL del mapa en el paquete, por lo que necesitan una versión nueva
en las tiendas. Los datos de distribuidores, productos y fichas técnicas siguen
consultándose en Supabase sin publicar versiones nuevas por cada cambio.
