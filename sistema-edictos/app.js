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

    return `
      <tr>
        <td><strong>${escapeHtml(d.estudiante)}</strong></td>
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
          <div style="display:flex; justify-content:center; gap:0.35rem;">
            ${d.estado !== 'Aprobada' ? `
              <button class="btn btn-outline btn-sm" style="color:var(--success); padding:3px 7px;" onclick="marcarAprobada(${d.id})" title="Marcar como Aprobada">
                ✓
              </button>
            ` : ''}
            <button class="btn btn-outline btn-sm" style="padding:3px 7px;" onclick="editarDefensa(${d.id})" title="Editar datos">
              ✏️
            </button>
            <button class="btn btn-outline btn-sm" style="color:var(--danger); padding:3px 7px;" onclick="eliminarDefensa(${d.id})" title="Eliminar">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
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

  // Gestiones disponibles en selector de reportes
  const gestiones = [...new Set([...state.defensas.map(d => d.gestion), "2026", "2025"])].filter(Boolean).sort().reverse();
  const selectGestionReporte = document.getElementById("reporte-select-gestion");
  if (selectGestionReporte) {
    const valActual = selectGestionReporte.value || state.activeGestion;
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

  const data = {
    estudiante: document.getElementById("def-estudiante").value.trim().toUpperCase(),
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
    document.body.classList.remove("print-mode-reporte");
  });

  // Respaldos
  document.getElementById("btn-descargar-backup").addEventListener("click", descargarBackupJson);
  document.getElementById("input-restore-file").addEventListener("change", restaurarDesdeJson);
});
