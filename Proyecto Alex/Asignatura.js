// Asignatura.js
// Clase para gestión de materias

import fs from 'fs';
const RUTA_JSON = './data/asignaturas.json';
const RUTA_ALUMNOS = './data/alumnos.json';

export class Asignatura {
  /**
   * @param {object} datos
   * {id, nombre}
   */
  constructor({id, nombre}) {
    this.id = id;
    this.nombre = nombre;
  }

  static nuevo(datos) {
    const asignaturas = Asignatura._leerAsignaturas();
    let id;
    if (datos.id === undefined || datos.id === null || datos.id === '') {
      const ultimoId = asignaturas.reduce((max, asig) => Math.max(max, Number(asig.id) || 0), 0);
      id = ultimoId + 1;
    } else {
      id = Number(datos.id);
    }
    if (!Number.isInteger(id)) {
      throw new Error('El ID de la asignatura debe ser un numero entero.');
    }
    if (asignaturas.some(a => a.id === id)) {
      throw new Error('Ya existe una asignatura con ese ID.');
    }
    asignaturas.push({...datos, id});
    Asignatura._guardarAsignaturas(asignaturas);
    return id;
  }

  static modificar(id, nuevosDatos) {
    const asignaturas = Asignatura._leerAsignaturas();
    const idNumerico = Number(id);
    const idx = asignaturas.findIndex(a => a.id === idNumerico);
    if (idx !== -1) {
      const datosActualizados = {...nuevosDatos};
      if (datosActualizados.id !== undefined) {
        const nuevoId = Number(datosActualizados.id);
        if (!Number.isInteger(nuevoId)) {
          throw new Error('El ID de la asignatura debe ser un numero entero.');
        }
        const idDuplicado = asignaturas.some(a => a.id === nuevoId && a.id !== idNumerico);
        if (idDuplicado) {
          throw new Error('Ya existe una asignatura con ese ID.');
        }
        datosActualizados.id = nuevoId;
      }
      asignaturas[idx] = {...asignaturas[idx], ...datosActualizados};
      Asignatura._guardarAsignaturas(asignaturas);
    }
  }

  static eliminar(id) {
    const asignaturas = Asignatura._leerAsignaturas();
    const idNumerico = Number(id);
    const idx = asignaturas.findIndex(a => a.id === idNumerico);
    if (idx !== -1) {
      asignaturas.splice(idx, 1);
      Asignatura._guardarAsignaturas(asignaturas);
    }
  }

  static listar() {
    const asignaturas = Asignatura._leerAsignaturas();
    console.table(asignaturas);
  }

  /**
   * Lista todas las notas registradas en esta asignatura cruzando con alumnos
   * @param {string|number} idAsignatura
   */
  static listar_notas(idAsignatura) {
    const alumnos = Asignatura._leerAlumnos();
    const notas = [];
    const idAsignaturaNumerico = Number(idAsignatura);
    alumnos.forEach(al => {
      if (al.asignaturas && Array.isArray(al.asignaturas)) {
        al.asignaturas.forEach((asig, idx) => {
          if (Number(asig) === idAsignaturaNumerico && al.notas && al.notas[idx] !== undefined) {
            notas.push({
              alumno: `${al.nombre} ${al.apellido}`,
              nota: al.notas[idx]
            });
          }
        });
      }
    });
    console.table(notas);
  }

  // Métodos privados para manejo de archivos
  static _leerAsignaturas() {
    try {
      const data = fs.readFileSync(RUTA_JSON, 'utf-8');
      const asignaturas = JSON.parse(data);
      return asignaturas
        .map(asig => {
          const idNumerico = Number(asig.id);
          if (!Number.isInteger(idNumerico)) return null;
          return {...asig, id: idNumerico};
        })
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  static _guardarAsignaturas(asignaturas) {
    fs.writeFileSync(RUTA_JSON, JSON.stringify(asignaturas, null, 2));
  }

  static _leerAlumnos() {
    try {
      const data = fs.readFileSync(RUTA_ALUMNOS, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
}
