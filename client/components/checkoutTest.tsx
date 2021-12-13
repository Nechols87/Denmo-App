import React from 'react';
import {PaymentElement} from '../Stripe/src/index.ts';

const CheckoutForm = () => {
  return (
    <form>
      <PaymentElement />
      <button>Submit</button>
    </form>
  );
};

export default CheckoutForm;