"""
Pruebas unitarias y de integridad para el Sistema de Edictos UNITEPC
"""
import sqlite3
import os
import json
import csv
import io
import server

def run_tests():
    print("Iniciando pruebas de integridad...")
    
    # 1. Probar inicialización de BD
    server.init_db()
    conn = server.get_db_connection()
    cur = conn.cursor()
    
    # 2. Verificar datos de muestra del PDF
    cur.execute("SELECT * FROM edictos WHERE codigo = 'EDICTO VR-EA 02-2026'")
    edicto = cur.fetchone()
    assert edicto is not None, "El edicto oficial de muestra debe existir"
    assert edicto["modalidad"] == "EXÁMEN DE GRADO", "Modalidad incorrecta"
    assert edicto["gestion"] == "2026", "Gestión incorrecta"
    assert "Amílcar Bruno Cáceres Pérez" in edicto["autoridad_nombre"], "Nombre de autoridad incorrecto"
    print("✓ Edicto oficial 'EDICTO VR-EA 02-2026' verificado con éxito")
    
    # 3. Verificar estudiantes del PDF
    cur.execute("SELECT * FROM defensas WHERE edicto_id = ?", (edicto["id"],))
    defensas = cur.fetchall()
    assert len(defensas) == 5, f"Se esperaban 5 defensas, se encontraron {len(defensas)}"
    
    nombres_esperados = [
        "LETICIA SOLEDAD MOLLINEDO HUAYGUA",
        "JUAN CARLOS MIXTO LAURA",
        "TALIA JULIA RIVERA YUGAR",
        "CARLOS JENSEN URIONA POZA",
        "JUAN ESCOBAR MENDOZA"
    ]
    for d in defensas:
        assert d["estudiante"] in nombres_esperados, f"Estudiante no reconocido: {d['estudiante']}"
    print("✓ Los 5 estudiantes de la muestra fueron verificados con éxito")
    
    # 4. Probar consulta de gestiones
    cur.execute("""
    SELECT 
        gestion,
        COUNT(*) as total_defensas,
        SUM(CASE WHEN estado = 'Aprobada' THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN estado = 'Programada' THEN 1 ELSE 0 END) as programadas,
        COUNT(DISTINCT carrera) as total_carreras
    FROM defensas
    GROUP BY gestion
    """)
    stats = cur.fetchone()
    assert stats["total_defensas"] >= 5, "Total de defensas incorrecto"
    assert stats["aprobadas"] == 4, f"Se esperaban 4 aprobadas, se obtuvieron {stats['aprobadas']}"
    assert stats["programadas"] == 1, f"Se esperaba 1 programada, se obtuvieron {stats['programadas']}"
    assert stats["total_carreras"] == 2, f"Se esperaban 2 carreras (Medicina y Sonido), se obtuvieron {stats['total_carreras']}"
    print("✓ Agregación estadística por gestión verificada con éxito")
    
    # 5. Probar generación de CSV
    cur.execute("""
    SELECT 
        d.id, d.gestion, d.estudiante, d.carrera, d.modalidad, 
        d.fecha_defensa_texto, d.hora, d.lugar, 
        d.tribunal_1, d.tribunal_2, d.estado, d.nota, 
        e.codigo as edicto
    FROM defensas d
    LEFT JOIN edictos e ON d.edicto_id = e.id
    WHERE d.gestion = '2026'
    """)
    rows = cur.fetchall()
    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(["ID", "Gestión", "Estudiante", "Carrera", "Modalidad", "Fecha", "Hora", "Lugar", "Tribunal 1", "Tribunal 2", "Estado", "Nota", "Edicto"])
    for r in rows:
        writer.writerow(list(r))
    csv_content = out.getvalue()
    assert "LETICIA SOLEDAD MOLLINEDO HUAYGUA" in csv_content
    # 6. Probar configuración de PIN de seguridad
    cur.execute("SELECT value FROM config WHERE key = 'app_pin'")
    pin_row = cur.fetchone()
    assert pin_row is not None and pin_row["value"] == "2026", "PIN de seguridad debe estar configurado"
    print("✓ Configuración de PIN de seguridad verificada con éxito")

    conn.close()
    print("¡TODAS LAS PRUEBAS PASARON SATISFACTORIAMENTE!")

if __name__ == "__main__":
    run_tests()
