/**
 * Sistema de Gestión de Edictos y Defensas de Grado - UNITEPC
 * Lógica del Cliente (app.js)
 */

// Estado global de la aplicación
const state = {
  config: {
    universidad: "UNIVERSIDAD TÉCNICA PRIVADA COSMOS",
    sede: "UNITEPC SUB SEDE EL ALTO",
    autoridad_nombre: "Lic. Amílcar Bruno Cáceres Pérez",
    autoridad_cargo: "VICERRECTOR",
    ciudad_default: "El Alto",
    gestion_actual: "2026",
    formato_codigo: "EDICTO VR-EA {num}-{gestion}",
    app_pin: "2026"
  },
  edictos: [],
  defensas: [],
  activeEdictoId: null,
  activeGestion: "2026",
  isApiAvailable: true,
  authPin: sessionStorage.getItem("unitepc_pin") || "",
  mostrarTribunal: true
};

// Datos semilla de respaldo si se abre como archivo local estático (file://)
const SEED_DATA = {
  edictos: [
    {
      id: 1,
      codigo: "EDICTO VR-EA 02-2026",
      modalidad: "EXÁMEN DE GRADO",
      subtitulo: "TRIBUNAL INTERNO PARA DEFENSA DE GRADO",
      fecha_emision: "2026-03-02",
      fecha_texto: "El Alto, 02 de marzo de 2026",
      gestion: "2026",
      universidad: "UNIVERSIDAD TÉCNICA PRIVADA COSMOS",
      sede: "UNITEPC SUB SEDE EL ALTO",
      autoridad_nombre: "Lic. Amílcar Bruno Cáceres Pérez",
      autoridad_cargo: "VICERRECTOR",
      ciudad: "El Alto",
      mostrar_firma_digital: 1,
      mostrar_sello_digital: 1
    }
  ],
  defensas: [
    {
      id: 1,
      edicto_id: 1,
      estudiante: "LETICIA SOLEDAD MOLLINEDO HUAYGUA",
      ci: "4892341",
      ci_expedido: "LP",
      celular: "71234567",
      carrera: "MEDICINA",
      modalidad: "EXÁMEN DE GRADO",
      fecha_defensa: "2026-03-19",
      fecha_defensa_texto: "Jueves 19 de Marzo",
      hora: "09:00",
      lugar: 'HOSPITAL "METODISTA"',
      tribunal_1: "Dra. Magaly Mamani Uruña",
      tribunal_2: "Dra. Francy Fabiola Pacheco Quisbert",
      gestion: "2026",
      estado: "Aprobada",
      nota: 85.0,
      observaciones: "Aprobada por unanimidad"
    },
    {
      id: 2,
      edicto_id: 1,
      estudiante: "JUAN CARLOS MIXTO LAURA",
      ci: "5948312",
      ci_expedido: "LP",
      celular: "72345678",
      carrera: "MEDICINA",
      modalidad: "EXÁMEN DE GRADO",
      fecha_defensa: "2026-03-19",
      fecha_defensa_texto: "Jueves 19 de Marzo",
      hora: "10:00",
      lugar: 'HOSPITAL "METODISTA"',
      tribunal_1: "Dra. Magaly Mamani Uruña",
      tribunal_2: "Dra. Francy Fabiola Pacheco Quisbert",
      gestion: "2026",
      estado: "Aprobada",
      nota: 88.0,
      observaciones: ""
    },
    {
      id: 3,
      edicto_id: 1,
      estudiante: "TALIA JULIA RIVERA YUGAR",
      ci: "6849201",
      ci_expedido: "EA",
      celular: "73456789",
      carrera: "MEDICINA",
      modalidad: "EXÁMEN DE GRADO",
      fecha_defensa: "2026-03-19",
      fecha_defensa_texto: "Jueves 19 de Marzo",
      hora: "11:00",
      lugar: 'HOSPITAL "METODISTA"',
      tribunal_1: "Dra. Magaly Mamani Uruña",
      tribunal_2: "Dra. Francy Fabiola Pacheco Quisbert",
      gestion: "2026",
      estado: "Aprobada",
      nota: 90.0,
      observaciones: ""
    },
    {
      id: 4,
      edicto_id: 1,
      estudiante: "CARLOS JENSEN URIONA POZA",
      ci: "5192834",
      ci_expedido: "CB",
      celular: "74567890",
      carrera: "INGENIERIA DE SONIDO",
      modalidad: "EXÁMEN DE GRADO",
      fecha_defensa: "2026-03-19",
      fecha_defensa_texto: "Jueves 19 de Marzo",
      hora: "14:00",
      lugar: "CONSEJO ACADÉMICO",
      tribunal_1: "Ing. José Daniel Condorcet Mancilla",
      tribunal_2: "Ing. Sergio E. Crespo Campero",
      gestion: "2026",
      estado: "Aprobada",
      nota: 92.0,
      observaciones: "Felicitación pública"
    },
    {
      id: 5,
      edicto_id: 1,
      estudiante: "JUAN ESCOBAR MENDOZA",
      ci: "7029384",
      ci_expedido: "LP",
      celular: "75678901",
      carrera: "INGENIERIA DE SONIDO",
      modalidad: "EXÁMEN DE GRADO",
      fecha_defensa: "2026-03-19",
      fecha_defensa_texto: "Jueves 19 de Marzo",
      hora: "14:00",
      lugar: "CONSEJO ACADÉMICO",
      tribunal_1: "Ing. José Daniel Condorcet Mancilla",
      tribunal_2: "Ing. Sergio E. Crespo Campero",
      gestion: "2026",
      estado: "Programada",
      nota: 0.0,
      observaciones: ""
    }
  ]
};

// ==========================================
// UTILIDADES DE FECHA EN ESPAÑOL
// ==========================================

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES_CAP = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function formatearFechaTextoDefensa(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const diaSemana = DIAS_SEMANA[d.getDay()];
  const dia = d.getDate();
  const mes = MESES_CAP[d.getMonth()];
  return `${diaSemana} ${dia} de ${mes}`;
}

function formatearFechaEmisionOficial(dateStr, ciudad = "El Alto") {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = MESES[d.getMonth()];
  const anio = d.getFullYear();
  return `${ciudad}, ${dia} de ${mes} de ${anio}`;
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> <div>${message}</div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================
// CAPA DE DATOS Y AUTENTICACIÓN (API O LOCALSTORAGE)
// ==========================================

function promptPinLogin() {
  const modal = document.getElementById("modal-pin-lock");
  if (modal) {
    modal.classList.add("show");
    const input = document.getElementById("input-pin-auth");
    if (input) {
      input.value = "";
      setTimeout(() => input.focus(), 100);
    }
  }
}

async function fetchJson(endpoint, options = {}) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    if (state.authPin) {
      headers["X-App-Pin"] = state.authPin;
    }
    const res = await fetch(endpoint, {
      ...options,
      headers
    });
    if (res.status === 401) {
      promptPinLogin();
      throw new Error("No autorizado. Ingrese su PIN.");
    }
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call falló en ${endpoint}:`, err.message);
    throw err;
  }
}

async function loadData() {
  try {
    // Intentar cargar de la API de Python
    const [cfg, edictos, defensas] = await Promise.all([
      fetchJson("/api/config"),
      fetchJson("/api/edictos"),
      fetchJson("/api/defensas")
    ]);
    state.config = { ...state.config, ...cfg };
    state.edictos = edictos;
    state.defensas = defensas;
    state.isApiAvailable = true;
  } catch (e) {
    // Modo desconectado / localStorage
    state.isApiAvailable = false;
    console.info("Usando almacenamiento local (localStorage)");
    const storedCfg = localStorage.getItem("unitepc_config");
    const storedEdictos = localStorage.getItem("unitepc_edictos");
    const storedDefensas = localStorage.getItem("unitepc_defensas");

    if (storedCfg) state.config = JSON.parse(storedCfg);
    if (storedEdictos) state.edictos = JSON.parse(storedEdictos);
    else state.edictos = [...SEED_DATA.edictos];

    if (storedDefensas) state.defensas = JSON.parse(storedDefensas);
    else state.defensas = [...SEED_DATA.defensas];
  }

  // Establecer edicto activo inicial
  if (state.edictos.length > 0) {
    if (!state.activeEdictoId || !state.edictos.find(e => e.id === state.activeEdictoId)) {
      state.activeEdictoId = state.edictos[0].id;
    }
  }

  renderApp();
}

function persistLocalData() {
  if (!state.isApiAvailable) {
    localStorage.setItem("unitepc_config", JSON.stringify(state.config));
    localStorage.setItem("unitepc_edictos", JSON.stringify(state.edictos));
    localStorage.setItem("unitepc_defensas", JSON.stringify(state.defensas));
  }
}

// ==========================================
// RENDERIZADO PRINCIPAL
// ==========================================

function renderApp() {
  updateAuthorityBadges();
  renderEdictosSelector();
  renderActiveEdictoSheet();
  renderDefensasTable();
  renderFiltrosCarrerasYEdictos();
  renderReportesGestion();
  populateConfigForm();
}

function updateAuthorityBadges() {
  const badgeName = document.getElementById("badge-authority-name");
  if (badgeName) badgeName.textContent = state.config.autoridad_nombre || "Lic. Amílcar Bruno Cáceres Pérez";
}

// ==========================================
// 1. RENDERIZADO DE LA HOJA DEL EDICTO OFICIAL
// ==========================================

function renderEdictosSelector() {
  const select = document.getElementById("select-active-edicto");
  if (!select) return;
  select.innerHTML = "";

  state.edictos.forEach(ed => {
    const opt = document.createElement("option");
    opt.value = ed.id;
    opt.textContent = `${ed.codigo} (${ed.gestion}) - ${ed.modalidad}`;
    if (ed.id === state.activeEdictoId) opt.selected = true;
    select.appendChild(opt);
  });
}

function actualizarModoTribunal(conTribunal) {
  state.mostrarTribunal = conTribunal;
  const table = document.getElementById("paper-table");
  const btnCon = document.getElementById("btn-mode-con-tribunal");
  const btnSin = document.getElementById("btn-mode-sin-tribunal");
  const subtitle = document.getElementById("paper-subtitle");
  const edicto = state.edictos.find(e => e.id === state.activeEdictoId);

  if (conTribunal) {
    if (table) table.classList.remove("sin-tribunal");
    if (btnCon) {
      btnCon.style.background = "#0f3460";
      btnCon.style.color = "#ffffff";
    }
    if (btnSin) {
      btnSin.style.background = "transparent";
      btnSin.style.color = "#475569";
    }
    if (subtitle && edicto) {
      subtitle.textContent = edicto.subtitulo || "TRIBUNAL INTERNO PARA DEFENSA DE GRADO";
    }
  } else {
    if (table) table.classList.add("sin-tribunal");
    if (btnCon) {
      btnCon.style.background = "transparent";
      btnCon.style.color = "#475569";
    }
    if (btnSin) {
      btnSin.style.background = "#0f3460";
      btnSin.style.color = "#ffffff";
    }
    if (subtitle) {
      subtitle.textContent = "DEFENSA DE GRADO";
    }
  }
}

function renderActiveEdictoSheet() {
  const edicto = state.edictos.find(e => e.id === state.activeEdictoId);
  if (!edicto) {
    document.getElementById("paper-table-body").innerHTML = `
      <tr><td colspan="6" style="padding:20px; text-align:center;">No hay edicto seleccionado. Cree uno nuevo para comenzar.</td></tr>
    `;
    return;
  }

  // Textos oficiales de cabecera
  document.getElementById("paper-univ-title").textContent = edicto.universidad || state.config.universidad;
  document.getElementById("paper-edicto-code").textContent = edicto.codigo;
  document.getElementById("paper-modality").textContent = edicto.modalidad;
  document.getElementById("paper-subtitle").textContent = edicto.subtitulo;
  document.getElementById("paper-date-city").textContent = edicto.fecha_texto || `${edicto.ciudad || state.config.ciudad_default}, ${edicto.fecha_emision}`;

  // Aplicar modo de tribunal (con o sin tribunal)
  actualizarModoTribunal(state.mostrarTribunal);

  // Textos oficiales de firma
  document.getElementById("paper-authority-name").textContent = edicto.autoridad_nombre || state.config.autoridad_nombre;
  document.getElementById("paper-authority-cargo").textContent = edicto.autoridad_cargo || state.config.autoridad_cargo;
  document.getElementById("paper-authority-sede").textContent = edicto.sede || state.config.sede;

  // Firma y sello (toggles)
  const showFirma = document.getElementById("chk-toggle-firma").checked;
  const showSello = document.getElementById("chk-toggle-sello").checked;
  const signatureGraphics = document.getElementById("signature-graphics");
  const stampSeal = document.getElementById("paper-stamp-seal");

  if (signatureGraphics) signatureGraphics.style.display = showFirma ? "block" : "none";
  if (stampSeal) stampSeal.style.display = showSello ? "block" : "none";

  // Estudiantes asignados a este edicto
  const tbody = document.getElementById("paper-table-body");
  const estudiantesEdicto = state.defensas.filter(d => Number(d.edicto_id) === Number(edicto.id));

  if (estudiantesEdicto.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding:25px; text-align:center; color:#6b7280; font-style:italic;">
          Este edicto aún no tiene estudiantes asignados. <br>
          Haga clic en <strong>"👥 Gestionar Estudiantes"</strong> para agregar postulantes a este edicto.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = estudiantesEdicto.map(d => {
    const fechaText = d.fecha_defensa_texto || formatearFechaTextoDefensa(d.fecha_defensa);
    return `
      <tr>
        <td class="col-estudiante">${escapeHtml(d.estudiante)}</td>
        <td class="col-carrera">${escapeHtml(d.carrera)}</td>
        <td class="col-fecha">${escapeHtml(fechaText)}</td>
        <td class="col-hrs">${escapeHtml(d.hora)}</td>
        <td class="col-lugar">${escapeHtml(d.lugar)}</td>
        <td class="col-tribunal">
          <div class="tribunal-split">
            <div class="tribunal-member">${escapeHtml(d.tribunal_1 || '')}</div>
            ${d.tribunal_2 ? `<div class="tribunal-divider"></div><div class="tribunal-member">${escapeHtml(d.tribunal_2)}</div>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// ==========================================
// 2. RENDERIZADO DE LA TABLA DE DEFENSAS
// ==========================================

function renderDefensasTable() {
  const tbody = document.getElementById("tabla-defensas-body");
  if (!tbody) return;

  const query = (document.getElementById("filtro-busqueda").value || "").toLowerCase().trim();
  const filtroGestion = document.getElementById("filtro-gestion").value;
  const filtroCarrera = document.getElementById("filtro-carrera").value;
  const filtroEstado = document.getElementById("filtro-estado").value;
  const filtroEdicto = document.getElementById("filtro-edicto").value;

  let filtradas = state.defensas.filter(d => {
    if (filtroGestion && d.gestion !== filtroGestion) return false;
    if (filtroCarrera && d.carrera !== filtroCarrera) return false;
    if (filtroEstado && d.estado !== filtroEstado) return false;
    if (filtroEdicto && String(d.edicto_id) !== String(filtroEdicto)) return false;

    if (query) {
      const matchEstudiante = d.estudiante.toLowerCase().includes(query);
      const matchCarrera = d.carrera.toLowerCase().includes(query);
      const matchT1 = (d.tribunal_1 || "").toLowerCase().includes(query);
      const matchT2 = (d.tribunal_2 || "").toLowerCase().includes(query);
      const matchLugar = (d.lugar || "").toLowerCase().includes(query);
      if (!matchEstudiante && !matchCarrera && !matchT1 && !matchT2 && !matchLugar) return false;
    }
    return true;
  });

  if (filtradas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:2rem; color:#6b7280;">
          No se encontraron registros de defensas con los filtros aplicados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtradas.map(d => {
    const edicto = state.edictos.find(e => Number(e.id) === Number(d.edicto_id));
    const badgeClass = `badge-${d.estado ? d.estado.toLowerCase() : 'programada'}`;
    const fechaText = d.fecha_defensa_texto || formatearFechaTextoDefensa(d.fecha_defensa);

    // Enlace directo de notificación por WhatsApp si tiene celular
    const cleanPhone = (d.celular || "").replace(/\D/g, "");
    const waNumber = cleanPhone ? (cleanPhone.startsWith("591") ? cleanPhone : `591${cleanPhone}`) : "";
    const waMensaje = encodeURIComponent(`Estimado/a ${d.estudiante}, UNITEPC Sub Sede El Alto le notifica que su Defensa de Grado ha sido programada para el ${fechaText} a horas ${d.hora} en ${d.lugar}.`);
    const waPill = cleanPhone ? `
      <div style="margin-top:3px;">
        <a href="https://wa.me/${waNumber}?text=${waMensaje}" target="_blank" 
           style="display:inline-flex; align-items:center; gap:3px; background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; border-radius:4px; padding:1px 5px; font-size:0.75rem; text-decoration:none; font-weight:600;" 
           title="Enviar citación oficial por WhatsApp">
          📱 <span>${escapeHtml(d.celular)}</span>
        </a>
      </div>
    ` : '';

    const ciText = d.ci ? `<small style="display:block; color:#475569; font-weight:600; font-size:0.75rem;">C.I. ${escapeHtml(d.ci)} ${escapeHtml(d.ci_expedido || '')}</small>` : '';

    return `
      <tr>
        <td>
          <strong>${escapeHtml(d.estudiante)}</strong>
          ${ciText}
          ${waPill}
        </td>
        <td>${escapeHtml(d.carrera)}</td>
        <td><small>${escapeHtml(d.modalidad || 'EXÁMEN DE GRADO')}</small></td>
        <td>${escapeHtml(fechaText)} <br><small style="color:#6b7280;">${escapeHtml(d.hora)} hrs</small></td>
        <td>${escapeHtml(d.lugar)}</td>
        <td>
          <small>
            1: ${escapeHtml(d.tribunal_1)}<br>
            2: ${escapeHtml(d.tribunal_2)}
          </small>
        </td>
        <td><span class="badge" style="background:#e2e8f0; color:#334155;">${escapeHtml(d.gestion)}</span></td>
        <td>
          ${edicto ? `<span style="font-size:0.8rem; font-weight:600; color:var(--primary);">${escapeHtml(edicto.codigo)}</span>` : '<span style="color:#9ca3af; font-size:0.8rem;">(Sin edicto)</span>'}
        </td>
        <td><span class="badge ${badgeClass}">${escapeHtml(d.estado)}</span></td>
        <td style="text-align:center;">
          <div style="display:flex; justify-content:center; gap:0.3rem;">
            ${d.estado !== 'Aprobada' ? `
              <button class="btn btn-outline btn-sm" style="color:var(--success); padding:3px 6px;" onclick="marcarAprobada(${d.id})" title="Calificar / Aprobar">
                ✓
              </button>
            ` : ''}
            <button class="btn btn-outline btn-sm" style="color:#0f3460; padding:3px 6px;" onclick="verActaDefensa(${d.id})" title="Imprimir Acta de Calificación Oficial">
              📄
            </button>
            <button class="btn btn-outline btn-sm" style="color:#16a34a; padding:3px 6px;" onclick="verCertificadoDefensa(${d.id})" title="Emitir Certificado de Aprobación">
              📜
            </button>
            <button class="btn btn-outline btn-sm" style="padding:3px 6px;" onclick="editarDefensa(${d.id})" title="Editar datos">
              ✏️
            </button>
            <button class="btn btn-outline btn-sm" style="color:var(--danger); padding:3px 6px;" onclick="eliminarDefensa(${d.id})" title="Eliminar">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Obtener todas las gestiones disponibles desde 2019 hasta la actual/futuras + personalizadas
function obtenerGestionesDisponibles() {
  const anioActual = new Date().getFullYear();
  const anosBase = [];
  for (let a = anioActual + 1; a >= 2019; a--) {
    anosBase.push(String(a));
  }
  const anosDatos = state.defensas.map(d => d.gestion).concat(state.edictos.map(e => e.gestion));
  return [...new Set([...anosBase, ...anosDatos])].filter(Boolean).sort((a, b) => {
    return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function renderFiltrosCarrerasYEdictos() {
  // Carreras únicas
  const carreras = [...new Set(state.defensas.map(d => d.carrera).filter(Boolean))].sort();
  const selectCarrera = document.getElementById("filtro-carrera");
  if (selectCarrera) {
    const valActual = selectCarrera.value;
    selectCarrera.innerHTML = '<option value="">Todas las carreras</option>';
    carreras.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      if (c === valActual) opt.selected = true;
      selectCarrera.appendChild(opt);
    });
  }

  // Edictos
  const selectEdicto = document.getElementById("filtro-edicto");
  if (selectEdicto) {
    const valActual = selectEdicto.value;
    selectEdicto.innerHTML = '<option value="">Todos los edictos</option>';
    state.edictos.forEach(e => {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = e.codigo;
      if (String(e.id) === String(valActual)) opt.selected = true;
      selectEdicto.appendChild(opt);
    });
  }

  // Gestiones disponibles dinámicamente desde 2019
  const gestiones = obtenerGestionesDisponibles();

  // 1. Selector de filtro en vista de Defensas
  const selectFiltroGestion = document.getElementById("filtro-gestion");
  if (selectFiltroGestion) {
    const valActual = selectFiltroGestion.value;
    selectFiltroGestion.innerHTML = '<option value="">Todas las gestiones (2019 - 2026+)</option>';
    gestiones.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = `Gestión ${g}`;
      if (g === valActual) opt.selected = true;
      selectFiltroGestion.appendChild(opt);
    });
  }

  // 2. Selector en vista de Reportes y Titulados
  const selectGestionReporte = document.getElementById("reporte-select-gestion");
  if (selectGestionReporte) {
    const valActual = selectGestionReporte.value || state.activeGestion || "2026";
    selectGestionReporte.innerHTML = "";
    gestiones.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = `Gestión ${g}`;
      if (g === valActual) opt.selected = true;
      selectGestionReporte.appendChild(opt);
    });
  }
}

// ==========================================
// 3. RENDERIZADO DE REPORTES POR GESTIÓN
// ==========================================

function renderReportesGestion() {
  const gestionSelect = document.getElementById("reporte-select-gestion");
  const gestion = (gestionSelect && gestionSelect.value) ? gestionSelect.value : state.activeGestion;
  state.activeGestion = gestion;

  const labelGestion = document.getElementById("label-gestion-activa");
  if (labelGestion) labelGestion.textContent = gestion;

  const defensasGestion = state.defensas.filter(d => d.gestion === gestion);
  const total = defensasGestion.length;
  const aprobadas = defensasGestion.filter(d => d.estado === "Aprobada").length;
  const programadas = defensasGestion.filter(d => d.estado === "Programada").length;

  const carrerasMap = {};
  defensasGestion.forEach(d => {
    if (!carrerasMap[d.carrera]) carrerasMap[d.carrera] = 0;
    carrerasMap[d.carrera]++;
  });

  const totalCarreras = Object.keys(carrerasMap).length;

  // Actualizar contadores KPI
  document.getElementById("stat-total-defensas").textContent = total;
  document.getElementById("stat-total-aprobadas").textContent = aprobadas;
  document.getElementById("stat-total-programadas").textContent = programadas;
  document.getElementById("stat-total-carreras").textContent = totalCarreras;

  // Barras de progreso por carrera
  const containerBars = document.getElementById("carreras-progress-container");
  if (containerBars) {
    if (total === 0) {
      containerBars.innerHTML = '<p style="color:#6b7280; font-size:0.85rem;">No hay registros para esta gestión.</p>';
    } else {
      containerBars.innerHTML = Object.entries(carrerasMap).map(([carrera, count]) => {
        const percent = Math.round((count / total) * 100);
        return `
          <div class="carrera-bar-item">
            <div class="carrera-bar-header">
              <span>${escapeHtml(carrera)}</span>
              <span><strong>${count}</strong> (${percent}%)</span>
            </div>
            <div class="carrera-progress-bg">
              <div class="carrera-progress-fill" style="width: ${percent}%;"></div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // Tabla detallada de la gestión
  const tbody = document.getElementById("tabla-reporte-gestion-body");
  if (tbody) {
    if (defensasGestion.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:#6b7280;">No hay defensas registradas para la gestión ${gestion}.</td></tr>`;
    } else {
      tbody.innerHTML = defensasGestion.map(d => {
        const edicto = state.edictos.find(e => Number(e.id) === Number(d.edicto_id));
        const badgeClass = `badge-${d.estado ? d.estado.toLowerCase() : 'programada'}`;
        const fechaText = d.fecha_defensa_texto || formatearFechaTextoDefensa(d.fecha_defensa);
        return `
          <tr>
            <td><strong>${escapeHtml(d.estudiante)}</strong></td>
            <td>${escapeHtml(d.carrera)}</td>
            <td>${escapeHtml(fechaText)} ${escapeHtml(d.hora)}</td>
            <td><small>${escapeHtml(d.tribunal_1)}<br>${escapeHtml(d.tribunal_2)}</small></td>
            <td>${edicto ? `<span style="font-size:0.8rem; font-weight:600;">${escapeHtml(edicto.codigo)}</span>` : '-'}</td>
            <td><span class="badge ${badgeClass}">${escapeHtml(d.estado)}</span></td>
            <td><strong>${d.nota ? d.nota : '-'}</strong></td>
          </tr>
        `;
      }).join("");
    }
  }

  // Renderizar la hoja oficial imprimible de titulados para esta gestión
  renderNominaTituladosSheet();
}

function renderNominaTituladosSheet() {
  const gestion = state.activeGestion || "2026";
  const defensasGestion = state.defensas.filter(d => d.gestion === gestion);
  
  // Titulados: los que aprobaron su defensa (o todos si aún no hay aprobados)
  const aprobados = defensasGestion.filter(d => d.estado === "Aprobada");
  const lista = aprobados.length > 0 ? aprobados : defensasGestion;

  // Cabeceras y textos oficiales
  const univEl = document.getElementById("rep-univ-title");
  if (univEl) univEl.textContent = state.config.universidad || "UNIVERSIDAD TÉCNICA PRIVADA COSMOS";
  
  const sedeEl = document.getElementById("rep-sede");
  if (sedeEl) sedeEl.textContent = state.config.sede || "UNITEPC SUB SEDE EL ALTO";

  const gestionEl = document.getElementById("rep-gestion-title");
  if (gestionEl) gestionEl.textContent = `GESTIÓN ACADÉMICA ${gestion}`;

  const hoy = new Date().toISOString().split("T")[0];
  const ciudad = state.config.ciudad_default || "El Alto";
  const fechaTexto = formatearFechaEmisionOficial(hoy, ciudad);

  const dateCityEl = document.getElementById("rep-date-city");
  if (dateCityEl) dateCityEl.textContent = fechaTexto;

  const sheetFechaEl = document.getElementById("rep-sheet-fecha");
  if (sheetFechaEl) sheetFechaEl.textContent = fechaTexto;

  const totalEl = document.getElementById("rep-sheet-total");
  if (totalEl) totalEl.textContent = lista.length;

  const carrerasCount = [...new Set(lista.map(d => d.carrera))].length;
  const carrerasEl = document.getElementById("rep-sheet-carreras");
  if (carrerasEl) carrerasEl.textContent = carrerasCount;

  // Firmas
  const authNameEl = document.getElementById("rep-authority-name");
  if (authNameEl) authNameEl.textContent = state.config.autoridad_nombre || "Lic. Amílcar Bruno Cáceres Pérez";

  const authCargoEl = document.getElementById("rep-authority-cargo");
  if (authCargoEl) authCargoEl.textContent = state.config.autoridad_cargo || "VICERRECTOR";

  const authSedeEl = document.getElementById("rep-authority-sede");
  if (authSedeEl) authSedeEl.textContent = state.config.sede || "UNITEPC SUB SEDE EL ALTO";

  // Llenar tabla oficial de titulados
  const tbody = document.getElementById("rep-table-body");
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:25px; color:#6b7280; font-style:italic;">No hay estudiantes titulados registrados para la gestión ${gestion}.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map((d, idx) => {
    const fechaText = d.fecha_defensa_texto || formatearFechaTextoDefensa(d.fecha_defensa);
    return `
      <tr>
        <td style="font-weight:700; text-align:center;">${idx + 1}</td>
        <td style="text-align:left; padding-left:8px; font-weight:600;">${escapeHtml(d.estudiante)}</td>
        <td style="text-align:center;">${escapeHtml(d.carrera)}</td>
        <td style="text-align:center;">${escapeHtml(d.modalidad || 'EXÁMEN DE GRADO')}</td>
        <td style="text-align:center;">${escapeHtml(fechaText)}</td>
        <td style="font-weight:700; text-align:center;">${escapeHtml(d.hora || '-')}</td>
        <td style="font-weight:700; text-align:center;">${d.nota ? d.nota : (d.estado === 'Aprobada' ? 'APROB.' : '-')}</td>
      </tr>
    `;
  }).join("");
}

// ==========================================
// 4. CONFIGURACIÓN INSTITUCIONAL
// ==========================================

function populateConfigForm() {
  document.getElementById("cfg-universidad").value = state.config.universidad || "";
  document.getElementById("cfg-sede").value = state.config.sede || "";
  document.getElementById("cfg-ciudad").value = state.config.ciudad_default || "";
  document.getElementById("cfg-autoridad-nombre").value = state.config.autoridad_nombre || "";
  document.getElementById("cfg-autoridad-cargo").value = state.config.autoridad_cargo || "";
  document.getElementById("cfg-gestion-actual").value = state.config.gestion_actual || "2026";
  document.getElementById("cfg-formato-codigo").value = state.config.formato_codigo || "EDICTO VR-EA {num}-{gestion}";
  const pinInput = document.getElementById("cfg-app-pin");
  if (pinInput) pinInput.value = state.config.app_pin || "";
}

// ==========================================
// MODALES Y OPERACIONES CRUD
// ==========================================

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("show");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("show");
}

// Modal de Nueva / Editar Defensa
function openModalNuevaDefensa() {
  document.getElementById("modal-defensa-title").textContent = "Registrar Nueva Defensa de Grado";
  document.getElementById("form-defensa").reset();
  document.getElementById("defensa-id").value = "";

  // Valores predeterminados convenientes
  document.getElementById("def-gestion").value = state.config.gestion_actual || "2026";
  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("def-fecha").value = hoy;
  document.getElementById("def-fecha-texto").value = formatearFechaTextoDefensa(hoy);
  document.getElementById("def-hora").value = "09:00";
  document.getElementById("def-lugar").value = 'HOSPITAL "METODISTA"';
  const celInput = document.getElementById("def-celular");
  if (celInput) celInput.value = "";
  const ciInput = document.getElementById("def-ci");
  if (ciInput) ciInput.value = "";
  const ciExpInput = document.getElementById("def-ci-exp");
  if (ciExpInput) ciExpInput.value = "LP";

  // Llenar selector de edictos
  const selEdicto = document.getElementById("def-edicto-id");
  selEdicto.innerHTML = '<option value="">(Sin asignar - Pendiente)</option>';
  state.edictos.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.codigo} (${e.gestion})`;
    if (e.id === state.activeEdictoId) opt.selected = true;
    selEdicto.appendChild(opt);
  });

  openModal("modal-defensa");
}

function editarDefensa(id) {
  const d = state.defensas.find(x => x.id === id);
  if (!d) return;

  document.getElementById("modal-defensa-title").textContent = "Editar Datos de la Defensa";
  document.getElementById("defensa-id").value = d.id;
  document.getElementById("def-estudiante").value = d.estudiante;
  const ciInput = document.getElementById("def-ci");
  if (ciInput) ciInput.value = d.ci || "";
  const ciExpInput = document.getElementById("def-ci-exp");
  if (ciExpInput) ciExpInput.value = d.ci_expedido || "LP";
  const celInput = document.getElementById("def-celular");
  if (celInput) celInput.value = d.celular || "";
  document.getElementById("def-carrera").value = d.carrera;
  document.getElementById("def-modalidad").value = d.modalidad || "EXÁMEN DE GRADO";
  document.getElementById("def-fecha").value = d.fecha_defensa;
  document.getElementById("def-fecha-texto").value = d.fecha_defensa_texto || "";
  document.getElementById("def-hora").value = d.hora;
  document.getElementById("def-lugar").value = d.lugar;
  document.getElementById("def-tribunal-1").value = d.tribunal_1;
  document.getElementById("def-tribunal-2").value = d.tribunal_2;
  document.getElementById("def-gestion").value = d.gestion;
  document.getElementById("def-estado").value = d.estado;
  document.getElementById("def-nota").value = d.nota || "";
  document.getElementById("def-observaciones").value = d.observaciones || "";

  const selEdicto = document.getElementById("def-edicto-id");
  selEdicto.innerHTML = '<option value="">(Sin asignar - Pendiente)</option>';
  state.edictos.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.codigo} (${e.gestion})`;
    if (Number(e.id) === Number(d.edicto_id)) opt.selected = true;
    selEdicto.appendChild(opt);
  });

  openModal("modal-defensa");
}

async function guardarDefensa(e) {
  e.preventDefault();
  const idStr = document.getElementById("defensa-id").value;
  const isEdit = !!idStr;
  const celVal = document.getElementById("def-celular") ? document.getElementById("def-celular").value.trim() : "";
  const ciVal = document.getElementById("def-ci") ? document.getElementById("def-ci").value.trim() : "";
  const ciExpVal = document.getElementById("def-ci-exp") ? document.getElementById("def-ci-exp").value : "LP";

  const data = {
    estudiante: document.getElementById("def-estudiante").value.trim().toUpperCase(),
    ci: ciVal,
    ci_expedido: ciExpVal,
    celular: celVal,
    carrera: document.getElementById("def-carrera").value.trim().toUpperCase(),
    modalidad: document.getElementById("def-modalidad").value,
    fecha_defensa: document.getElementById("def-fecha").value,
    fecha_defensa_texto: document.getElementById("def-fecha-texto").value.trim() || formatearFechaTextoDefensa(document.getElementById("def-fecha").value),
    hora: document.getElementById("def-hora").value.trim(),
    lugar: document.getElementById("def-lugar").value.trim().toUpperCase(),
    tribunal_1: document.getElementById("def-tribunal-1").value.trim(),
    tribunal_2: document.getElementById("def-tribunal-2").value.trim(),
    gestion: document.getElementById("def-gestion").value.trim(),
    edicto_id: document.getElementById("def-edicto-id").value ? Number(document.getElementById("def-edicto-id").value) : null,
    estado: document.getElementById("def-estado").value,
    nota: parseFloat(document.getElementById("def-nota").value) || 0.0,
    observaciones: document.getElementById("def-observaciones").value.trim()
  };

  try {
    if (state.isApiAvailable) {
      if (isEdit) {
        await fetchJson(`/api/defensas/${idStr}`, {
          method: "PUT",
          body: JSON.stringify(data)
        });
      } else {
        await fetchJson("/api/defensas", {
          method: "POST",
          body: JSON.stringify(data)
        });
      }
      // Recargar datos desde el servidor
      await loadData();
    } else {
      // Modo local
      if (isEdit) {
        const idx = state.defensas.findIndex(x => x.id === Number(idStr));
        if (idx !== -1) {
          state.defensas[idx] = { ...state.defensas[idx], ...data };
        }
      } else {
        const newId = state.defensas.length ? Math.max(...state.defensas.map(x => x.id)) + 1 : 1;
        state.defensas.push({ id: newId, ...data });
      }
      persistLocalData();
      renderApp();
    }

    closeModal("modal-defensa");
    showToast(isEdit ? "Defensa actualizada con éxito" : "Estudiante registrado correctamente");
  } catch (err) {
    alert("Error al guardar la defensa: " + err.message);
  }
}

async function marcarAprobada(id) {
  const nota = prompt("Ingrese la calificación final de la defensa (0-100):", "85");
  if (nota === null) return;

  const notaNum = parseFloat(nota) || 80.0;

  try {
    if (state.isApiAvailable) {
      await fetchJson(`/api/defensas/${id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: "Aprobada", nota: notaNum })
      });
      await loadData();
    } else {
      const d = state.defensas.find(x => x.id === id);
      if (d) {
        d.estado = "Aprobada";
        d.nota = notaNum;
        persistLocalData();
        renderApp();
      }
    }
    showToast("¡Defensa marcada como Aprobada!");
  } catch (err) {
    alert("Error al actualizar estado: " + err.message);
  }
}

async function eliminarDefensa(id) {
  if (!confirm("¿Está seguro de eliminar este registro de defensa?")) return;

  try {
    if (state.isApiAvailable) {
      await fetchJson(`/api/defensas/${id}`, { method: "DELETE" });
      await loadData();
    } else {
      state.defensas = state.defensas.filter(x => x.id !== id);
      persistLocalData();
      renderApp();
    }
    showToast("Registro de defensa eliminado", "error");
  } catch (err) {
    alert("Error al eliminar: " + err.message);
  }
}

// Modal de Crear / Editar Edicto
function openModalNuevoEdicto() {
  document.getElementById("modal-edicto-title").textContent = "Crear Nuevo Edicto Oficial";
  document.getElementById("form-edicto").reset();
  document.getElementById("edicto-id").value = "";

  const gestion = state.config.gestion_actual || "2026";
  const numEdicto = state.edictos.length + 1;
  const numFormatted = String(numEdicto).padStart(2, "0");

  document.getElementById("ed-codigo").value = `EDICTO VR-EA ${numFormatted}-${gestion}`;
  document.getElementById("ed-gestion").value = gestion;
  document.getElementById("ed-modalidad").value = "EXÁMEN DE GRADO";
  document.getElementById("ed-subtitulo").value = "TRIBUNAL INTERNO PARA DEFENSA DE GRADO";

  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("ed-fecha-emision").value = hoy;
  document.getElementById("ed-ciudad").value = state.config.ciudad_default || "El Alto";
  document.getElementById("ed-fecha-texto").value = formatearFechaEmisionOficial(hoy, state.config.ciudad_default || "El Alto");

  document.getElementById("ed-autoridad-nombre").value = state.config.autoridad_nombre || "Lic. Amílcar Bruno Cáceres Pérez";
  document.getElementById("ed-autoridad-cargo").value = state.config.autoridad_cargo || "VICERRECTOR";
  document.getElementById("ed-sede").value = state.config.sede || "UNITEPC SUB SEDE EL ALTO";

  openModal("modal-edicto");
}

function openModalEditarEdicto() {
  const edicto = state.edictos.find(e => e.id === state.activeEdictoId);
  if (!edicto) return;

  document.getElementById("modal-edicto-title").textContent = "Editar Cabecera y Datos del Edicto";
  document.getElementById("edicto-id").value = edicto.id;
  document.getElementById("ed-codigo").value = edicto.codigo;
  document.getElementById("ed-gestion").value = edicto.gestion;
  document.getElementById("ed-modalidad").value = edicto.modalidad;
  document.getElementById("ed-subtitulo").value = edicto.subtitulo;
  document.getElementById("ed-fecha-emision").value = edicto.fecha_emision;
  document.getElementById("ed-ciudad").value = edicto.ciudad || state.config.ciudad_default;
  document.getElementById("ed-fecha-texto").value = edicto.fecha_texto || "";
  document.getElementById("ed-autoridad-nombre").value = edicto.autoridad_nombre || state.config.autoridad_nombre;
  document.getElementById("ed-autoridad-cargo").value = edicto.autoridad_cargo || state.config.autoridad_cargo;
  document.getElementById("ed-sede").value = edicto.sede || state.config.sede;

  openModal("modal-edicto");
}

async function guardarEdicto(e) {
  e.preventDefault();
  const idStr = document.getElementById("edicto-id").value;
  const isEdit = !!idStr;

  const data = {
    codigo: document.getElementById("ed-codigo").value.trim(),
    gestion: document.getElementById("ed-gestion").value.trim(),
    modalidad: document.getElementById("ed-modalidad").value.trim().toUpperCase(),
    subtitulo: document.getElementById("ed-subtitulo").value.trim().toUpperCase(),
    fecha_emision: document.getElementById("ed-fecha-emision").value,
    ciudad: document.getElementById("ed-ciudad").value.trim(),
    fecha_texto: document.getElementById("ed-fecha-texto").value.trim() || formatearFechaEmisionOficial(document.getElementById("ed-fecha-emision").value, document.getElementById("ed-ciudad").value),
    autoridad_nombre: document.getElementById("ed-autoridad-nombre").value.trim(),
    autoridad_cargo: document.getElementById("ed-autoridad-cargo").value.trim().toUpperCase(),
    sede: document.getElementById("ed-sede").value.trim().toUpperCase()
  };

  try {
    if (state.isApiAvailable) {
      if (isEdit) {
        await fetchJson(`/api/edictos/${idStr}`, {
          method: "PUT",
          body: JSON.stringify(data)
        });
      } else {
        const resp = await fetchJson("/api/edictos", {
          method: "POST",
          body: JSON.stringify(data)
        });
        state.activeEdictoId = resp.id;
      }
      await loadData();
    } else {
      if (isEdit) {
        const idx = state.edictos.findIndex(x => x.id === Number(idStr));
        if (idx !== -1) {
          state.edictos[idx] = { ...state.edictos[idx], ...data };
        }
      } else {
        const newId = state.edictos.length ? Math.max(...state.edictos.map(x => x.id)) + 1 : 1;
        state.edictos.push({ id: newId, ...data });
        state.activeEdictoId = newId;
      }
      persistLocalData();
      renderApp();
    }

    closeModal("modal-edicto");
    showToast(isEdit ? "Edicto actualizado exitosamente" : "Nuevo edicto creado con éxito");
  } catch (err) {
    alert("Error al guardar edicto: " + err.message);
  }
}

// Modal Gestionar Estudiantes para el Edicto Activo
function openModalAsignarEstudiantes() {
  const edicto = state.edictos.find(e => e.id === state.activeEdictoId);
  if (!edicto) {
    alert("Seleccione un edicto primero.");
    return;
  }

  const tbody = document.getElementById("lista-estudiantes-para-asignar");
  tbody.innerHTML = "";

  state.defensas.forEach(d => {
    const isChecked = Number(d.edicto_id) === Number(edicto.id);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align:center;">
        <input type="checkbox" class="chk-asignar-estudiante" data-id="${d.id}" ${isChecked ? 'checked' : ''}>
      </td>
      <td><strong>${escapeHtml(d.estudiante)}</strong></td>
      <td>${escapeHtml(d.carrera)}</td>
      <td>${escapeHtml(d.fecha_defensa_texto || d.fecha_defensa)} (${escapeHtml(d.hora)})</td>
      <td>${escapeHtml(d.lugar)}</td>
    `;
    tbody.appendChild(tr);
  });

  openModal("modal-asignar-estudiantes");
}

async function guardarAsignacionEstudiantes() {
  const edicto = state.edictos.find(e => e.id === state.activeEdictoId);
  if (!edicto) return;

  const checkboxes = document.querySelectorAll(".chk-asignar-estudiante");
  const selectedIds = [];
  checkboxes.forEach(cb => {
    if (cb.checked) selectedIds.push(Number(cb.dataset.id));
  });

  try {
    if (state.isApiAvailable) {
      await fetchJson(`/api/edictos/${edicto.id}`, {
        method: "PUT",
        body: JSON.stringify({ estudiantes_ids: selectedIds })
      });
      await loadData();
    } else {
      state.defensas.forEach(d => {
        if (selectedIds.includes(d.id)) {
          d.edicto_id = edicto.id;
        } else if (d.edicto_id === edicto.id) {
          d.edicto_id = null;
        }
      });
      persistLocalData();
      renderApp();
    }
    closeModal("modal-asignar-estudiantes");
    showToast("Estudiantes asignados al edicto correctamente");
  } catch (err) {
    alert("Error al asignar estudiantes: " + err.message);
  }
}

// ==========================================
// EXPORTACIÓN A EXCEL (CSV) Y RESPALDOS
// ==========================================

function exportarCsvGestion() {
  const gestion = state.activeGestion || "2026";

  if (state.isApiAvailable) {
    window.location.href = `/api/export/csv?gestion=${encodeURIComponent(gestion)}`;
    return;
  }

  // Generador local en cliente
  const defensasGestion = state.defensas.filter(d => d.gestion === gestion);
  let csv = "ID,Gestión,Estudiante,Carrera,Modalidad,Fecha Defensa,Hora,Lugar,Tribunal 1,Tribunal 2,Estado,Calificación,Edicto\n";

  defensasGestion.forEach(d => {
    const ed = state.edictos.find(e => Number(e.id) === Number(d.edicto_id));
    const codEdicto = ed ? ed.codigo : "";
    const fila = [
      d.id,
      `"${d.gestion}"`,
      `"${d.estudiante.replace(/"/g, '""')}"`,
      `"${d.carrera.replace(/"/g, '""')}"`,
      `"${(d.modalidad || '').replace(/"/g, '""')}"`,
      `"${(d.fecha_defensa_texto || d.fecha_defensa).replace(/"/g, '""')}"`,
      `"${d.hora}"`,
      `"${d.lugar.replace(/"/g, '""')}"`,
      `"${(d.tribunal_1 || '').replace(/"/g, '""')}"`,
      `"${(d.tribunal_2 || '').replace(/"/g, '""')}"`,
      `"${d.estado}"`,
      d.nota || 0,
      `"${codEdicto}"`
    ];
    csv += fila.join(",") + "\n";
  });

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `defensas_gestion_${gestion}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function descargarBackupJson() {
  const backup = {
    fecha_respaldo: new Date().toISOString(),
    config: state.config,
    edictos: state.edictos,
    defensas: state.defensas
  };
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `respaldo_edictos_unitepc_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Respaldo descargado exitosamente");
}

function restaurarDesdeJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.edictos || !data.defensas) {
        throw new Error("El archivo no tiene el formato de respaldo de edictos correcto.");
      }

      if (state.isApiAvailable) {
        await fetchJson("/api/restore", {
          method: "POST",
          body: JSON.stringify(data)
        });
        await loadData();
      } else {
        if (data.config) state.config = data.config;
        state.edictos = data.edictos;
        state.defensas = data.defensas;
        persistLocalData();
        renderApp();
      }

      showToast("¡Base de datos restaurada correctamente!");
    } catch (err) {
      alert("Error al restaurar: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ==========================================
// MÓDULOS INSTITUCIONALES AVANZADOS
// ACTA DE CALIFICACIÓN, CERTIFICADO, CARGA MASIVA Y BÚSQUEDA GLOBAL
// ==========================================

function numeroALetras(num) {
  const n = Math.round(Number(num) || 0);
  if (n <= 0) return "CERO";
  if (n === 100) return "CIEN";
  
  const unidades = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const especiales = {
    10: "DIEZ", 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
    16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
    20: "VEINTE", 21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO",
    25: "VEINTICINCO", 26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
  };
  const decenas = ["", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  
  if (especiales[n]) return especiales[n];
  if (n < 10) return unidades[n];
  
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return decenas[d];
  return `${decenas[d]} Y ${unidades[u]}`;
}

function calcularVeredicto(nota, estado) {
  const n = parseFloat(nota) || 0;
  if (n >= 90) return "APROBADO/A CON FELICITACIÓN";
  if (n >= 71) return "APROBADO/A POR UNANIMIDAD";
  if (n >= 51) return "APROBADO/A POR MAYORÍA";
  if (estado === "Aprobada") return "APROBADO/A";
  return "REPROBADO/A";
}

// 1. ACTA DE CALIFICACIÓN
function verActaDefensa(id) {
  const d = state.defensas.find(x => x.id === id);
  if (!d) return;

  const edicto = state.edictos.find(e => Number(e.id) === Number(d.edicto_id));
  const fechaText = d.fecha_defensa_texto || formatearFechaTextoDefensa(d.fecha_defensa);
  const notaNum = d.nota ? Number(d.nota) : (d.estado === 'Aprobada' ? 80 : 0);
  const notaLit = numeroALetras(notaNum);
  const veredicto = calcularVeredicto(notaNum, d.estado);

  document.getElementById("acta-univ-title").textContent = state.config.universidad || "UNIVERSIDAD TÉCNICA PRIVADA COSMOS";
  document.getElementById("acta-sede").textContent = state.config.sede || "UNITEPC SUB SEDE EL ALTO";
  document.getElementById("acta-gestion").textContent = `GESTIÓN ACADÉMICA ${d.gestion || state.config.gestion_actual}`;
  
  document.getElementById("acta-ciudad").textContent = edicto ? (edicto.ciudad || state.config.ciudad_default) : state.config.ciudad_default;
  document.getElementById("acta-hora").textContent = d.hora || "09:00";
  document.getElementById("acta-fecha").textContent = fechaText;
  document.getElementById("acta-lugar").textContent = d.lugar || "CONSEJO ACADÉMICO";
  document.getElementById("acta-edicto").textContent = edicto ? edicto.codigo : "(EDICTO VR-EA OFICIAL)";
  document.getElementById("acta-modalidad").textContent = d.modalidad || "EXÁMEN DE GRADO";

  document.getElementById("acta-estudiante").textContent = d.estudiante;
  document.getElementById("acta-ci").textContent = d.ci ? `${d.ci} ${d.ci_expedido || ''}` : "S/N";
  document.getElementById("acta-carrera").textContent = d.carrera;
  document.getElementById("acta-modalidad-tabla").textContent = d.modalidad || "EXÁMEN DE GRADO";

  document.getElementById("acta-nota-num").textContent = `${notaNum.toFixed(1)} / 100`;
  document.getElementById("acta-veredicto").textContent = `${notaLit} - ${veredicto}`;

  document.getElementById("acta-tribunal-1").textContent = d.tribunal_1 || "Tribunal 1";
  document.getElementById("acta-tribunal-2").textContent = d.tribunal_2 || "Tribunal 2";
  document.getElementById("acta-vicerrector").textContent = state.config.autoridad_nombre || "Lic. Amílcar Bruno Cáceres Pérez";

  openModal("modal-acta-defensa");
}

function imprimirActaIndividual() {
  document.body.classList.remove("print-mode-reporte", "print-mode-certificado");
  document.body.classList.add("print-mode-acta");
  window.print();
}

// 2. CERTIFICADO DE DEFENSA
function verCertificadoDefensa(id) {
  const d = state.defensas.find(x => x.id === id);
  if (!d) return;

  const edicto = state.edictos.find(e => Number(e.id) === Number(d.edicto_id));
  const fechaText = d.fecha_defensa_texto || formatearFechaTextoDefensa(d.fecha_defensa);
  const notaNum = d.nota ? Number(d.nota) : (d.estado === 'Aprobada' ? 80 : 0);
  const notaLit = numeroALetras(notaNum);
  const veredicto = calcularVeredicto(notaNum, d.estado);

  document.getElementById("cert-univ-title").textContent = state.config.universidad || "UNIVERSIDAD TÉCNICA PRIVADA COSMOS";
  document.getElementById("cert-sede").textContent = state.config.sede || "UNITEPC SUB SEDE EL ALTO";
  document.getElementById("cert-registro-num").textContent = `REGISTRO VR-EA N° ${String(d.id).padStart(3, '0')}/${d.gestion || '2026'}`;

  document.getElementById("cert-estudiante").textContent = d.estudiante;
  document.getElementById("cert-ci").textContent = d.ci ? `${d.ci} ${d.ci_expedido || ''}` : "S/N";
  document.getElementById("cert-carrera").textContent = d.carrera;
  document.getElementById("cert-modalidad").textContent = d.modalidad || "EXÁMEN DE GRADO";
  document.getElementById("cert-fecha").textContent = fechaText;
  document.getElementById("cert-nota").textContent = `${notaNum.toFixed(1)} (${notaLit})`;
  document.getElementById("cert-veredicto").textContent = veredicto;
  document.getElementById("cert-edicto").textContent = edicto ? edicto.codigo : "EDICTO OFICIAL VR-EA";

  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("cert-ciudad-fecha").textContent = formatearFechaEmisionOficial(hoy, state.config.ciudad_default || "El Alto");

  document.getElementById("cert-authority-name").textContent = state.config.autoridad_nombre || "Lic. Amílcar Bruno Cáceres Pérez";
  document.getElementById("cert-authority-cargo").textContent = state.config.autoridad_cargo || "VICERRECTOR";
  document.getElementById("cert-authority-sede").textContent = state.config.sede || "UNITEPC SUB SEDE EL ALTO";

  openModal("modal-certificado-defensa");
}

function imprimirCertificadoIndividual() {
  document.body.classList.remove("print-mode-reporte", "print-mode-acta");
  document.body.classList.add("print-mode-certificado");
  window.print();
}

// 3. CARGA MASIVA DESDE EXCEL
let registrosMasivosPendientes = [];

function openModalCargaMasiva() {
  const txt = document.getElementById("txt-carga-masiva");
  if (txt) txt.value = "";
  const badge = document.getElementById("badge-filas-detectadas");
  if (badge) badge.textContent = "";
  const diag = document.getElementById("msg-diagnostico-masivo");
  if (diag) { diag.style.display = "none"; diag.innerHTML = ""; }
  const preview = document.getElementById("preview-masivo-container");
  if (preview) preview.style.display = "none";
  const btnConf = document.getElementById("btn-confirmar-carga-masiva");
  if (btnConf) btnConf.style.display = "none";
  const inputFile = document.getElementById("input-archivo-excel");
  if (inputFile) inputFile.value = "";
  registrosMasivosPendientes = [];
  openModal("modal-carga-masiva");
}

function limpiarCargaMasiva() {
  const txt = document.getElementById("txt-carga-masiva");
  if (txt) txt.value = "";
  const badge = document.getElementById("badge-filas-detectadas");
  if (badge) badge.textContent = "";
  const diag = document.getElementById("msg-diagnostico-masivo");
  if (diag) { diag.style.display = "none"; diag.innerHTML = ""; }
  const preview = document.getElementById("preview-masivo-container");
  if (preview) preview.style.display = "none";
  const btnConf = document.getElementById("btn-confirmar-carga-masiva");
  if (btnConf) btnConf.style.display = "none";
  const inputFile = document.getElementById("input-archivo-excel");
  if (inputFile) inputFile.value = "";
  registrosMasivosPendientes = [];
}

function descargarPlantillaExcel() {
  const encabezado = "ESTUDIANTE;CI;EXP;CARRERA;MODALIDAD;FECHA;HORA;LUGAR;TRIBUNAL 1;TRIBUNAL 2;CELULAR;GESTION;ESTADO;NOTA\n";
  const ejemplos = [
    "QUISPE MAMANI CARLOS;4892341;LP;MEDICINA;EXÁMEN DE GRADO;2019-06-15;09:00;CONSEJO ACADÉMICO;Dr. Walter Ramos;Dra. Carmen Lopez;71234567;2019;Aprobada;85",
    "FLORES CHOQUE MARIA;5948321;EA;ODONTOLOGÍA;EXÁMEN DE GRADO;2020-04-10;10:30;CLINICA ODONTOLÓGICA;Dra. Rosario Flores;Dr. Victor Mendoza;72345678;2020;Aprobada;90",
    "CONDORI APAZA JUAN;6109283;LP;INGENIERIA DE SISTEMAS;PROYECTO DE GRADO;2021-11-20;14:00;LABORATORIO SISTEMAS;Ing. Jorge Castro;Ing. Silvia Ruiz;73456789;2021;Aprobada;88",
    "MAMANI LAURA PATRICIA;7048192;CB;FISIOTERAPIA Y KINESIOLOGÍA;EXÁMEN DE GRADO;2022-08-18;11:00;AULA MAGNA;Lic. Fernando Rojas;Lic. Paola Vargas;74567890;2022;Aprobada;92"
  ].join("\n");

  const contenido = "\uFEFF" + encabezado + ejemplos;
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "plantilla_defensas_unitepc.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function cargarEjemploMasivo() {
  const ej = `ESTUDIANTE\tCI\tEXP\tCARRERA\tMODALIDAD\tFECHA\tHORA\tLUGAR\tTRIBUNAL 1\tTRIBUNAL 2\tCELULAR\tGESTION\tESTADO\tNOTA
LETICIA SOLEDAD MOLLINEDO\t4892341\tLP\tMEDICINA\tEXÁMEN DE GRADO\t2019-05-18\t09:00\tHOSPITAL "METODISTA"\tDra. Magaly Mamani\tDra. Francy Pacheco\t71234567\t2019\tAprobada\t85
JUAN CARLOS MIXTO LAURA\t5948312\tLP\tMEDICINA\tEXÁMEN DE GRADO\t2020-09-12\t10:00\tHOSPITAL "METODISTA"\tDra. Magaly Mamani\tDra. Francy Pacheco\t72345678\t2020\tAprobada\t88
TALIA JULIA RIVERA YUGAR\t6849201\tEA\tODONTOLOGÍA\tEXÁMEN DE GRADO\t2021-03-24\t11:00\tCONSEJO ACADÉMICO\tDr. Juan Perez\tDra. Elena Gomez\t73456789\t2021\tAprobada\t90
CARLOS JENSEN URIONA\t5192834\tCB\tINGENIERIA DE SONIDO\tTESIS DE GRADO\t2022-10-15\t14:00\tAUDITORIO CENTRAL\tIng. Daniel Condorcet\tIng. Sergio Crespo\t74567890\t2022\tAprobada\t92
JUAN ESCOBAR MENDOZA\t7029384\tLP\tDERECHO\tEXÁMEN DE GRADO\t2023-06-20\t15:00\tAULA MAGNA\tDr. Marco Antonio\tDr. Roberto Silva\t75678901\t2023\tAprobada\t86`;
  document.getElementById("txt-carga-masiva").value = ej;
  procesarTextoMasivo();
}

// Limpieza de celdas
function limpiarCeldaMasiva(cell) {
  if (cell === undefined || cell === null) return "";
  let s = String(cell).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.substring(1, s.length - 1).trim();
  }
  return s.replace(/""/g, '"').trim();
}

// Separación de líneas respetando comillas y delimitadores
function splitLineaMasiva(line) {
  line = line.trim();
  if (!line) return [];

  if (line.includes("\t")) {
    return line.split("\t").map(limpiarCeldaMasiva);
  }
  if (line.includes(";")) {
    return parseSeparatedWithQuotes(line, ";");
  }
  if (line.includes("|")) {
    return parseSeparatedWithQuotes(line, "|");
  }
  if (line.includes(",")) {
    return parseSeparatedWithQuotes(line, ",");
  }
  // Copiado desde tablas en formato espaciado (2 o más espacios consecutivos)
  if (/\s{2,}/.test(line)) {
    return line.split(/\s{2,}/).map(limpiarCeldaMasiva);
  }
  return [limpiarCeldaMasiva(line)];
}

function parseSeparatedWithQuotes(line, sep) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === sep && !inQuotes) {
      result.push(limpiarCeldaMasiva(cur));
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(limpiarCeldaMasiva(cur));
  return result;
}

// Normalización universal de fechas a YYYY-MM-DD
function normalizarFecha(val, fallbackGestion = "2026") {
  if (!val) return `${fallbackGestion}-03-15`;
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/AAAA o DD-MM-AAAA o DD.MM.AAAA
  const m1 = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m1) {
    const d = String(m1[1]).padStart(2, "0");
    const m = String(m1[2]).padStart(2, "0");
    return `${m1[3]}-${m}-${d}`;
  }
  // AAAA/MM/DD
  const m2 = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (m2) {
    const m = String(m2[2]).padStart(2, "0");
    const d = String(m2[3]).padStart(2, "0");
    return `${m2[1]}-${m}-${d}`;
  }
  return s;
}

// Separación de C.I. y expedido (ej: "4892341 LP")
function separarCiExpedido(ciRaw, expRaw) {
  let ci = String(ciRaw || "").trim();
  let exp = String(expRaw || "").trim().toUpperCase();

  const match = ci.match(/^(\d+)[ -_]+([A-Za-z]{2,3})$/);
  if (match) {
    ci = match[1];
    if (!exp) exp = match[2].toUpperCase();
  }
  if (!exp) exp = "LP";
  return { ci, exp };
}

// Detector inteligente de columnas por encabezados
function detectarMapeoColumnas(cols) {
  const lineText = cols.join(" ").toLowerCase();
  const hasKeywords = /estudiante|nombre|alumno|postulante|graduado|apellidos|carrera|facultad|tribunal|ci|carnet|cedula|defensa/i.test(lineText);
  if (!hasKeywords) return null;

  const map = {};
  cols.forEach((rawCol, idx) => {
    const c = rawCol.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (/^(nro|n°|num|item|#|n)$/i.test(c)) {
      map.correlativo = idx;
    } else if (/estudiante|nombre|alumno|postulante|graduado|apellidos/i.test(c)) {
      map.estudiante = idx;
    } else if (/^(ci|c\.i\.|carnet|cedula|documento)$/i.test(c) || /carnet/i.test(c)) {
      map.ci = idx;
    } else if (/^(exp|expedido|dep|departamento)$/i.test(c)) {
      map.ci_expedido = idx;
    } else if (/carrera|programa|facultad/i.test(c)) {
      map.carrera = idx;
    } else if (/modalidad/i.test(c)) {
      map.modalidad = idx;
    } else if (/fecha/i.test(c)) {
      map.fecha = idx;
    } else if (/hora|hrs|horario/i.test(c)) {
      map.hora = idx;
    } else if (/lugar|aula|hospital|recinto|ambiente/i.test(c)) {
      map.lugar = idx;
    } else if (/tribunal.*1|t1|primer.*tribunal/i.test(c)) {
      map.tribunal_1 = idx;
    } else if (/tribunal.*2|t2|segundo.*tribunal/i.test(c)) {
      map.tribunal_2 = idx;
    } else if (/tribunal/i.test(c) && map.tribunal_1 === undefined) {
      map.tribunal_1 = idx;
    } else if (/celular|telefono|movil|whatsapp|telf/i.test(c)) {
      map.celular = idx;
    } else if (/gestion|año|ano|periodo/i.test(c)) {
      map.gestion = idx;
    } else if (/estado|condicion|resultado/i.test(c)) {
      map.estado = idx;
    } else if (/nota|calificacion|puntaje/i.test(c)) {
      map.nota = idx;
    }
  });

  return Object.keys(map).length >= 2 ? map : null;
}

function procesarTextoMasivo() {
  const raw = document.getElementById("txt-carga-masiva").value.trim();
  const diagEl = document.getElementById("msg-diagnostico-masivo");
  const badgeEl = document.getElementById("badge-filas-detectadas");
  const previewContainer = document.getElementById("preview-masivo-container");
  const btnConfirmar = document.getElementById("btn-confirmar-carga-masiva");

  if (!raw) {
    if (diagEl) {
      diagEl.style.display = "block";
      diagEl.style.background = "#fee2e2";
      diagEl.style.color = "#991b1b";
      diagEl.innerHTML = "⚠️ Ingrese texto, seleccione un archivo Excel/CSV o use el botón 'Probar con Ejemplo'.";
    }
    return;
  }

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return;

  // Analizar la primera línea para detectar si contiene cabeceras
  const firstCols = splitLineaMasiva(lines[0]);
  const headerMap = detectarMapeoColumnas(firstCols);
  let startIndex = 0;
  if (headerMap) {
    startIndex = 1; // Omitir la fila de encabezados
  }

  const parsed = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const cols = splitLineaMasiva(line);
    if (cols.length < 2) continue;

    let estudiante = "";
    let ci = "";
    let ci_expedido = "LP";
    let carrera = "MEDICINA";
    let modalidad = "EXÁMEN DE GRADO";
    let fecha = new Date().toISOString().split("T")[0];
    let hora = "09:00";
    let lugar = "CONSEJO ACADÉMICO";
    let tribunal_1 = "";
    let tribunal_2 = "";
    let celular = "";
    let gestion = "2026";
    let estado = "Aprobada";
    let nota = 80.0;

    if (headerMap) {
      if (headerMap.estudiante !== undefined) estudiante = (cols[headerMap.estudiante] || "").toUpperCase();
      if (headerMap.ci !== undefined) ci = cols[headerMap.ci] || "";
      if (headerMap.ci_expedido !== undefined) ci_expedido = cols[headerMap.ci_expedido] || "";
      if (headerMap.carrera !== undefined) carrera = (cols[headerMap.carrera] || "MEDICINA").toUpperCase();
      if (headerMap.modalidad !== undefined) modalidad = cols[headerMap.modalidad] || "EXÁMEN DE GRADO";
      if (headerMap.fecha !== undefined) fecha = cols[headerMap.fecha] || "";
      if (headerMap.hora !== undefined) hora = cols[headerMap.hora] || "09:00";
      if (headerMap.lugar !== undefined) lugar = (cols[headerMap.lugar] || "CONSEJO ACADÉMICO").toUpperCase();
      if (headerMap.tribunal_1 !== undefined) tribunal_1 = cols[headerMap.tribunal_1] || "";
      if (headerMap.tribunal_2 !== undefined) tribunal_2 = cols[headerMap.tribunal_2] || "";
      if (headerMap.celular !== undefined) celular = cols[headerMap.celular] || "";
      if (headerMap.gestion !== undefined) gestion = cols[headerMap.gestion] || "2026";
      if (headerMap.estado !== undefined) estado = cols[headerMap.estado] || "Aprobada";
      if (headerMap.nota !== undefined) {
        const rawNota = String(cols[headerMap.nota] || "").replace(",", ".").replace("%", "");
        nota = parseFloat(rawNota) || (estado === "Aprobada" ? 80.0 : 0.0);
      }
    } else {
      let offset = 0;
      // Verificar si la primera columna es un correlativo (1, 2, 3...)
      if (/^\d{1,4}$/.test(cols[0]) && cols.length > 2 && isNaN(cols[1])) {
        offset = 1;
      }

      estudiante = (cols[offset] || "").toUpperCase();
      const nextCol = cols[offset + 1] || "";
      const isNextColNumeric = /^\d{5,9}/.test(nextCol.trim());

      if (isNextColNumeric) {
        ci = nextCol;
        ci_expedido = (cols[offset + 2] || "LP").toUpperCase();
        carrera = (cols[offset + 3] || "MEDICINA").toUpperCase();
        modalidad = cols[offset + 4] || "EXÁMEN DE GRADO";
        fecha = cols[offset + 5] || "";
        hora = cols[offset + 6] || "09:00";
        lugar = (cols[offset + 7] || "CONSEJO ACADÉMICO").toUpperCase();
        tribunal_1 = cols[offset + 8] || "";
        tribunal_2 = cols[offset + 9] || "";
        celular = cols[offset + 10] || "";
        gestion = cols[offset + 11] || "2026";
        estado = cols[offset + 12] || "Aprobada";
        const rawNota = String(cols[offset + 13] || "").replace(",", ".");
        nota = parseFloat(rawNota) || (estado === "Aprobada" ? 80.0 : 0.0);
      } else {
        carrera = nextCol.toUpperCase() || "MEDICINA";
        modalidad = cols[offset + 2] || "EXÁMEN DE GRADO";
        fecha = cols[offset + 3] || "";
        hora = cols[offset + 4] || "09:00";
        lugar = (cols[offset + 5] || "CONSEJO ACADÉMICO").toUpperCase();
        tribunal_1 = cols[offset + 6] || "";
        tribunal_2 = cols[offset + 7] || "";
        gestion = cols[offset + 8] || "2026";
        estado = cols[offset + 9] || "Aprobada";
        const rawNota = String(cols[offset + 10] || "").replace(",", ".");
        nota = parseFloat(rawNota) || (estado === "Aprobada" ? 80.0 : 0.0);
      }
    }

    if (!estudiante || estudiante.length < 3) continue;

    const sep = separarCiExpedido(ci, ci_expedido);
    fecha = normalizarFecha(fecha, gestion);

    parsed.push({
      estudiante,
      ci: sep.ci,
      ci_expedido: sep.exp,
      carrera,
      modalidad,
      fecha_defensa: fecha,
      fecha_defensa_texto: formatearFechaTextoDefensa(fecha),
      hora,
      lugar,
      tribunal_1,
      tribunal_2,
      celular,
      gestion: String(gestion).trim(),
      estado,
      nota
    });
  }

  registrosMasivosPendientes = parsed;
  const count = parsed.length;

  if (count === 0) {
    if (previewContainer) previewContainer.style.display = "none";
    if (btnConfirmar) btnConfirmar.style.display = "none";
    if (badgeEl) badgeEl.textContent = "";
    if (diagEl) {
      diagEl.style.display = "block";
      diagEl.style.background = "#fee2e2";
      diagEl.style.color = "#991b1b";
      diagEl.innerHTML = `❌ No se pudieron detectar registros válidos en las ${lines.length} líneas ingresadas.<br>Asegúrese de incluir al menos el nombre del estudiante y la carrera.`;
    }
    return;
  }

  if (badgeEl) {
    badgeEl.textContent = `✓ ${count} registro${count > 1 ? 's' : ''} listo${count > 1 ? 's' : ''} para importar`;
  }
  if (diagEl) {
    diagEl.style.display = "block";
    diagEl.style.background = "#ecfdf5";
    diagEl.style.color = "#065f46";
    diagEl.innerHTML = `✅ <strong>${count} registros reconocidos exitosamente.</strong> Revise la previsualización abajo y presione el botón verde para guardarlos en el sistema.`;
  }

  const summaryText = document.getElementById("preview-summary-text");
  if (summaryText) {
    const gestiones = [...new Set(parsed.map(r => r.gestion))].join(", ");
    summaryText.textContent = `Gestión(es): ${gestiones}`;
  }

  const tbody = document.getElementById("tbody-preview-masivo");
  if (tbody) {
    tbody.innerHTML = parsed.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${escapeHtml(r.estudiante)}</strong></td>
        <td>${escapeHtml(r.ci || '-')} <small>${escapeHtml(r.ci_expedido)}</small></td>
        <td>${escapeHtml(r.carrera)}</td>
        <td><span class="badge" style="background:#e2e8f0; color:#334155;">${escapeHtml(r.gestion)}</span></td>
        <td>${escapeHtml(r.fecha_defensa)} ${escapeHtml(r.hora)}</td>
        <td><small>${escapeHtml(r.tribunal_1 || '-')}<br>${escapeHtml(r.tribunal_2 || '-')}</small></td>
        <td><strong>${r.nota || '-'}</strong></td>
        <td>${r.celular ? `📱 ${escapeHtml(r.celular)}` : '-'}</td>
      </tr>
    `).join("");
  }

  if (previewContainer) previewContainer.style.display = "block";
  if (btnConfirmar) {
    btnConfirmar.style.display = "inline-flex";
    btnConfirmar.innerHTML = `<span>💾</span> Guardar ${count} Registro${count > 1 ? 's' : ''} en el Sistema`;
  }
}

function manejarArchivoExcel(file) {
  if (!file) return;

  const fileName = file.name.toLowerCase();
  const diagEl = document.getElementById("msg-diagnostico-masivo");
  if (diagEl) {
    diagEl.style.display = "block";
    diagEl.style.background = "#eff6ff";
    diagEl.style.color = "#1e40af";
    diagEl.innerHTML = `⏳ Leyendo archivo <strong>${escapeHtml(file.name)}</strong>...`;
  }

  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    if (window.XLSX) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet, { FS: "\t" });
          document.getElementById("txt-carga-masiva").value = csvText;
          procesarTextoMasivo();
        } catch (err) {
          alert("Error al procesar el archivo Excel: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    } else {
      alert("Para archivos .xlsx o .xls, guarde su archivo como CSV o copie y pegue las celdas en el cuadro de texto.");
    }
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById("txt-carga-masiva").value = e.target.result;
    procesarTextoMasivo();
  };
  reader.readAsText(file, "UTF-8");
}

async function confirmarCargaMasiva() {
  if (registrosMasivosPendientes.length === 0) return;

  try {
    if (state.isApiAvailable) {
      const res = await fetchJson("/api/defensas/batch", {
        method: "POST",
        body: JSON.stringify({ defensas: registrosMasivosPendientes })
      });
      await loadData();
      showToast(`¡Se importaron ${res.insertados || registrosMasivosPendientes.length} defensas exitosamente!`);
    } else {
      let startId = state.defensas.length ? Math.max(...state.defensas.map(x => x.id)) + 1 : 1;
      registrosMasivosPendientes.forEach(r => {
        state.defensas.push({ id: startId++, ...r });
      });
      persistLocalData();
      renderApp();
      showToast(`¡Se importaron ${registrosMasivosPendientes.length} defensas localmente!`);
    }

    closeModal("modal-carga-masiva");
  } catch (err) {
    alert("Error al importar registros: " + err.message);
  }
}

// 4. BUSCADOR HISTÓRICO GLOBAL (2019 - 2026+)
function ejecutarBusquedaGlobal(queryStr) {
  const inputEl = document.getElementById("input-busqueda-global");
  const q = (queryStr !== undefined ? queryStr : (inputEl ? inputEl.value : "")).toLowerCase().trim();
  const tbody = document.getElementById("tbody-resultados-globales");
  if (!tbody) return;

  if (!q) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:2.5rem; color:#6b7280;">
          Ingrese un nombre, apellido o C.I. para buscar en el archivo histórico desde la gestión 2019.
        </td>
      </tr>
    `;
    return;
  }

  const resultados = state.defensas.filter(d => {
    const matchEst = (d.estudiante || "").toLowerCase().includes(q);
    const matchCi = (d.ci || "").toLowerCase().includes(q);
    const matchCarr = (d.carrera || "").toLowerCase().includes(q);
    const matchT1 = (d.tribunal_1 || "").toLowerCase().includes(q);
    const matchT2 = (d.tribunal_2 || "").toLowerCase().includes(q);
    const matchGest = (d.gestion || "").toLowerCase().includes(q);
    return matchEst || matchCi || matchCarr || matchT1 || matchT2 || matchGest;
  });

  if (resultados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:2.5rem; color:#6b7280;">
          No se encontraron coincidencias para <strong>"${escapeHtml(q)}"</strong> en ninguna gestión histórica.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = resultados.map(d => {
    const edicto = state.edictos.find(e => Number(e.id) === Number(d.edicto_id));
    const badgeClass = `badge-${d.estado ? d.estado.toLowerCase() : 'programada'}`;
    const fechaText = d.fecha_defensa_texto || formatearFechaTextoDefensa(d.fecha_defensa);
    const cleanPhone = (d.celular || "").replace(/\D/g, "");
    const waNumber = cleanPhone ? (cleanPhone.startsWith("591") ? cleanPhone : `591${cleanPhone}`) : "";
    const waMsg = encodeURIComponent(`Estimado/a ${d.estudiante}, UNITEPC Sub Sede El Alto le notifica sobre su Defensa de Grado programada para el ${fechaText} a horas ${d.hora} en ${d.lugar}.`);

    return `
      <tr>
        <td>
          <strong>${escapeHtml(d.estudiante)}</strong>
          ${cleanPhone ? `
            <div style="margin-top:2px;">
              <a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" 
                 style="display:inline-flex; align-items:center; gap:2px; color:#15803d; font-size:0.75rem; text-decoration:none; font-weight:600;" 
                 title="Enviar WhatsApp">
                💬 ${escapeHtml(d.celular)}
              </a>
            </div>
          ` : ''}
        </td>
        <td><strong>${escapeHtml(d.ci || '-')}</strong> ${escapeHtml(d.ci_expedido || '')}</td>
        <td>${escapeHtml(d.carrera)}</td>
        <td><span class="badge" style="background:#e2e8f0; color:#334155;">${escapeHtml(d.gestion)}</span></td>
        <td>${edicto ? `<span style="font-size:0.8rem; font-weight:600; color:var(--primary);">${escapeHtml(edicto.codigo)}</span>` : '<span style="color:#9ca3af; font-size:0.8rem;">-</span>'}</td>
        <td>${escapeHtml(fechaText)} <br><small style="color:#6b7280;">${escapeHtml(d.hora)} hrs</small></td>
        <td><small>${escapeHtml(d.tribunal_1)}<br>${escapeHtml(d.tribunal_2)}</small></td>
        <td><strong>${d.nota ? d.nota : '-'}</strong></td>
        <td><span class="badge ${badgeClass}">${escapeHtml(d.estado)}</span></td>
        <td style="text-align:center;">
          <div style="display:flex; justify-content:center; gap:0.35rem;">
            <button class="btn btn-outline btn-sm" style="color:#0f3460; padding:3px 7px;" onclick="verActaDefensa(${d.id})" title="Imprimir Acta Oficial de Calificación">
              📄 Acta
            </button>
            <button class="btn btn-outline btn-sm" style="color:#16a34a; padding:3px 7px;" onclick="verCertificadoDefensa(${d.id})" title="Emitir Certificado de Aprobación">
              📜 Certificado
            </button>
            <button class="btn btn-outline btn-sm" style="padding:3px 7px;" onclick="editarDefensa(${d.id})" title="Editar datos">
              ✏️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// ==========================================
// CONFIGURACIÓN INSTITUCIONAL
// ==========================================

async function guardarConfiguracion(e) {
  e.preventDefault();
  const cfg = {
    universidad: document.getElementById("cfg-universidad").value.trim().toUpperCase(),
    sede: document.getElementById("cfg-sede").value.trim().toUpperCase(),
    ciudad_default: document.getElementById("cfg-ciudad").value.trim(),
    autoridad_nombre: document.getElementById("cfg-autoridad-nombre").value.trim(),
    autoridad_cargo: document.getElementById("cfg-autoridad-cargo").value.trim().toUpperCase(),
    gestion_actual: document.getElementById("cfg-gestion-actual").value.trim(),
    formato_codigo: document.getElementById("cfg-formato-codigo").value.trim()
  };

  const pinVal = document.getElementById("cfg-app-pin").value.trim();
  if (pinVal) {
    cfg.app_pin = pinVal;
    state.authPin = pinVal;
    sessionStorage.setItem("unitepc_pin", pinVal);
  }

  state.config = { ...state.config, ...cfg };

  try {
    if (state.isApiAvailable) {
      await fetchJson("/api/config", {
        method: "POST",
        body: JSON.stringify(cfg)
      });
    } else {
      persistLocalData();
    }
    renderApp();
    showToast("Configuración guardada exitosamente");
  } catch (err) {
    alert("Error al guardar configuración: " + err.message);
  }
}

// ==========================================
// HELPERS Y EVENT LISTENERS
// ==========================================

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", async () => {
  // Manejo de autenticación por PIN
  const btnLock = document.getElementById("btn-lock-app");
  if (btnLock) {
    btnLock.addEventListener("click", () => {
      sessionStorage.removeItem("unitepc_pin");
      state.authPin = "";
      promptPinLogin();
    });
  }

  const formPinLogin = document.getElementById("form-pin-login");
  if (formPinLogin) {
    formPinLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pin = document.getElementById("input-pin-auth").value.trim();
      const errBox = document.getElementById("pin-error-msg");
      errBox.style.display = "none";

      try {
        if (state.isApiAvailable) {
          const resp = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin })
          });
          if (!resp.ok) {
            errBox.style.display = "block";
            return;
          }
        } else {
          const localPin = state.config.app_pin || "2026";
          if (pin !== localPin) {
            errBox.style.display = "block";
            return;
          }
        }

        state.authPin = pin;
        sessionStorage.setItem("unitepc_pin", pin);
        closeModal("modal-pin-lock");
        showToast("¡Acceso verificado!");
        await loadData();
      } catch (err) {
        errBox.style.display = "block";
      }
    });
  }

  // Verificar si se requiere PIN al iniciar
  try {
    const authStatus = await fetch("/api/auth/status").then(r => r.json()).catch(() => ({ pin_required: false }));
    if (authStatus && authStatus.pin_required && !state.authPin) {
      promptPinLogin();
      return;
    }
  } catch (e) {}

  // Inicialización de datos
  loadData();

  // Control de pestañas
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".view-section").forEach(v => v.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add("active");

      if (targetId === "view-reportes") {
        renderReportesGestion();
      }
      if (targetId === "view-buscador") {
        const inp = document.getElementById("input-busqueda-global");
        if (inp) {
          inp.focus();
          if (inp.value) ejecutarBusquedaGlobal(inp.value);
        }
      }
    });
  });

  // Selector de edicto activo
  const selectActiveEdicto = document.getElementById("select-active-edicto");
  if (selectActiveEdicto) {
    selectActiveEdicto.addEventListener("change", (e) => {
      state.activeEdictoId = Number(e.target.value);
      renderActiveEdictoSheet();
    });
  }

  // Toggles de firma y sello en el edicto
  const chkFirma = document.getElementById("chk-toggle-firma");
  const chkSello = document.getElementById("chk-toggle-sello");
  if (chkFirma) chkFirma.addEventListener("change", renderActiveEdictoSheet);
  if (chkSello) chkSello.addEventListener("change", renderActiveEdictoSheet);

  // Botones de modo de visualización de tribunal (Con o Sin Tribunal)
  const btnModeCon = document.getElementById("btn-mode-con-tribunal");
  const btnModeSin = document.getElementById("btn-mode-sin-tribunal");
  if (btnModeCon) btnModeCon.addEventListener("click", () => actualizarModoTribunal(true));
  if (btnModeSin) btnModeSin.addEventListener("click", () => actualizarModoTribunal(false));

  // Botones de impresión de edicto (Con Tribunal y Sin Tribunal)
  const btnImprimirCon = document.getElementById("btn-imprimir-con-tribunal");
  if (btnImprimirCon) {
    btnImprimirCon.addEventListener("click", () => {
      actualizarModoTribunal(true);
      document.body.classList.remove("print-mode-reporte");
      window.print();
    });
  }

  const btnImprimirSin = document.getElementById("btn-imprimir-sin-tribunal");
  if (btnImprimirSin) {
    btnImprimirSin.addEventListener("click", () => {
      actualizarModoTribunal(false);
      document.body.classList.remove("print-mode-reporte");
      window.print();
    });
  }

  // Botones de modales de edicto
  document.getElementById("btn-modal-nuevo-edicto").addEventListener("click", openModalNuevoEdicto);
  document.getElementById("btn-modal-editar-edicto").addEventListener("click", openModalEditarEdicto);
  document.getElementById("btn-modal-asignar-estudiantes").addEventListener("click", openModalAsignarEstudiantes);
  document.getElementById("btn-guardar-asignacion-estudiantes").addEventListener("click", guardarAsignacionEstudiantes);

  // Checkbox de seleccionar todos los estudiantes en el modal
  const chkSelectAll = document.getElementById("chk-select-all-estudiantes");
  if (chkSelectAll) {
    chkSelectAll.addEventListener("change", (e) => {
      document.querySelectorAll(".chk-asignar-estudiante").forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Formularios
  document.getElementById("form-edicto").addEventListener("submit", guardarEdicto);
  document.getElementById("form-defensa").addEventListener("submit", guardarDefensa);
  document.getElementById("form-config").addEventListener("submit", guardarConfiguracion);

  // Botón nueva defensa
  document.getElementById("btn-modal-nueva-defensa").addEventListener("click", openModalNuevaDefensa);

  // Filtros de búsqueda en tabla de defensas
  document.getElementById("filtro-busqueda").addEventListener("input", renderDefensasTable);
  document.getElementById("filtro-gestion").addEventListener("change", renderDefensasTable);
  document.getElementById("filtro-carrera").addEventListener("change", renderDefensasTable);
  document.getElementById("filtro-estado").addEventListener("change", renderDefensasTable);
  document.getElementById("filtro-edicto").addEventListener("change", renderDefensasTable);

  document.getElementById("btn-limpiar-filtros").addEventListener("click", () => {
    document.getElementById("filtro-busqueda").value = "";
    document.getElementById("filtro-gestion").value = "";
    document.getElementById("filtro-carrera").value = "";
    document.getElementById("filtro-estado").value = "";
    document.getElementById("filtro-edicto").value = "";
    renderDefensasTable();
  });

  // Generación automática de texto de fecha en formularios
  const defFecha = document.getElementById("def-fecha");
  if (defFecha) {
    defFecha.addEventListener("change", (e) => {
      document.getElementById("def-fecha-texto").value = formatearFechaTextoDefensa(e.target.value);
    });
  }

  const edFecha = document.getElementById("ed-fecha-emision");
  if (edFecha) {
    edFecha.addEventListener("change", (e) => {
      const ciudad = document.getElementById("ed-ciudad").value || "El Alto";
      document.getElementById("ed-fecha-texto").value = formatearFechaEmisionOficial(e.target.value, ciudad);
    });
  }

  // Reportes y exportación
  document.getElementById("reporte-select-gestion").addEventListener("change", renderReportesGestion);
  document.getElementById("btn-exportar-csv").addEventListener("click", exportarCsvGestion);

  // Impresión de Nómina Oficial de Titulados
  const btnImpTitulados = document.getElementById("btn-imprimir-reporte-titulados");
  if (btnImpTitulados) {
    btnImpTitulados.addEventListener("click", () => {
      renderNominaTituladosSheet();
      document.body.classList.add("print-mode-reporte");
      window.print();
    });
  }

  const btnImpTituladosDirecto = document.getElementById("btn-imprimir-reporte-titulados-directo");
  if (btnImpTituladosDirecto) {
    btnImpTituladosDirecto.addEventListener("click", () => {
      renderNominaTituladosSheet();
      document.body.classList.add("print-mode-reporte");
      window.print();
    });
  }

  // Limpiar modo de impresión al terminar
  window.addEventListener("afterprint", () => {
    document.body.classList.remove("print-mode-reporte", "print-mode-acta", "print-mode-certificado");
  });

  // Módulo de Carga Masiva desde Excel / CSV
  const btnCargaMasiva = document.getElementById("btn-modal-carga-masiva");
  if (btnCargaMasiva) btnCargaMasiva.addEventListener("click", openModalCargaMasiva);

  const btnPlantillaCsv = document.getElementById("btn-descargar-plantilla-csv");
  if (btnPlantillaCsv) btnPlantillaCsv.addEventListener("click", descargarPlantillaExcel);

  const btnEjemploMasivo = document.getElementById("btn-cargar-ejemplo-masivo");
  if (btnEjemploMasivo) btnEjemploMasivo.addEventListener("click", cargarEjemploMasivo);

  const btnLimpiarMasivo = document.getElementById("btn-limpiar-masivo");
  if (btnLimpiarMasivo) btnLimpiarMasivo.addEventListener("click", limpiarCargaMasiva);

  const btnProcesarMasivo = document.getElementById("btn-procesar-masivo");
  if (btnProcesarMasivo) btnProcesarMasivo.addEventListener("click", procesarTextoMasivo);

  const btnConfirmarMasivo = document.getElementById("btn-confirmar-carga-masiva");
  if (btnConfirmarMasivo) btnConfirmarMasivo.addEventListener("click", confirmarCargaMasiva);

  // Subida de archivos Excel / CSV (botón y selector)
  const inputArchivoExcel = document.getElementById("input-archivo-excel");
  const btnSeleccionarArchivo = document.getElementById("btn-seleccionar-archivo-excel");
  if (btnSeleccionarArchivo && inputArchivoExcel) {
    btnSeleccionarArchivo.addEventListener("click", () => inputArchivoExcel.click());
  }

  if (inputArchivoExcel) {
    inputArchivoExcel.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        manejarArchivoExcel(e.target.files[0]);
      }
    });
  }

  // Zona de Drag & Drop para archivos Excel
  const dropzone = document.getElementById("dropzone-excel");
  if (dropzone && inputArchivoExcel) {
    dropzone.addEventListener("click", () => inputArchivoExcel.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        manejarArchivoExcel(e.dataTransfer.files[0]);
      }
    });
  }

  // Auto-análisis suave al pegar en el textarea
  const txtCargaMasiva = document.getElementById("txt-carga-masiva");
  if (txtCargaMasiva) {
    txtCargaMasiva.addEventListener("paste", () => {
      setTimeout(() => {
        if (txtCargaMasiva.value.trim()) {
          procesarTextoMasivo();
        }
      }, 100);
    });
  }

  // Botones de impresión de Acta y Certificado
  const btnImpActa = document.getElementById("btn-imprimir-acta-individual");
  if (btnImpActa) btnImpActa.addEventListener("click", imprimirActaIndividual);

  const btnImpCert = document.getElementById("btn-imprimir-certificado-individual");
  if (btnImpCert) btnImpCert.addEventListener("click", imprimirCertificadoIndividual);

  // Buscador Histórico Global
  const btnBuscarGlobal = document.getElementById("btn-ejecutar-busqueda-global");
  if (btnBuscarGlobal) btnBuscarGlobal.addEventListener("click", () => ejecutarBusquedaGlobal());

  const inputBuscarGlobal = document.getElementById("input-busqueda-global");
  if (inputBuscarGlobal) {
    inputBuscarGlobal.addEventListener("input", (e) => ejecutarBusquedaGlobal(e.target.value));
  }

  // Respaldos
  document.getElementById("btn-descargar-backup").addEventListener("click", descargarBackupJson);
  document.getElementById("input-restore-file").addEventListener("change", restaurarDesdeJson);
});
