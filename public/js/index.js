import '@babel/polyfill';
import { login, logout, signin } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';


//dom elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signinForm = document.querySelector('form.form.form--signin');
const updateForm = document.querySelector('.form.form-user-data');
const PasswordUpdateForm = document.querySelector('.form.form-user-password');
const logOutBtn = document.querySelector('.nav__el--logout');
const bookBtn = document.querySelector('#book-tour');

// for displaying map
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
};

// for singin
if (signinForm) {
    signinForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.querySelector('#name').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        const passwordConfirm = document.querySelector('#passwordConfirm').value;
        signin({ name, email, password, passwordConfirm });
    });
}

// for login
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
};


//  for log out 
if (logOutBtn) logOutBtn.addEventListener('click', logout);


// updating user detail
if (updateForm) {
    updateForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData(); // it include multipart method init by this only we can send files
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])
        console.log(form)
        updateSettings(form, 'data');
    })
}

// updating user password
if (PasswordUpdateForm) {
    PasswordUpdateForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').innerText = 'Updating ...'
        const password = document.getElementById('password-current').value;
        const newpassword = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({ password, newpassword, passwordConfirm }, 'password');

        document.querySelector('.btn--save-password').innerText = 'Save Password'
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
}

if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        bookTour(tourId)
    })
}