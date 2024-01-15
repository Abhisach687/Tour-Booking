/* eslint-disable */
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './alerts';
const stripePromise = loadStripe('pk_test_51OYlfkAFttxJkFmgFeR7JvLIqeJIgBQfp7tAUW3EGwGM7sxvwu2AaFcLMzl08BEOeLJ80qNntbBAQG6xXP7wYkrP00Cnl4syDN');
export const bookTour = async (tourId) => {
    try {
        // 1) Get checkout session from API
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
        console.log(session);
        // 2) Create checkout form + charge credit card
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    }
    catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
