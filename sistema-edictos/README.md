# 🎓 Sistema de Edictos de Defensa de Grado - UNITEPC
### Sub Sede El Alto | Vicerrectorado

Sistema web completo y ligero para el registro de defensas de grado, generación e impresión de **Edictos Oficiales de Defensa de Grado** (idénticos al formato institucional de la Universidad Técnica Privada Cosmos), y control del historial de estudiantes graduados por gestión académica.

---

## 🚀 Inicio Rápido

### Opción 1: Con Servidor Python y Base de Datos SQLite (Recomendado)

En la terminal, dentro de la carpeta del proyecto:

```bash
cd /Users/amilcarbrunocaceresperez/.gemini/antigravity/scratch/sistema-edictos
./iniciar.sh
```

O directamente con Python (sin dependencias externas, usa la biblioteca estándar):

```bash
python3 server.py
```

Luego abra en su navegador web: **[http://localhost:8085](http://localhost:8085)**

### Opción 2: Modo Directo sin Servidor (Standalone)

También puede hacer doble clic en el archivo **`index.html`** para abrirlo en cualquier navegador (Safari, Chrome, Firefox, Edge). La aplicación incluye un sistema de almacenamiento local (`localStorage`) totalmente funcional con las mismas capacidades.

---

## 📋 Módulos del Sistema

### 1. 📄 Generador de Edictos Imprimibles (Vista Oficial)
* **Formato Idéntico:** Reproduce exactamente la cabecera, colores durazno institucional (`#F8C5B5`), bordes, tipografía y distribución del documento físico adjunto.
* **División de Tribunales:** La columna de *Tribunal Interno* presenta a ambos miembros divididos por la línea horizontal reglamentaria.
* **Pie Oficial y Firmas:** Incluye la fecha de emisión formal (*"El Alto, 02 de marzo de 2026"*), el pie de firma de la autoridad (*Lic. Amílcar Bruno Cáceres Pérez, VICERRECTOR, UNITEPC SUB SEDE EL ALTO*) y el sello redondo institucional.
* **Opciones de Impresión:**
  * **Modo Digital:** Imprime o guarda en PDF con firma y sello digital vectorizados para distribución electrónica inmediata.
  * **Modo Físico:** Desactive las casillas de *"Firma digital"* y *"Sello oficial"* para imprimir la hoja limpia y estampar la firma manual y sello de goma.
* **Botón Imprimir Oficial (PDF):** Configurado con `@media print` en tamaño Carta (*Letter*) con márgenes automáticos de 15 mm.

### 2. 🎓 Registro de Estudiantes y Defensas
* **Formulario completo:**
  * Nombre del estudiante (conversión automática a mayúsculas).
  * Carrera (catálogo y texto libre: Medicina, Ingeniería de Sonido, Odontología, etc.).
  * Modalidad (*Examen de Grado*, *Tesis*, *Proyecto de Grado*, *Trabajo Dirigido*).
  * Fecha de defensa (con formateador automático en español, ej: *"Jueves 19 de Marzo"*).
  * Hora y Lugar de defensa (ej: *Hospital "Metodista"*, *Consejo Académico*).
  * Tribunales internos 1 y 2.
  * Gestión académica (ej: *2026*, *2025*).
  * Asignación a edicto o pendiente.
  * Estado (*Programada*, *Aprobada*, *Reprobada*, *Postergada*) y Calificación.
* **Búsqueda en tiempo real:** Filtre por nombre de estudiante, carrera o tribunal.
* **Acciones rápidas:** Botón de un solo clic para marcar como *"Aprobada"* e ingresar la nota final.

### 3. 📊 Historial y Graduados por Gestión
* **Selector de Gestión:** Filtre para consultar las defensas de cualquier año (*2026*, *2025*, etc.).
* **Métricas KPI:**
  * Total de defensas programadas.
  * Total de egresados aprobados.
  * Defensas pendientes.
  * Número de carreras involucradas.
* **Distribución por carrera:** Barras estadísticas interactivas con porcentaje de titulados por carrera.
* **Exportación a Excel (CSV):** Descarga inmediata con codificación UTF-8 compatible con Microsoft Excel.
* **Reporte Imprimible:** Genera un resumen oficial para auditoría y archivos de Vicerrectorado.

### 4. ⚙️ Configuración Institucional y Respaldos
* Edición de datos de la institución, autoridades y formatos de código de edicto.
* **Copia de Seguridad (Backup):** Descargue la base de datos completa en archivo `.json`.
* **Restauración:** Suba un archivo `.json` previo para recuperar todos los datos.

---

## 📁 Estructura del Proyecto

```
sistema-edictos/
├── server.py        # Servidor HTTP y API REST en Python (SQLite integrado)
├── edictos.db       # Base de datos persistente SQLite
├── index.html       # Interfaz gráfica moderna y responsiva
├── styles.css       # Estilos visuales y diseño para impresión (@media print)
├── app.js           # Lógica interactiva en JavaScript (con soporte offline)
├── iniciar.sh       # Script de inicio rápido en macOS
├── test_app.py      # Pruebas automatizadas de integridad y datos semilla
└── README.md        # Documentación de uso
```

---

## 🏛️ Datos Pre-cargados (Documento de Referencia)

El sistema viene pre-cargado con los datos del documento oficial:
* **Edicto:** `EDICTO VR-EA 02-2026`
* **Modalidad:** `EXÁMEN DE GRADO`
* **Autoridad:** Lic. Amílcar Bruno Cáceres Pérez (Vicerrector, Sub Sede El Alto)
* **Fecha:** El Alto, 02 de marzo de 2026
* **Estudiantes:**
  1. Leticia Soledad Mollinedo Huaygua (Medicina, 09:00, Hospital "Metodista")
  2. Juan Carlos Mixto Laura (Medicina, 10:00, Hospital "Metodista")
  3. Talia Julia Rivera Yugar (Medicina, 11:00, Hospital "Metodista")
  4. Carlos Jensen Uriona Poza (Ingeniería de Sonido, 14:00, Consejo Académico)
  5. Juan Escobar Mendoza (Ingeniería de Sonido, 14:00, Consejo Académico)
