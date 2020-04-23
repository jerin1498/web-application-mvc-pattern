import axios from 'axios';
import {showAlert} from './alert'


export const login = async (email, password) => {
    try {
        const res = await axios({ // getting data form our api that we created
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if (res.data.status === 'success') {// status is that we provided in our api
            showAlert('success', 'logged in successfully')
            window.setTimeout(() => {
                location.assign('/') // redirect to home page
            }, 1500);
        };
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

// for log out

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
        });
        if (res.data.status === 'success') location.reload(true);
    } catch{
        showAlert('error', 'Error during logging out! Try again')
    }
};


