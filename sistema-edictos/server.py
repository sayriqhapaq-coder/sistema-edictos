#!/usr/bin/env python3
"""
Servidor del Sistema de Gestión de Edictos y Defensas de Grado
Universidad Técnica Privada Cosmos - UNITEPC
Sub Sede El Alto

Desarrollado con la biblioteca estándar de Python (sin dependencias externas).
Incluye base de datos SQLite persistente, API REST y servidor de archivos estáticos.
"""

import http.server
import socketserver
import json
import sqlite3
import os
import sys
import urllib.parse
import csv
import io
from datetime import datetime

PORT = int(os.environ.get("PORT", 8085))
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "edictos.db")
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Tabla de configuración
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    """)

    # Tabla de edictos
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS edictos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL UNIQUE,
        modalidad TEXT NOT NULL DEFAULT 'EXÁMEN DE GRADO',
        subtitulo TEXT NOT NULL DEFAULT 'TRIBUNAL INTERNO PARA DEFENSA DE GRADO',
        fecha_emision TEXT NOT NULL,
        fecha_texto TEXT,
        gestion TEXT NOT NULL,
        universidad TEXT DEFAULT 'UNIVERSIDAD TÉCNICA PRIVADA COSMOS',
        sede TEXT DEFAULT 'UNITEPC SUB SEDE EL ALTO',
        autoridad_nombre TEXT DEFAULT 'Lic. Amílcar Bruno Cáceres Pérez',
        autoridad_cargo TEXT DEFAULT 'VICERRECTOR',
        ciudad TEXT DEFAULT 'El Alto',
        mostrar_firma_digital INTEGER DEFAULT 1,
        mostrar_sello_digital INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Tabla de defensas / estudiantes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS defensas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        edicto_id INTEGER,
        estudiante TEXT NOT NULL,
        carrera TEXT NOT NULL,
        modalidad TEXT NOT NULL DEFAULT 'EXÁMEN DE GRADO',
        fecha_defensa TEXT NOT NULL,
        fecha_defensa_texto TEXT,
        hora TEXT NOT NULL,
        lugar TEXT NOT NULL,
        tribunal_1 TEXT NOT NULL,
        tribunal_2 TEXT NOT NULL,
        tribunal_externo TEXT DEFAULT '',
        gestion TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'Programada', -- 'Programada', 'Aprobada', 'Reprobada', 'Postergada'
        nota REAL DEFAULT 0,
        observaciones TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (edicto_id) REFERENCES edictos(id) ON DELETE SET NULL
    )
    """)

    # Configuraciones por defecto
    default_configs = {
        "universidad": "UNIVERSIDAD TÉCNICA PRIVADA COSMOS",
        "sede": "UNITEPC SUB SEDE EL ALTO",
        "autoridad_nombre": "Lic. Amílcar Bruno Cáceres Pérez",
        "autoridad_cargo": "VICERRECTOR",
        "ciudad_default": "El Alto",
        "gestion_actual": "2026",
        "formato_codigo": "EDICTO VR-EA {num}-{gestion}",
        "app_pin": "2026"
    }

    for k, v in default_configs.items():
        cursor.execute("INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)", (k, v))

    # Semilla de datos si está vacío (el documento de ejemplo del usuario)
    cursor.execute("SELECT COUNT(*) as count FROM edictos")
    if cursor.fetchone()["count"] == 0:
        cursor.execute("""
        INSERT INTO edictos (
            codigo, modalidad, subtitulo, fecha_emision, fecha_texto, gestion,
            universidad, sede, autoridad_nombre, autoridad_cargo, ciudad,
            mostrar_firma_digital, mostrar_sello_digital
        ) VALUES (
            'EDICTO VR-EA 02-2026',
            'EXÁMEN DE GRADO',
            'TRIBUNAL INTERNO PARA DEFENSA DE GRADO',
            '2026-03-02',
            'El Alto, 02 de marzo de 2026',
            '2026',
            'UNIVERSIDAD TÉCNICA PRIVADA COSMOS',
            'UNITEPC SUB SEDE EL ALTO',
            'Lic. Amílcar Bruno Cáceres Pérez',
            'VICERRECTOR',
            'El Alto',
            1,
            1
        )
        """)
        edicto_id = cursor.lastrowid

        estudiantes_muestra = [
            (edicto_id, "LETICIA SOLEDAD MOLLINEDO HUAYGUA", "MEDICINA", "EXÁMEN DE GRADO", "2026-03-19", "Jueves 19 de Marzo", "09:00", 'HOSPITAL "METODISTA"', "Dra. Magaly Mamani Uruña", "Dra. Francy Fabiola Pacheco Quisbert", "2026", "Aprobada", 85.0),
            (edicto_id, "JUAN CARLOS MIXTO LAURA", "MEDICINA", "EXÁMEN DE GRADO", "2026-03-19", "Jueves 19 de Marzo", "10:00", 'HOSPITAL "METODISTA"', "Dra. Magaly Mamani Uruña", "Dra. Francy Fabiola Pacheco Quisbert", "2026", "Aprobada", 88.0),
            (edicto_id, "TALIA JULIA RIVERA YUGAR", "MEDICINA", "EXÁMEN DE GRADO", "2026-03-19", "Jueves 19 de Marzo", "11:00", 'HOSPITAL "METODISTA"', "Dra. Magaly Mamani Uruña", "Dra. Francy Fabiola Pacheco Quisbert", "2026", "Aprobada", 90.0),
            (edicto_id, "CARLOS JENSEN URIONA POZA", "INGENIERIA DE SONIDO", "EXÁMEN DE GRADO", "2026-03-19", "Jueves 19 de Marzo", "14:00", "CONSEJO ACADÉMICO", "Ing. José Daniel Condorcet Mancilla", "Ing. Sergio E. Crespo Campero", "2026", "Aprobada", 92.0),
            (edicto_id, "JUAN ESCOBAR MENDOZA", "INGENIERIA DE SONIDO", "EXÁMEN DE GRADO", "2026-03-19", "Jueves 19 de Marzo", "14:00", "CONSEJO ACADÉMICO", "Ing. José Daniel Condorcet Mancilla", "Ing. Sergio E. Crespo Campero", "2026", "Programada", 0.0),
        ]

        cursor.executemany("""
        INSERT INTO defensas (
            edicto_id, estudiante, carrera, modalidad, fecha_defensa, fecha_defensa_texto,
            hora, lugar, tribunal_1, tribunal_2, gestion, estado, nota
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, estudiantes_muestra)

    conn.commit()
    conn.close()


class EdictosRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-App-Pin")
        self.end_headers()

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, default=str).encode("utf-8"))

    def send_error_json(self, message, status=400):
        self.send_json({"error": message}, status=status)

    def parse_json_body(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                return {}
            body = self.rfile.read(content_length).decode("utf-8")
            return json.loads(body)
        except Exception as e:
            return None

    def get_configured_pin(self):
        env_pin = os.environ.get("APP_PIN")
        if env_pin is not None:
            return env_pin.strip()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM config WHERE key = 'app_pin'")
        row = cursor.fetchone()
        conn.close()
        return row["value"].strip() if row and row["value"] else ""

    def is_authorized(self):
        pin = self.get_configured_pin()
        if not pin:
            return True
        client_pin = self.headers.get("X-App-Pin", "").strip()
        return client_pin == pin

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        query = urllib.parse.parse_qs(url.query)

        # API Endpoints
        if path.startswith("/api/"):
            # Estado del PIN (público)
            if path == "/api/auth/status":
                pin = self.get_configured_pin()
                self.send_json({"pin_required": bool(pin)})
                return

            # Verificar autorización para el resto de endpoints
            if not self.is_authorized():
                self.send_error_json("No autorizado. Ingrese el PIN de seguridad.", 401)
                return

            conn = get_db_connection()
            cursor = conn.cursor()

            try:
                # 1. Configuración
                if path == "/api/config":
                    cursor.execute("SELECT key, value FROM config")
                    configs = {row["key"]: row["value"] for row in cursor.fetchall()}
                    # No exponer el PIN por seguridad en GET /api/config
                    configs.pop("app_pin", None)
                    self.send_json(configs)
                    return

                # 2. Resumen por gestiones
                if path == "/api/gestiones":
                    cursor.execute("""
                    SELECT 
                        gestion,
                        COUNT(*) as total_defensas,
                        SUM(CASE WHEN estado = 'Aprobada' THEN 1 ELSE 0 END) as aprobadas,
                        SUM(CASE WHEN estado = 'Programada' THEN 1 ELSE 0 END) as programadas,
                        SUM(CASE WHEN estado = 'Reprobada' THEN 1 ELSE 0 END) as reprobadas,
                        COUNT(DISTINCT carrera) as total_carreras,
                        COUNT(DISTINCT edicto_id) as total_edictos
                    FROM defensas
                    GROUP BY gestion
                    ORDER BY gestion DESC
                    """)
                    rows = [dict(row) for row in cursor.fetchall()]
                    self.send_json(rows)
                    return

                # 3. Lista de edictos
                if path == "/api/edictos":
                    gestion_filter = query.get("gestion", [None])[0]
                    if gestion_filter:
                        cursor.execute("""
                        SELECT e.*, COUNT(d.id) as total_estudiantes
                        FROM edictos e
                        LEFT JOIN defensas d ON d.edicto_id = e.id
                        WHERE e.gestion = ?
                        GROUP BY e.id
                        ORDER BY e.created_at DESC
                        """, (gestion_filter,))
                    else:
                        cursor.execute("""
                        SELECT e.*, COUNT(d.id) as total_estudiantes
                        FROM edictos e
                        LEFT JOIN defensas d ON d.edicto_id = e.id
                        GROUP BY e.id
                        ORDER BY e.created_at DESC
                        """)
                    rows = [dict(row) for row in cursor.fetchall()]
                    self.send_json(rows)
                    return

                # 4. Obtener un edicto específico con sus defensas
                if path.startswith("/api/edictos/"):
                    edicto_id_str = path.replace("/api/edictos/", "").strip()
                    if edicto_id_str.isdigit():
                        edicto_id = int(edicto_id_str)
                        cursor.execute("SELECT * FROM edictos WHERE id = ?", (edicto_id,))
                        edicto = cursor.fetchone()
                        if not edicto:
                            self.send_error_json("Edicto no encontrado", 404)
                            return
                        edicto_dict = dict(edicto)

                        cursor.execute("""
                        SELECT * FROM defensas 
                        WHERE edicto_id = ? 
                        ORDER BY fecha_defensa ASC, hora ASC, id ASC
                        """, (edicto_id,))
                        edicto_dict["estudiantes"] = [dict(r) for r in cursor.fetchall()]
                        self.send_json(edicto_dict)
                        return

                # 5. Lista de defensas (con filtros por gestion, carrera, edicto_id, busqueda)
                if path == "/api/defensas":
                    sql = "SELECT d.*, e.codigo as edicto_codigo FROM defensas d LEFT JOIN edictos e ON d.edicto_id = e.id WHERE 1=1"
                    params = []

                    gestion = query.get("gestion", [None])[0]
                    if gestion:
                        sql += " AND d.gestion = ?"
                        params.append(gestion)

                    carrera = query.get("carrera", [None])[0]
                    if carrera:
                        sql += " AND d.carrera = ?"
                        params.append(carrera)

                    estado = query.get("estado", [None])[0]
                    if estado:
                        sql += " AND d.estado = ?"
                        params.append(estado)

                    edicto_id = query.get("edicto_id", [None])[0]
                    if edicto_id:
                        sql += " AND d.edicto_id = ?"
                        params.append(edicto_id)

                    search = query.get("q", [None])[0]
                    if search:
                        sql += " AND (d.estudiante LIKE ? OR d.carrera LIKE ? OR d.tribunal_1 LIKE ? OR d.tribunal_2 LIKE ?)"
                        wildcard = f"%{search}%"
                        params.extend([wildcard, wildcard, wildcard, wildcard])

                    sql += " ORDER BY d.gestion DESC, d.fecha_defensa DESC, d.hora ASC"
                    cursor.execute(sql, params)
                    rows = [dict(row) for row in cursor.fetchall()]
                    self.send_json(rows)
                    return

                # 6. Exportar CSV por gestión
                if path == "/api/export/csv":
                    gestion = query.get("gestion", ["2026"])[0]
                    cursor.execute("""
                    SELECT 
                        d.id, d.gestion, d.estudiante, d.carrera, d.modalidad, 
                        d.fecha_defensa_texto as fecha, d.hora, d.lugar, 
                        d.tribunal_1, d.tribunal_2, d.estado, d.nota, 
                        e.codigo as edicto, d.observaciones
                    FROM defensas d
                    LEFT JOIN edictos e ON d.edicto_id = e.id
                    WHERE d.gestion = ?
                    ORDER BY d.fecha_defensa ASC, d.hora ASC
                    """, (gestion,))
                    rows = cursor.fetchall()

                    output = io.StringIO()
                    writer = csv.writer(output)
                    writer.writerow([
                        "ID", "Gestión", "Estudiante", "Carrera", "Modalidad",
                        "Fecha Defensa", "Hora", "Lugar", "Tribunal 1", "Tribunal 2",
                        "Estado", "Calificación", "Edicto Asignado", "Observaciones"
                    ])
                    for r in rows:
                        writer.writerow(list(r))

                    csv_data = output.getvalue().encode("utf-8-sig")
                    self.send_response(200)
                    self.send_header("Content-Type", "text/csv; charset=utf-8")
                    self.send_header("Content-Disposition", f'attachment; filename="defensas_gestion_{gestion}.csv"')
                    self.end_headers()
                    self.wfile.write(csv_data)
                    return

                # 7. Respaldo completo JSON
                if path == "/api/backup":
                    cursor.execute("SELECT * FROM edictos")
                    edictos = [dict(r) for r in cursor.fetchall()]
                    cursor.execute("SELECT * FROM defensas")
                    defensas = [dict(r) for r in cursor.fetchall()]
                    cursor.execute("SELECT key, value FROM config")
                    configs = {row["key"]: row["value"] for row in cursor.fetchall()}

                    backup_data = {
                        "fecha_respaldo": datetime.now().isoformat(),
                        "config": configs,
                        "edictos": edictos,
                        "defensas": defensas
                    }
                    self.send_json(backup_data)
                    return

                self.send_error_json("Ruta no encontrada", 404)
            finally:
                conn.close()
            return

        # Archivos estáticos habituales
        return super().do_GET()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        body = self.parse_json_body()

        if body is None:
            self.send_error_json("JSON inválido")
            return

        # Login de autenticación
        if path == "/api/auth/login":
            pin = self.get_configured_pin()
            client_pin = str(body.get("pin", "")).strip()
            if not pin or client_pin == pin:
                self.send_json({"success": True, "message": "Acceso concedido"})
            else:
                self.send_error_json("PIN de acceso incorrecto", 401)
            return

        if not self.is_authorized():
            self.send_error_json("No autorizado. Ingrese el PIN de seguridad.", 401)
            return

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # 1. Crear nuevo Edicto
            if path == "/api/edictos":
                codigo = body.get("codigo", "").strip()
                if not codigo:
                    # Generar automáticamente si no viene
                    gestion = body.get("gestion", "2026")
                    cursor.execute("SELECT COUNT(*) as c FROM edictos WHERE gestion = ?", (gestion,))
                    count = cursor.fetchone()["c"] + 1
                    codigo = f"EDICTO VR-EA {count:02d}-{gestion}"

                cursor.execute("""
                INSERT INTO edictos (
                    codigo, modalidad, subtitulo, fecha_emision, fecha_texto, gestion,
                    universidad, sede, autoridad_nombre, autoridad_cargo, ciudad,
                    mostrar_firma_digital, mostrar_sello_digital
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    codigo,
                    body.get("modalidad", "EXÁMEN DE GRADO"),
                    body.get("subtitulo", "TRIBUNAL INTERNO PARA DEFENSA DE GRADO"),
                    body.get("fecha_emision", datetime.now().strftime("%Y-%m-%d")),
                    body.get("fecha_texto", f"El Alto, {datetime.now().strftime('%d de %m de %Y')}"),
                    body.get("gestion", "2026"),
                    body.get("universidad", "UNIVERSIDAD TÉCNICA PRIVADA COSMOS"),
                    body.get("sede", "UNITEPC SUB SEDE EL ALTO"),
                    body.get("autoridad_nombre", "Lic. Amílcar Bruno Cáceres Pérez"),
                    body.get("autoridad_cargo", "VICERRECTOR"),
                    body.get("ciudad", "El Alto"),
                    1 if body.get("mostrar_firma_digital", True) else 0,
                    1 if body.get("mostrar_sello_digital", True) else 0
                ))
                new_id = cursor.lastrowid

                # Si vienen ids de estudiantes/defensas para asignar
                estudiantes_ids = body.get("estudiantes_ids", [])
                if estudiantes_ids:
                    placeholders = ",".join("?" for _ in estudiantes_ids)
                    cursor.execute(f"UPDATE defensas SET edicto_id = ? WHERE id IN ({placeholders})", [new_id] + estudiantes_ids)

                conn.commit()
                self.send_json({"id": new_id, "codigo": codigo, "message": "Edicto creado exitosamente"}, 201)
                return

            # 2. Crear nueva defensa / estudiante
            if path == "/api/defensas":
                estudiante = body.get("estudiante", "").strip().upper()
                carrera = body.get("carrera", "").strip().upper()
                if not estudiante or not carrera:
                    self.send_error_json("El nombre del estudiante y la carrera son obligatorios")
                    return

                cursor.execute("""
                INSERT INTO defensas (
                    edicto_id, estudiante, carrera, modalidad, fecha_defensa, fecha_defensa_texto,
                    hora, lugar, tribunal_1, tribunal_2, tribunal_externo, gestion, estado, nota, observaciones
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    body.get("edicto_id"),
                    estudiante,
                    carrera,
                    body.get("modalidad", "EXÁMEN DE GRADO"),
                    body.get("fecha_defensa", datetime.now().strftime("%Y-%m-%d")),
                    body.get("fecha_defensa_texto", ""),
                    body.get("hora", "09:00"),
                    body.get("lugar", "CONSEJO ACADÉMICO"),
                    body.get("tribunal_1", ""),
                    body.get("tribunal_2", ""),
                    body.get("tribunal_externo", ""),
                    body.get("gestion", "2026"),
                    body.get("estado", "Programada"),
                    float(body.get("nota", 0.0) or 0.0),
                    body.get("observaciones", "")
                ))
                new_id = cursor.lastrowid
                conn.commit()
                self.send_json({"id": new_id, "message": "Defensa registrada exitosamente"}, 201)
                return

            # 3. Guardar configuración
            if path == "/api/config":
                for k, v in body.items():
                    cursor.execute("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", (k, str(v)))
                conn.commit()
                self.send_json({"message": "Configuración guardada exitosamente"})
                return

            # 4. Restaurar respaldo JSON
            if path == "/api/restore":
                defensas = body.get("defensas", [])
                edictos = body.get("edictos", [])
                configs = body.get("config", {})

                if not edictos and not defensas:
                    self.send_error_json("El respaldo no contiene datos válidos")
                    return

                cursor.execute("DELETE FROM defensas")
                cursor.execute("DELETE FROM edictos")

                for k, v in configs.items():
                    cursor.execute("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", (k, str(v)))

                for e in edictos:
                    cursor.execute("""
                    INSERT INTO edictos (
                        id, codigo, modalidad, subtitulo, fecha_emision, fecha_texto, gestion,
                        universidad, sede, autoridad_nombre, autoridad_cargo, ciudad,
                        mostrar_firma_digital, mostrar_sello_digital
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        e.get("id"), e.get("codigo"), e.get("modalidad"), e.get("subtitulo"),
                        e.get("fecha_emision"), e.get("fecha_texto"), e.get("gestion"),
                        e.get("universidad"), e.get("sede"), e.get("autoridad_nombre"),
                        e.get("autoridad_cargo"), e.get("ciudad"),
                        e.get("mostrar_firma_digital", 1), e.get("mostrar_sello_digital", 1)
                    ))

                for d in defensas:
                    cursor.execute("""
                    INSERT INTO defensas (
                        id, edicto_id, estudiante, carrera, modalidad, fecha_defensa, fecha_defensa_texto,
                        hora, lugar, tribunal_1, tribunal_2, tribunal_externo, gestion, estado, nota, observaciones
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        d.get("id"), d.get("edicto_id"), d.get("estudiante"), d.get("carrera"),
                        d.get("modalidad"), d.get("fecha_defensa"), d.get("fecha_defensa_texto"),
                        d.get("hora"), d.get("lugar"), d.get("tribunal_1"), d.get("tribunal_2"),
                        d.get("tribunal_externo", ""), d.get("gestion"), d.get("estado"),
                        d.get("nota", 0), d.get("observaciones", "")
                    ))

                conn.commit()
                self.send_json({"message": "Base de datos restaurada correctamente"})
                return

            self.send_error_json("Ruta POST no encontrada", 404)
        finally:
            conn.close()

    def do_PUT(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        body = self.parse_json_body()

        if body is None:
            self.send_error_json("JSON inválido")
            return

        if not self.is_authorized():
            self.send_error_json("No autorizado. Ingrese el PIN de seguridad.", 401)
            return

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # 1. Actualizar Edicto
            if path.startswith("/api/edictos/"):
                edicto_id = int(path.replace("/api/edictos/", "").strip())
                cursor.execute("""
                UPDATE edictos SET
                    codigo = COALESCE(?, codigo),
                    modalidad = COALESCE(?, modalidad),
                    subtitulo = COALESCE(?, subtitulo),
                    fecha_emision = COALESCE(?, fecha_emision),
                    fecha_texto = COALESCE(?, fecha_texto),
                    gestion = COALESCE(?, gestion),
                    universidad = COALESCE(?, universidad),
                    sede = COALESCE(?, sede),
                    autoridad_nombre = COALESCE(?, autoridad_nombre),
                    autoridad_cargo = COALESCE(?, autoridad_cargo),
                    ciudad = COALESCE(?, ciudad),
                    mostrar_firma_digital = COALESCE(?, mostrar_firma_digital),
                    mostrar_sello_digital = COALESCE(?, mostrar_sello_digital)
                WHERE id = ?
                """, (
                    body.get("codigo"), body.get("modalidad"), body.get("subtitulo"),
                    body.get("fecha_emision"), body.get("fecha_texto"), body.get("gestion"),
                    body.get("universidad"), body.get("sede"), body.get("autoridad_nombre"),
                    body.get("autoridad_cargo"), body.get("ciudad"),
                    body.get("mostrar_firma_digital"), body.get("mostrar_sello_digital"),
                    edicto_id
                ))

                if "estudiantes_ids" in body:
                    # Desvincular los que no estén en la lista
                    cursor.execute("UPDATE defensas SET edicto_id = NULL WHERE edicto_id = ?", (edicto_id,))
                    ids = body["estudiantes_ids"]
                    if ids:
                        placeholders = ",".join("?" for _ in ids)
                        cursor.execute(f"UPDATE defensas SET edicto_id = ? WHERE id IN ({placeholders})", [edicto_id] + ids)

                conn.commit()
                self.send_json({"message": "Edicto actualizado exitosamente"})
                return

            # 2. Actualizar Defensa
            if path.startswith("/api/defensas/"):
                defensa_id = int(path.replace("/api/defensas/", "").strip())
                cursor.execute("""
                UPDATE defensas SET
                    edicto_id = COALESCE(?, edicto_id),
                    estudiante = UPPER(COALESCE(?, estudiante)),
                    carrera = UPPER(COALESCE(?, carrera)),
                    modalidad = COALESCE(?, modalidad),
                    fecha_defensa = COALESCE(?, fecha_defensa),
                    fecha_defensa_texto = COALESCE(?, fecha_defensa_texto),
                    hora = COALESCE(?, hora),
                    lugar = COALESCE(?, lugar),
                    tribunal_1 = COALESCE(?, tribunal_1),
                    tribunal_2 = COALESCE(?, tribunal_2),
                    tribunal_externo = COALESCE(?, tribunal_externo),
                    gestion = COALESCE(?, gestion),
                    estado = COALESCE(?, estado),
                    nota = COALESCE(?, nota),
                    observaciones = COALESCE(?, observaciones)
                WHERE id = ?
                """, (
                    body.get("edicto_id"), body.get("estudiante"), body.get("carrera"),
                    body.get("modalidad"), body.get("fecha_defensa"), body.get("fecha_defensa_texto"),
                    body.get("hora"), body.get("lugar"), body.get("tribunal_1"), body.get("tribunal_2"),
                    body.get("tribunal_externo"), body.get("gestion"), body.get("estado"),
                    body.get("nota"), body.get("observaciones"),
                    defensa_id
                ))
                conn.commit()
                self.send_json({"message": "Defensa actualizada exitosamente"})
                return

            self.send_error_json("Ruta PUT no encontrada", 404)
        finally:
            conn.close()

    def do_DELETE(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path

        if not self.is_authorized():
            self.send_error_json("No autorizado. Ingrese el PIN de seguridad.", 401)
            return

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # 1. Eliminar edicto
            if path.startswith("/api/edictos/"):
                edicto_id = int(path.replace("/api/edictos/", "").strip())
                cursor.execute("UPDATE defensas SET edicto_id = NULL WHERE edicto_id = ?", (edicto_id,))
                cursor.execute("DELETE FROM edictos WHERE id = ?", (edicto_id,))
                conn.commit()
                self.send_json({"message": "Edicto eliminado"})
                return

            # 2. Eliminar defensa
            if path.startswith("/api/defensas/"):
                defensa_id = int(path.replace("/api/defensas/", "").strip())
                cursor.execute("DELETE FROM defensas WHERE id = ?", (defensa_id,))
                conn.commit()
                self.send_json({"message": "Defensa eliminada"})
                return

            self.send_error_json("Ruta DELETE no encontrada", 404)
        finally:
            conn.close()


def run_server(port=PORT):
    init_db()
    handler = EdictosRequestHandler

    # Buscar puerto disponible si el 8080 estuviera en uso
    current_port = port
    for _ in range(10):
        try:
            with socketserver.TCPServer(("", current_port), handler) as httpd:
                with open(os.path.join(STATIC_DIR, ".port"), "w") as pf:
                    pf.write(str(current_port))
                print(f"===========================================================")
                print(f"  SISTEMA DE EDICTOS DE DEFENSA DE GRADO - UNITEPC")
                print(f"  Servidor iniciado exitosamente en: http://localhost:{current_port}")
                print(f"  Base de datos SQLite: {DB_FILE}")
                print(f"  Presione Ctrl+C para detener el servidor.")
                print(f"===========================================================")
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError as e:
            if "Address already in use" in str(e):
                current_port += 1
            else:
                raise e


if __name__ == "__main__":
    port_to_use = PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port_to_use = int(sys.argv[1])
    run_server(port_to_use)
