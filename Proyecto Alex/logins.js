import { Login } from './Login.js';

const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');
const btnLogin = document.getElementById('btn-login');
const mensaje = document.getElementById('mensaje');

function mostrarError(texto) {
  mensaje.textContent = texto;
  mensaje.classList.add('error');
}

btnLogin.addEventListener('click', event => {
  event.preventDefault();

  const email = inputEmail.value.trim();
  const password = inputPassword.value;

  if (!email || !password) {
    mostrarError('Completa email y contrasena.');
    return;
  }

  const usuarioDetectado = Login.getUsuarios().find(u => u.email === email);
  const nombre = usuarioDetectado ? usuarioDetectado.nombre : '';

  const login = new Login(nombre, email, password);
  const { exito } = login.autenticar();

  if (exito) {
    mensaje.classList.remove('error');
    mensaje.textContent = 'Login exitoso. Redirigiendo...';
    window.location.href = 'menu.html';
    return;
  }

  mostrarError('Credenciales Invalidas');
});
