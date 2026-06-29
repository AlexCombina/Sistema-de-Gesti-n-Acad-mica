// Alumno.js
// Clase para gestión de estudiantes

import { Persona } from './Persona.js';
const RUTA_JSON = './data/alumnos.json';
const fs = typeof window === 'undefined' ? await import('fs') : null;

export class Alumno extends Persona {
  /**
   * @param {object} datos
   * {nombre, apellido, fechanac, notas, asignaturas}
   */
  constructor({nombre = '', apellido = '', fechanac = '', notas = [], asignaturas = []} = {}) {
    super(nombre, apellido, fechanac, 'Alumno');
    this.notas = notas;
    this.asignaturas = asignaturas;
  }

  listar() {
    return Alumno.listar();
  }

  nuevo(datos) {
    return Alumno.nuevo(datos);
  }

  modificar(id, nuevosDatos) {
    return Alumno.modificar(id, nuevosDatos);
  }

  eliminar(id) {
    return Alumno.eliminar(id);
  }

  /**
   * Inserta un nuevo alumno en el archivo JSON
   * @param {object} datos
   */
  static nuevo(datos) {
    const alumnos = Alumno._leerAlumnos();
    let id;
    if (datos.id === undefined || datos.id === null || datos.id === '') {
      const ultimoId = alumnos.reduce((max, al) => Math.max(max, Number(al.id) || 0), 0);
      id = ultimoId + 1;
    } else {
      id = Number(datos.id);
    }
    if (!Number.isInteger(id)) {
      throw new Error('El ID del alumno debe ser un numero entero.');
    }
    if (alumnos.some(al => al.id === id)) {
      throw new Error('Ya existe un alumno con ese ID.');
    }
    alumnos.push({...datos, id});
    Alumno._guardarAlumnos(alumnos);
    return id;
  }

  /**
   * Modifica un alumno por id numérico
   * @param {number} id
   * @param {object} nuevosDatos
   */
  static modificar(id, nuevosDatos) {
    const alumnos = Alumno._leerAlumnos();
    const idNumerico = Number(id);
    const idx = alumnos.findIndex(al => al.id === idNumerico);
    if (idx !== -1) {
      const datosActualizados = {...nuevosDatos};
      if (datosActualizados.id !== undefined) {
        const nuevoId = Number(datosActualizados.id);
        if (!Number.isInteger(nuevoId)) {
          throw new Error('El ID del alumno debe ser un numero entero.');
        }
        const idDuplicado = alumnos.some(al => al.id === nuevoId && al.id !== idNumerico);
        if (idDuplicado) {
          throw new Error('Ya existe un alumno con ese ID.');
        }
        datosActualizados.id = nuevoId;
      }
      alumnos[idx] = {...alumnos[idx], ...datosActualizados};
      Alumno._guardarAlumnos(alumnos);
    }
  }

  /**
   * Elimina un alumno por id numérico
   * @param {number} id
   */
  static eliminar(id) {
    const alumnos = Alumno._leerAlumnos();
    const idNumerico = Number(id);
    const idx = alumnos.findIndex(al => al.id === idNumerico);
    if (idx !== -1) {
      alumnos.splice(idx, 1);
      Alumno._guardarAlumnos(alumnos);
    }
  }

  /**
   * Lista todos los alumnos en consola
   */
  static listar() {
    const alumnos = Alumno._leerAlumnos();
    if (typeof window !== 'undefined') {
      return alumnos;
    }

    if (alumnos.length === 0) {
      console.log('No hay alumnos cargados.');
      return alumnos;
    }

    const columnas = [
      {key: 'id', titulo: 'ID'},
      {key: 'nombre', titulo: 'Nombre'},
      {key: 'apellido', titulo: 'Apellido'},
      {key: 'fechanac', titulo: 'Fecha Nac'},
      {key: 'asignaturas', titulo: 'Asignaturas'},
      {key: 'notas', titulo: 'Notas'}
    ];

    const filas = alumnos.map(al => ({
      id: String(al.id ?? ''),
      nombre: String(al.nombre ?? ''),
      apellido: String(al.apellido ?? ''),
      fechanac: String(al.fechanac ?? al.fechaNac ?? ''),
      asignaturas: Array.isArray(al.asignaturas) ? al.asignaturas.join(', ') : '',
      notas: Array.isArray(al.notas) ? al.notas.join(', ') : ''
    }));

    const anchos = columnas.map(col => {
      const maxDato = Math.max(...filas.map(f => f[col.key].length));
      return Math.max(col.titulo.length, maxDato);
    });

    const separador = '+' + anchos.map(w => '-'.repeat(w + 2)).join('+') + '+';
    const encabezado = '| ' + columnas.map((c, i) => filas.length >= 0 ? c.titulo.padEnd(anchos[i], ' ') : c.titulo).join(' | ') + ' |';

    console.log(separador);
    console.log(encabezado);
    console.log(separador);
    filas.forEach(fila => {
      const linea = '| ' + columnas.map((c, i) => fila[c.key].padEnd(anchos[i], ' ')).join(' | ') + ' |';
      console.log(linea);
    });
    console.log(separador);
    return alumnos;
  }

  /**
   * Lista las notas de todos los alumnos
   */
  static listar_notas() {
    const alumnos = Alumno._leerAlumnos();
    alumnos.forEach(al => {
      console.log(`Alumno ID ${al.id}: ${al.nombre} ${al.apellido} - Notas: ${al.notas}`);
    });
  }

  // Métodos privados para manejo de archivos
  static _leerAlumnos() {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem('alumnos');
        const alumnos = data ? JSON.parse(data) : [];
        return Alumno._normalizarAlumnos(alumnos);
      } catch (e) {
        return [];
      }
    }

    try {
      const data = fs.readFileSync(RUTA_JSON, 'utf-8');
      const alumnos = JSON.parse(data);
      return Alumno._normalizarAlumnos(alumnos);
    } catch (e) {
      return [];
    }
  }

  static _guardarAlumnos(alumnos) {
    const alumnosNormalizados = Alumno._normalizarAlumnos(alumnos);
    if (typeof window !== 'undefined') {
      localStorage.setItem('alumnos', JSON.stringify(alumnosNormalizados));
      return;
    }
    fs.writeFileSync(RUTA_JSON, JSON.stringify(alumnosNormalizados, null, 2));
  }

  static _normalizarId(id) {
    if (Number.isInteger(id)) return id;
    if (typeof id === 'string') {
      if (/^\d+$/.test(id.trim())) {
        return Number(id.trim());
      }
    }
    return null;
  }

  static _normalizarAlumnos(alumnos) {
    const lista = Array.isArray(alumnos) ? alumnos.map(al => ({...al})) : [];
    const usados = new Set();

    lista.forEach(al => {
      const id = Alumno._normalizarId(al.id);
      if (Number.isInteger(id) && !usados.has(id)) {
        al.id = id;
        usados.add(id);
      } else {
        delete al.id;
      }

      if (al.fechaNac === undefined && al.fechanac !== undefined) {
        al.fechaNac = al.fechanac;
      }
      delete al.fechanac;

      if (al.rol === undefined) {
        al.rol = 'Alumno';
      }
    });

    let siguienteId = usados.size > 0 ? Math.max(...Array.from(usados)) + 1 : 1;
    lista.forEach(al => {
      if (!Number.isInteger(al.id)) {
        while (usados.has(siguienteId)) {
          siguienteId++;
        }
        al.id = siguienteId;
        usados.add(siguienteId);
        siguienteId++;
      }
    });

    return lista;
  }
}
