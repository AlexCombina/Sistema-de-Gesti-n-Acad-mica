// Persona.js
// Clase base abstracta para Alumno y Profesor

// Clase abstracta Persona
export class Persona {
  /**
   * @param {string} nombre
   * @param {string} apellido
   * @param {string|Date} fechanac
   * @param {string} rol ('Alumno' | 'Profesor' | 'Admin')
   */
  constructor(nombre, apellido, fechanac, rol) {
    if (this.constructor === Persona) {
      throw new Error('No se puede instanciar la clase abstracta Persona directamente.');
    }
    this.nombre = nombre;
    this.apellido = apellido;
    this.fechanac = fechanac instanceof Date ? fechanac : new Date(fechanac);
    this.rol = rol;
  }
}
