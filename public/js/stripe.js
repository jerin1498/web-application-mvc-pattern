import axios from 'axios'
import { showAlert } from './alert';
// var stripe = Stripe('pk_test_k4bQtG1YigHSNqVBPbbkdfot005EIfpZTF');
import {loadStripe} from '@stripe/stripe-js';



export const bookTour = async tourId => {
    try {
        //1 get checkout session from api
        const session = await axios({
            method: 'GET',
            url:`/api/v1/bookings/checkout-session/${tourId}`
        });
        //2 create checkout form + chanre credit card
        const stripe = await loadStripe('pk_test_k4bQtG1YigHSNqVBPbbkdfot005EIfpZTF');
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (err) {
        console.log(err)
        showAlert('error', err)
    }
}