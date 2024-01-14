/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');

//values from the form

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    e.preventDefault();
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);
