// Profesor.js
// Clase para gestión de profesores

import { Persona } from './Persona.js';
import fs from 'fs';
const RUTA_JSON = './data/profesores.json';
const RUTA_ALUMNOS = './data/alumnos.json';

export class Profesor extends Persona {
  /**
   * @param {object} datos
   * {nombre, apellido, fechanac, asignaturas}
   */
  constructor({nombre, apellido, fechanac, asignaturas = []}) {
    super(nombre, apellido, fechanac, 'Profesor');
    this.asignaturas = asignaturas;
  }

  /** CRUD estáticos **/
  static nuevo(datos) {
    const profesores = Profesor._leerProfesores();
    let id;
    if (datos.id === undefined || datos.id === null || datos.id === '') {
      const ultimoId = profesores.reduce((max, pr) => Math.max(max, Number(pr.id) || 0), 0);
      id = ultimoId + 1;
    } else {
      id = Number(datos.id);
    }
    if (!Number.isInteger(id)) {
      throw new Error('El ID del profesor debe ser un numero entero.');
    }
    if (profesores.some(pr => pr.id === id)) {
      throw new Error('Ya existe un profesor con ese ID.');
    }
    profesores.push({...datos, id});
    Profesor._guardarProfesores(profesores);
    return id;
  }

  static modificar(id, nuevosDatos) {
    const profesores = Profesor._leerProfesores();
    const idNumerico = Number(id);
    const idx = profesores.findIndex(pr => pr.id === idNumerico);
    if (idx !== -1) {
      const datosActualizados = {...nuevosDatos};
      if (datosActualizados.id !== undefined) {
        const nuevoId = Number(datosActualizados.id);
        if (!Number.isInteger(nuevoId)) {
          throw new Error('El ID del profesor debe ser un numero entero.');
        }
        const idDuplicado = profesores.some(pr => pr.id === nuevoId && pr.id !== idNumerico);
        if (idDuplicado) {
          throw new Error('Ya existe un profesor con ese ID.');
        }
        datosActualizados.id = nuevoId;
      }
      profesores[idx] = {...profesores[idx], ...datosActualizados};
      Profesor._guardarProfesores(profesores);
    }
  }

  static eliminar(id) {
    const profesores = Profesor._leerProfesores();
    const idNumerico = Number(id);
    const idx = profesores.findIndex(pr => pr.id === idNumerico);
    if (idx !== -1) {
      profesores.splice(idx, 1);
      Profesor._guardarProfesores(profesores);
    }
  }

  static listar() {
    const profesores = Profesor._leerProfesores();
    console.table(profesores);
  }

  /**
   * Permite al profesor poner una nota a un alumno en una asignatura
   * @param {number} idAlumno
   * @param {string|number} idAsignatura
   * @param {number} nota
   */
  static poner_notas(idAlumno, idAsignatura, nota) {
    const alumnos = Profesor._leerAlumnos();
    const idxAlumno = alumnos.findIndex(al => Number(al.id) === Number(idAlumno));
    if (idxAlumno !== -1) {
      const idAsignaturaNumerico = Number(idAsignatura);
      // Buscar si ya tiene la asignatura
      const idx = alumnos[idxAlumno].asignaturas.findIndex(a => Number(a) === idAsignaturaNumerico);
      if (idx !== -1) {
        // Si existe, agrega la nota
        if (!Array.isArray(alumnos[idxAlumno].notas)) alumnos[idxAlumno].notas = [];
        alumnos[idxAlumno].notas.push(nota);
      } else {
        // Si no existe, agrega la asignatura y la nota
        alumnos[idxAlumno].asignaturas.push(idAsignaturaNumerico);
        if (!Array.isArray(alumnos[idxAlumno].notas)) alumnos[idxAlumno].notas = [];
        alumnos[idxAlumno].notas.push(nota);
      }
      Profesor._guardarAlumnos(alumnos);
    }
  }

  // Métodos privados para manejo de archivos
  static _leerProfesores() {
    try {
      const data = fs.readFileSync(RUTA_JSON, 'utf-8');
      const profesores = JSON.parse(data);
      return Profesor._normalizarProfesores(profesores);
    } catch (e) {
      return [];
    }
  }

  static _guardarProfesores(profesores) {
    const profesoresNormalizados = Profesor._normalizarProfesores(profesores);
    fs.writeFileSync(RUTA_JSON, JSON.stringify(profesoresNormalizados, null, 2));
  }

  static _leerAlumnos() {
    try {
      const data = fs.readFileSync(RUTA_ALUMNOS, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  static _guardarAlumnos(alumnos) {
    fs.writeFileSync(RUTA_ALUMNOS, JSON.stringify(alumnos, null, 2));
  }

  static _normalizarId(id) {
    if (Number.isInteger(id)) return id;
    if (typeof id === 'string' && /^\d+$/.test(id.trim())) {
      return Number(id.trim());
    }
    return null;
  }

  static _normalizarProfesores(profesores) {
    const lista = Array.isArray(profesores) ? profesores.map(pr => ({...pr})) : [];
    const usados = new Set();

    lista.forEach(pr => {
      const id = Profesor._normalizarId(pr.id);
      if (Number.isInteger(id) && !usados.has(id)) {
        pr.id = id;
        usados.add(id);
      } else {
        delete pr.id;
      }

      if (pr.fechaNac === undefined && pr.fechanac !== undefined) {
        pr.fechaNac = pr.fechanac;
      }
      delete pr.fechanac;

      if (pr.rol === undefined) {
        pr.rol = 'Profesor';
      }

      if (!Array.isArray(pr.asignaturas)) {
        pr.asignaturas = [];
      }
    });

    let siguienteId = usados.size > 0 ? Math.max(...Array.from(usados)) + 1 : 1;
    lista.forEach(pr => {
      if (!Number.isInteger(pr.id)) {
        while (usados.has(siguienteId)) {
          siguienteId++;
        }
        pr.id = siguienteId;
        usados.add(siguienteId);
        siguienteId++;
      }
    });

    return lista;
  }
}
