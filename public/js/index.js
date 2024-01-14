/* eslint-disable */
import '@babel/polyfill';
import { login } from './login';
const loginForm = document.querySelector('.form');

//values from the form

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    e.preventDefault();
    login(email, password);
  });
}
