#!/bin/bash
# Script de inicio rápido del Sistema de Edictos UNITEPC
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "  UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC"
echo "  Sistema de Gestión de Edictos y Defensas de Grado"
echo "  Sub Sede El Alto"
echo "=========================================================="

# Iniciar servidor Python en segundo plano
python3 server.py &
SERVER_PID=$!

# Esperar a que el servidor cree el archivo .port
sleep 1
PORT=8085
if [ -f "$DIR/.port" ]; then
    PORT=$(cat "$DIR/.port")
fi

URL="http://localhost:$PORT"
echo "Abriendo aplicación en: $URL"
open "$URL"

# Esperar al proceso del servidor
wait $SERVER_PID
