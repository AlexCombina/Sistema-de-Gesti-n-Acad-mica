// Login.js
// Clase encargada de la autenticación y auditoría de accesos

const RUTA_LOG = './data/registros_login.json';

// Array inmutable de credenciales válidas
const USUARIOS = Object.freeze([
  { nombre: 'admin', email: 'admin@admin.com', password: 'admin123', rol: 'Admin' },
  { nombre: 'profesor1', email: 'prof1@escuela.com', password: 'prof123', rol: 'Profesor' },
  { nombre: 'alumno1', email: 'alumno1@escuela.com', password: 'alum123', rol: 'Alumno' }
  // Agrega más usuarios según necesidad
]);

export class Login {
  constructor(nombre, email, password) {
    this.nombre = nombre;
    this.email = email;
    this.password = password;
  }

  /**
   * Valida si las credenciales coinciden con el array inmutable
   * @returns {object} {exito: boolean, usuario: object|null}
   */
  autenticar() {
    const usuario = USUARIOS.find(u =>
      u.nombre === this.nombre &&
      u.email === this.email &&
      u.password === this.password
    );
    const exito = !!usuario;
    // Registrar acceso
    Login.registrarAcceso({
      usuario: this.email,
      fecha_hora: new Date().toISOString(),
      exito
    });
    return { exito, usuario };
  }

  /**
   * Escribe un registro de acceso en el archivo JSON
   * @param {object} logEntry
   */
  static registrarAcceso(logEntry) {
    if (typeof window !== 'undefined') {
      // En navegador no escribimos archivos locales.
      return;
    }

    import('fs')
      .then(fs => {
        let registros = [];
        try {
          const data = fs.readFileSync(RUTA_LOG, 'utf-8');
          registros = JSON.parse(data);
        } catch (e) {}
        registros.push(logEntry);
        fs.writeFileSync(RUTA_LOG, JSON.stringify(registros, null, 2));
      })
      .catch(() => {});
  }

  /**
   * Devuelve el array inmutable de usuarios
   */
  static getUsuarios() {
    return USUARIOS;
  }
}
