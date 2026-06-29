import { Alumno } from './Alumno.js';

const cuerpoTabla = document.getElementById('cuerpo-tabla');
const totalAlumnos = document.getElementById('total-alumnos');
const btnIrAlta = document.getElementById('btn-ir-alta');
const encabezadosOrdenables = document.querySelectorAll('th[data-sort]');

const gestorAlumnos = new Alumno();
let listaAlumnos = gestorAlumnos.listar();
let carrerasPorId = new Map();
let ordenActual = {columna: null, direccion: 'asc'};

function crearCelda(texto) {
  const td = document.createElement('td');
  td.textContent = texto;
  return td;
}

function actualizarTotal() {
  totalAlumnos.textContent = String(listaAlumnos.length);
}

function obtenerCarreraAlumno(al) {
  const carreraId = Number(
    al.carreraId ??
    (Array.isArray(al.asignaturas) && al.asignaturas.length > 0 ? al.asignaturas[0] : NaN)
  );
  if (!Number.isInteger(carreraId)) return null;
  return carrerasPorId.get(carreraId) ?? null;
}

async function cargarCarreras() {
  try {
    const respuesta = await fetch('./data/carreras.json');
    if (!respuesta.ok) throw new Error('No se pudo cargar carreras.json');
    const carreras = await respuesta.json();
    carrerasPorId = new Map(carreras.map(c => [Number(c.id), c]));
  } catch (e) {
    carrerasPorId = new Map();
  }
}

function valorOrden(al, columna) {
  if (columna === 'id') return Number(al.id) || 0;
  if (columna === 'nombre') {
    return `${al.nombre ?? ''} ${al.apellido ?? ''}`.trim().toLowerCase();
  }
  if (columna === 'carrera') {
    const carrera = obtenerCarreraAlumno(al);
    return (carrera?.nombre ?? '').toLowerCase();
  }
  return '';
}

function obtenerListaOrdenada() {
  const copia = [...listaAlumnos];
  if (!ordenActual.columna) return copia;

  copia.sort((a, b) => {
    const va = valorOrden(a, ordenActual.columna);
    const vb = valorOrden(b, ordenActual.columna);
    if (va < vb) return ordenActual.direccion === 'asc' ? -1 : 1;
    if (va > vb) return ordenActual.direccion === 'asc' ? 1 : -1;
    return 0;
  });

  return copia;
}

function actualizarIndicadorOrden() {
  encabezadosOrdenables.forEach(th => {
    const col = th.dataset.sort;
    let titulo = th.textContent.replace(/[▲▼]/g, '').trim();
    if (ordenActual.columna === col) {
      titulo += ordenActual.direccion === 'asc' ? ' ▲' : ' ▼';
    }
    th.textContent = titulo;
  });
}

function crearFilaAlumno(al) {
  const fila = document.createElement('tr');
  const nombreCompleto = `${al.nombre ?? ''} ${al.apellido ?? ''}`.trim();
  fila.dataset.id = String(al.id ?? '');

  const tdId = crearCelda(String(al.id ?? ''));
  tdId.classList.add('col-id');

  const carrera = obtenerCarreraAlumno(al);
  const tdCarrera = document.createElement('td');
  if (carrera && carrera.url) {
    const enlace = document.createElement('a');
    enlace.className = 'carrera-link';
    enlace.href = carrera.url;
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
    enlace.textContent = carrera.nombre;
    tdCarrera.appendChild(enlace);
  } else {
    tdCarrera.textContent = 'Sin carrera';
  }

  const tdNombre = crearCelda(nombreCompleto);

  const tdAcciones = document.createElement('td');

  const btnEditar = document.createElement('button');
  btnEditar.className = 'accion-btn modificar';
  btnEditar.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 2-1.66z"/>
    </svg>
  `;
  btnEditar.title = 'Modificar';
  btnEditar.setAttribute('aria-label', 'Modificar');
  btnEditar.addEventListener('click', () => {
    window.location.href = `alumno_form.html?modo=editar&id=${encodeURIComponent(al.id)}`;
  });

  const btnEliminar = document.createElement('button');
  btnEliminar.className = 'accion-btn eliminar';
  btnEliminar.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7zm3-4h6l1 2h4v2H4V5h4l1-2z"/>
    </svg>
  `;
  btnEliminar.title = 'Eliminar';
  btnEliminar.setAttribute('aria-label', 'Eliminar');
  btnEliminar.addEventListener('click', () => {
    gestorAlumnos.eliminar(al.id);
    listaAlumnos = listaAlumnos.filter(item => item.id !== al.id);
    fila.remove();

    if (listaAlumnos.length === 0) {
      renderTabla(listaAlumnos);
      return;
    }

    actualizarTotal();
  });

  tdAcciones.appendChild(btnEditar);
  tdAcciones.appendChild(btnEliminar);

  fila.appendChild(tdId);
  fila.appendChild(tdNombre);
  fila.appendChild(tdCarrera);
  fila.appendChild(tdAcciones);

  return fila;
}

function renderTabla(alumnos) {
  cuerpoTabla.innerHTML = '';

  if (!Array.isArray(alumnos) || alumnos.length === 0) {
    const filaVacia = document.createElement('tr');
    const celdaVacia = document.createElement('td');
    celdaVacia.colSpan = 4;
    celdaVacia.className = 'vacio';
    celdaVacia.textContent = 'No hay alumnos para mostrar.';
    filaVacia.appendChild(celdaVacia);
    cuerpoTabla.appendChild(filaVacia);
    actualizarTotal();
    return;
  }

  alumnos.forEach(al => {
    const fila = crearFilaAlumno(al);
    cuerpoTabla.appendChild(fila);
  });

  actualizarTotal();
}

if (btnIrAlta) {
  btnIrAlta.addEventListener('click', () => {
    window.location.href = 'alumno_form.html?modo=alta';
  });
}

encabezadosOrdenables.forEach(th => {
  th.addEventListener('click', () => {
    const columna = th.dataset.sort;
    if (!columna) return;

    if (ordenActual.columna === columna) {
      ordenActual.direccion = ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      ordenActual.columna = columna;
      ordenActual.direccion = 'asc';
    }

    actualizarIndicadorOrden();
    renderTabla(obtenerListaOrdenada());
  });
});

await cargarCarreras();
actualizarIndicadorOrden();
renderTabla(obtenerListaOrdenada());
