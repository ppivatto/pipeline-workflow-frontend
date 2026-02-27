# 🖥 Frontend App (React + Vite)

Interfaz de usuario premium para la gestión del Pipeline de Seguros.

## 🚀 Instalación y Uso

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Construir para producción:
   ```bash
   npm run build
   ```

## 🎨 Sistema de Diseño

- **Arquitectura CSS**: Vanilla CSS con variables nativas en `src/index.css`.
- **Efecto Glassmorphism**: Clase global `.glass` para tarjetas semitransparentes.
- **Iconografía**: [Lucide React](https://lucide.dev/icons).
- **Tipografía**: Inter (o sans-serif del sistema).

## 📂 Organización de Carpetas

- `src/api`: Cliente Axios configurado.
- `src/context`: Proveedores de contexto (Idioma, Autenticación).
- `src/features`: Módulos de negocio (Accounts, Cases, Workflow, Dashboard).
- `src/layouts`: Componente `Layout` con Sidebar y navegación principal.
- `src/utils`: Funciones compartidas (Exportación Excel, formateo).

## 🌐 Multi-idioma

Se utiliza un `LanguageContext` simplificado. Las traducciones se encuentran en `src/context/LanguageContext.tsx`.

## 🔄 Gestión de Datos

TanStack Query (React Query) se encarga de:
1. Cachear peticiones.
2. Manejar estados de carga (`isLoading`).
3. Refrescar datos automáticamente en mutaciones.
