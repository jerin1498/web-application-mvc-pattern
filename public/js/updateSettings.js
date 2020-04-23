import axios from 'axios';
import {showAlert} from './alert'


// data = object, type = either password or data
export const updateSettings = async (data, type) => {
    try {
        var baseUrl = '/api/v1/users/';
        var url = type === 'data' ? baseUrl + 'updateme' : baseUrl + 'updatepassword';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        console.log(res)
        if (res.data.status === 'success') {
            showAlert('success', `user ${type} updated successfully`);
            window.setTimeout(() => {
                location.reload(true)
            }, 1500)
            
        }
    } catch (err){
        showAlert('error', err.response.data.message)
    }
}