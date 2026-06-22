# Eliminación de cuenta — App Review

## Recorrido dentro de la app

1. Iniciar sesión con una cuenta de prueba.
2. Abrir **Perfil** desde la navegación inferior.
3. Seleccionar **Eliminar cuenta**.
4. Leer la advertencia y seleccionar **Continuar**.
5. Seleccionar **Eliminar cuenta definitivamente**.
6. Confirmar que la aplicación regresa al estado **Modo invitado**.

La eliminación es permanente. Borra el usuario de Supabase Auth y, mediante relaciones de base de datos con `ON DELETE CASCADE`, elimina su perfil, predicciones y puntajes.

## Lista para la grabación física

- Usar un iPhone o iPad físico con el build enviado a revisión.
- Grabar desde antes de iniciar sesión.
- Mostrar claramente cada una de las dos confirmaciones.
- Mantener la grabación hasta que aparezca **Modo invitado**.
- Comprobar que la cuenta eliminada ya no permite iniciar sesión.
- No mostrar contraseñas reales ni datos personales.

## Nota sugerida para App Review

> Account deletion is available directly in the app. Sign in, open Profile from the bottom navigation, select “Eliminar cuenta”, tap “Continuar”, and then tap “Eliminar cuenta definitivamente”. The account and associated profile, predictions, and points are permanently deleted, the local session is cleared, and the app returns to Guest Mode. A physical-device screen recording demonstrating the complete flow is attached.
