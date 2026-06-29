// Utiles.js
// Métodos utilitarios estáticos

export class Utiles {
  /**
   * Calcula la edad exacta a partir de una fecha de nacimiento (YYYY-MM-DD o Date)
   * @param {string|Date} fechaNacimiento
   * @returns {number} Edad en años
   */
  static calcularEdad(fechaNacimiento) {
    const fecha = (fechaNacimiento instanceof Date) ? fechaNacimiento : new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  }

  /**
   * Calcula el promedio de un array de notas
   * @param {number[]} arrayNotas
   * @returns {number} Promedio numérico
   */
  static calcularPromedio(arrayNotas) {
    if (!Array.isArray(arrayNotas) || arrayNotas.length === 0) return 0;
    const suma = arrayNotas.reduce((acc, n) => acc + n, 0);
    return suma / arrayNotas.length;
  }

  /**
   * Filtra alumnos promocionados (promedio >= 7)
   * @param {Array<{notas:number[]}>} arrayAlumnos
   * @returns {Array}
   */
  static calcularPromocionados(arrayAlumnos) {
    return arrayAlumnos.filter(al => Utiles.calcularPromedio(al.notas) >= 7);
  }

  /**
   * Filtra alumnos regulares (4 <= promedio < 7)
   * @param {Array<{notas:number[]}>} arrayAlumnos
   * @returns {Array}
   */
  static calcularRegulares(arrayAlumnos) {
    return arrayAlumnos.filter(al => {
      const prom = Utiles.calcularPromedio(al.notas);
      return prom >= 4 && prom < 7;
    });
  }

  /**
   * Filtra alumnos reprobados (promedio < 4)
   * @param {Array<{notas:number[]}>} arrayAlumnos
   * @returns {Array}
   */
  static calcularReprobados(arrayAlumnos) {
    return arrayAlumnos.filter(al => Utiles.calcularPromedio(al.notas) < 4);
  }
}
