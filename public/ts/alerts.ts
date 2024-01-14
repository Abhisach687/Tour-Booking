/* eslint-disable */

export const hideAlert = (): void => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement?.removeChild(el);
};

// type is 'success' or 'error'
export const showAlert = (type: string, msg: string, time = 7): void => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body')?.insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, time * 1000);
};
