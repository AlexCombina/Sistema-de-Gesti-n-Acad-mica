
import readlineSync from 'readline-sync';
import { Login } from './Login.js';
import { Alumno } from './Alumno.js';
import { Profesor } from './Profesor.js';
import { Asignatura } from './Asignatura.js';
import { Utiles } from './Utiles.js';

function normalizarDatos() {
	// Fuerza la persistencia de IDs y campos normalizados al iniciar la app.
	if (Alumno._leerAlumnos && Alumno._guardarAlumnos) {
		const alumnos = Alumno._leerAlumnos();
		Alumno._guardarAlumnos(alumnos);
	}
	if (Asignatura._leerAsignaturas && Asignatura._guardarAsignaturas) {
		const asignaturas = Asignatura._leerAsignaturas();
		Asignatura._guardarAsignaturas(asignaturas);
	}
}

function loginFlow() {
	console.log('=== Sistema de Gestión Académica ===');
	const nombre = readlineSync.question('Nombre: ');
	const email = readlineSync.questionEMail('Email: ');
	const password = readlineSync.question('Password: ', { hideEchoBack: true });
	const login = new Login(nombre, email, password);
	const { exito, usuario } = login.autenticar();
	if (!exito) {
		console.log('Acceso denegado. Credenciales incorrectas.');
		return null;
	}
	console.log(`Bienvenido, ${usuario.nombre} (${usuario.rol})`);
	return usuario;
}

function menuAdmin() {
	while (true) {
		console.log('\n--- Menú Admin ---');
		console.log('1. Gestionar Alumnos');
		console.log('2. Gestionar Profesores');
		console.log('3. Gestionar Asignaturas');
		console.log('4. Ver Estadísticas Globales');
		console.log('0. Salir');
		const op = readlineSync.questionInt('Opción: ');
		switch (op) {
			case 1: menuAlumnos(); break;
			case 2: menuProfesores(); break;
			case 3: menuAsignaturas(); break;
			case 4: menuEstadisticas(); break;
			case 0: return;
			default: console.log('Opción inválida.');
		}
	}
}

function menuAlumnos() {
	while (true) {
		console.log('\n--- Gestión de Alumnos ---');
		console.log('1. Listar');
		console.log('2. Nuevo');
		console.log('3. Modificar');
		console.log('4. Eliminar');
		console.log('5. Listar Notas');
		console.log('0. Volver');
		const op = readlineSync.questionInt('Opción: ');
		switch (op) {
			case 1: Alumno.listar(); break;
			case 2: {
				const nombre = readlineSync.question('Nombre: ');
				const apellido = readlineSync.question('Apellido: ');
				const fechanac = readlineSync.question('Fecha Nac (YYYY-MM-DD): ');
				const idGenerado = Alumno.nuevo({nombre, apellido, fechanac, notas: [], asignaturas: []});
				console.log(`Alumno creado con ID: ${idGenerado}`);
				break;
			}
			case 3: {
				const id = readlineSync.questionInt('ID alumno a modificar: ');
				const nuevosDatos = {};
				if (readlineSync.keyInYN('¿Modificar nombre?')) nuevosDatos.nombre = readlineSync.question('Nuevo nombre: ');
				if (readlineSync.keyInYN('¿Modificar apellido?')) nuevosDatos.apellido = readlineSync.question('Nuevo apellido: ');
				if (readlineSync.keyInYN('¿Modificar fecha de nacimiento?')) nuevosDatos.fechanac = readlineSync.question('Nueva fecha (YYYY-MM-DD): ');
				Alumno.modificar(id, nuevosDatos);
				break;
			}
			case 4: {
				const id = readlineSync.questionInt('ID alumno a eliminar: ');
				Alumno.eliminar(id);
				break;
			}
			case 5: Alumno.listar_notas(); break;
			case 0: return;
			default: console.log('Opción inválida.');
		}
	}
}

function menuProfesores() {
	while (true) {
		console.log('\n--- Gestión de Profesores ---');
		console.log('1. Listar');
		console.log('2. Nuevo');
		console.log('3. Modificar');
		console.log('4. Eliminar');
		console.log('0. Volver');
		const op = readlineSync.questionInt('Opción: ');
		switch (op) {
			case 1: Profesor.listar(); break;
			case 2: {
				const nombre = readlineSync.question('Nombre: ');
				const apellido = readlineSync.question('Apellido: ');
				const fechanac = readlineSync.question('Fecha Nac (YYYY-MM-DD): ');
				const idGenerado = Profesor.nuevo({nombre, apellido, fechanac, asignaturas: []});
				console.log(`Profesor creado con ID: ${idGenerado}`);
				break;
			}
			case 3: {
				const id = readlineSync.questionInt('ID profesor a modificar: ');
				const nuevosDatos = {};
				if (readlineSync.keyInYN('¿Modificar nombre?')) nuevosDatos.nombre = readlineSync.question('Nuevo nombre: ');
				if (readlineSync.keyInYN('¿Modificar apellido?')) nuevosDatos.apellido = readlineSync.question('Nuevo apellido: ');
				if (readlineSync.keyInYN('¿Modificar fecha de nacimiento?')) nuevosDatos.fechanac = readlineSync.question('Nueva fecha (YYYY-MM-DD): ');
				if (readlineSync.keyInYN('¿Modificar asignaturas?')) {
					const materias = readlineSync.question('IDs de asignaturas (separados por coma, ej: 1,2,5): ');
					nuevosDatos.asignaturas = materias
						.split(',')
						.map(x => Number(x.trim()))
						.filter(Number.isInteger);
				}
				Profesor.modificar(id, nuevosDatos);
				break;
			}
			case 4: {
				const id = readlineSync.questionInt('ID profesor a eliminar: ');
				Profesor.eliminar(id);
				break;
			}
			case 0: return;
			default: console.log('Opción inválida.');
		}
	}
}

function menuAsignaturas() {
	while (true) {
		console.log('\n--- Gestión de Asignaturas ---');
		console.log('1. Listar');
		console.log('2. Nueva');
		console.log('3. Modificar');
		console.log('4. Eliminar');
		console.log('5. Listar Notas de Asignatura');
		console.log('0. Volver');
		const op = readlineSync.questionInt('Opción: ');
		switch (op) {
			case 1: Asignatura.listar(); break;
			case 2: {
				const nombre = readlineSync.question('Nombre: ');
				const idGenerado = Asignatura.nuevo({nombre});
				console.log(`Asignatura creada con ID: ${idGenerado}`);
				break;
			}
			case 3: {
				const id = readlineSync.questionInt('ID asignatura a modificar: ');
				const nuevosDatos = {};
				if (readlineSync.keyInYN('¿Modificar nombre?')) nuevosDatos.nombre = readlineSync.question('Nuevo nombre: ');
				Asignatura.modificar(id, nuevosDatos);
				break;
			}
			case 4: {
				const id = readlineSync.questionInt('ID asignatura a eliminar: ');
				Asignatura.eliminar(id);
				break;
			}
			case 5: {
				const id = readlineSync.questionInt('ID asignatura: ');
				Asignatura.listar_notas(id);
				break;
			}
			case 0: return;
			default: console.log('Opción inválida.');
		}
	}
}

function menuEstadisticas() {
	const alumnos = Alumno._leerAlumnos ? Alumno._leerAlumnos() : [];
	console.log('--- Estadísticas Globales ---');
	console.log('Promocionados:');
	console.table(Utiles.calcularPromocionados(alumnos));
	console.log('Regulares:');
	console.table(Utiles.calcularRegulares(alumnos));
	console.log('Reprobados:');
	console.table(Utiles.calcularReprobados(alumnos));
}

function menuProfesor(usuario) {
	while (true) {
		console.log('\n--- Menú Profesor ---');
		console.log('1. Listar Alumnos');
		console.log('2. Poner Nota');
		console.log('0. Salir');
		const op = readlineSync.questionInt('Opción: ');
		switch (op) {
			case 1: Alumno.listar(); break;
			case 2: {
				const idAlumno = readlineSync.questionInt('ID alumno: ');
				const idAsignatura = readlineSync.questionInt('ID asignatura: ');
				const nota = readlineSync.questionInt('Nota: ');
				Profesor.poner_notas(idAlumno, idAsignatura, nota);
				break;
			}
			case 0: return;
			default: console.log('Opción inválida.');
		}
	}
}

function menuAlumno(usuario) {
	while (true) {
		console.log('\n--- Menú Alumno ---');
		console.log('1. Ver mis datos');
		console.log('2. Ver mis notas');
		console.log('0. Salir');
		const op = readlineSync.questionInt('Opción: ');
		switch (op) {
			case 1:
				console.log(usuario);
				break;
			case 2:
				Alumno.listar_notas();
				break;
			case 0: return;
			default: console.log('Opción inválida.');
		}
	}
}

function main() {
	normalizarDatos();
	const usuario = loginFlow();
	if (!usuario) return;
	if (usuario.rol === 'Admin') menuAdmin();
	else if (usuario.rol === 'Profesor') menuProfesor(usuario);
	else if (usuario.rol === 'Alumno') menuAlumno(usuario);
	else console.log('Rol no reconocido.');
}

main();
