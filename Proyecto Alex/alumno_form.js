import { Alumno } from './Alumno.js';

const form = document.getElementById('alumno-form');
const tituloForm = document.getElementById('titulo-form');
const mensaje = document.getElementById('mensaje');
const inputNombre = document.getElementById('nombre');
const inputApellido = document.getElementById('apellido');
const inputFechaNac = document.getElementById('fechaNac');
const selectCarrera = document.getElementById('carrera');

const params = new URLSearchParams(window.location.search);
const modo = params.get('modo') === 'editar' ? 'editar' : 'alta';
const idAlumno = Number(params.get('id'));

const gestorAlumnos = new Alumno();

function mostrarMensaje(texto, tipo = 'error') {
  mensaje.textContent = texto;
  mensaje.classList.remove('error', 'ok');
  mensaje.classList.add(tipo);
}

async function cargarCarreras() {
  try {
    const resp = await fetch('./data/carreras.json');
    if (!resp.ok) throw new Error('No se pudo leer carreras.json');

    const carreras = await resp.json();
    carreras.forEach(c => {
      const option = document.createElement('option');
      option.value = String(c.id);
      option.textContent = c.nombre;
      selectCarrera.appendChild(option);
    });
  } catch (e) {
    mostrarMensaje('No se pudieron cargar las carreras.');
  }
}

function normalizarFechaInput(fecha) {
  if (!fecha) return '';
  if (typeof fecha === 'string') {
    const soloFecha = fecha.trim().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
      return soloFecha;
    }
  }

  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return '';
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function coincideId(alumno, idBuscado) {
  const idAlumnoNum = Number(alumno?.id);
  return Number.isInteger(idAlumnoNum) && idAlumnoNum === idBuscado;
}

async function buscarAlumnoPorId(idBuscado) {
  const alumnosLocales = gestorAlumnos.listar();
  let alumno = alumnosLocales.find(al => coincideId(al, idBuscado));
  if (alumno) return alumno;

  try {
    const resp = await fetch('./data/alumnos.json');
    if (!resp.ok) throw new Error('No se pudo leer alumnos.json');
    const alumnosArchivo = await resp.json();
    if (!Array.isArray(alumnosArchivo)) return null;

    alumno = alumnosArchivo.find(al => coincideId(al, idBuscado)) ?? null;
    return alumno;
  } catch (e) {
    return null;
  }
}

async function precargarAlumno() {
  if (modo !== 'editar') return;
  if (!Number.isInteger(idAlumno)) {
    mostrarMensaje('ID de alumno invalido para editar.');
    return;
  }

  tituloForm.textContent = 'Modificar Alumno';
  const alumno = await buscarAlumnoPorId(idAlumno);

  if (!alumno) {
    mostrarMensaje('No se encontro el alumno seleccionado.');
    return;
  }

  inputNombre.value = alumno.nombre ?? '';
  inputApellido.value = alumno.apellido ?? '';
  inputFechaNac.value = normalizarFechaInput(alumno.fechaNac ?? alumno.fechanac ?? '');

  const carreraId = Number(
    alumno.carreraId ??
    (Array.isArray(alumno.asignaturas) && alumno.asignaturas.length > 0 ? alumno.asignaturas[0] : '')
  );
  if (Number.isInteger(carreraId)) {
    selectCarrera.value = String(carreraId);
  }
}

function validar() {
  const nombre = inputNombre.value.trim();
  const apellido = inputApellido.value.trim();
  const fechaNac = inputFechaNac.value;
  const carreraId = Number(selectCarrera.value);

  if (nombre.length < 2) {
    mostrarMensaje('El nombre debe tener al menos 2 caracteres.');
    return null;
  }

  if (apellido.length < 2) {
    mostrarMensaje('El apellido debe tener al menos 2 caracteres.');
    return null;
  }

  if (!fechaNac) {
    mostrarMensaje('La fecha de nacimiento es obligatoria.');
    return null;
  }

  if (!Number.isInteger(carreraId)) {
    mostrarMensaje('Debe seleccionar una carrera valida.');
    return null;
  }

  return {nombre, apellido, fechaNac, carreraId};
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const datos = validar();
  if (!datos) return;

  const payload = {
    nombre: datos.nombre,
    apellido: datos.apellido,
    fechaNac: datos.fechaNac,
    fechanac: datos.fechaNac,
    carreraId: datos.carreraId,
    asignaturas: [datos.carreraId],
    notas: [],
    rol: 'Alumno'
  };

  if (modo === 'editar') {
    if (!Number.isInteger(idAlumno)) {
      mostrarMensaje('ID de alumno invalido para editar.');
      return;
    }
    gestorAlumnos.modificar(idAlumno, payload);
    mostrarMensaje('Alumno modificado correctamente.', 'ok');
  } else {
    gestorAlumnos.nuevo(payload);
    mostrarMensaje('Alumno agregado correctamente.', 'ok');
  }

  setTimeout(() => {
    window.location.href = 'alumnos.html';
  }, 350);
});

await cargarCarreras();
await precargarAlumno();
