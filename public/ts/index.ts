/* eslint-disable */
import '@babel/polyfill';
import { signup } from './signup';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

//DOM elements
const signupForm = document.querySelector('.form--signup') as HTMLFormElement;
const loginForm = document.querySelector('.form-login') as HTMLFormElement;
const logoutBtn = document.querySelector(
  '.nav__el--logout'
) as HTMLButtonElement;
const userDataForm = document.querySelector(
  '.form-user-data'
) as HTMLFormElement;
const userPasswordForm = document.querySelector(
  '.form-user-password'
) as HTMLFormElement;
const bookBtn = document.getElementById('book-tour') as HTMLButtonElement;

if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = (document.getElementById('name') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement)
      .value;
    const passwordConfirm = (document.getElementById(
      'passwordConfirm'
    ) as HTMLInputElement).value;

    signup(name, email, password, passwordConfirm);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement)
      .value;
    e.preventDefault();
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append(
      'name',
      (document.getElementById('name') as HTMLInputElement).value
    );
    form.append(
      'email',
      (document.getElementById('email') as HTMLInputElement).value
    );
    form.append(
      'photo',
      (document.getElementById('photo') as HTMLInputElement).files[0]
    );

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password')!.textContent = 'Updating...';

    const passwordCurrent = (document.getElementById(
      'password-current'
    ) as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement)
      .value;
    const passwordConfirm = (document.getElementById(
      'password-confirm'
    ) as HTMLInputElement).value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password')!.textContent =
      'Save password';
    (document.getElementById('password-current') as HTMLInputElement).value =
      '';
    (document.getElementById('password') as HTMLInputElement).value = '';
    (document.getElementById('password-confirm') as HTMLInputElement).value =
      '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
