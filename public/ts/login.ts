/* eslint-disable */

const login = (email: string, password: string): void => {
  alert(email, password);
};

document.querySelector('.form')!.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement)
    .value;
  login(email, password);
});
