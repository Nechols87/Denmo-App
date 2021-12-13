import React, { FC } from 'react'
import {Elements} from './Stripe/src/components/Elements.tsx';
import {loadStripe} from './Stripe/src/js/types/index.d.ts';

export default function App({ Page, pageProps }: { Page: FC, pageProps: Record<string, unknown> }) {
  // Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_live_51K1e8PLiNZPLhmx7qmW0uSiT90KLEUhWdSbYSe0i5a8tmwRpMtUnXeud5tLC4dEVNO5Sgq2BGAtPbImupBH5IAMg00oykzTTOx');

// const options = {
//   // passing the client secret obtained from the server
//   clientSecret: '{{CLIENT_SECRET}}',
// };


  return (
    <main>
      <head>
        <meta name="viewport" content="width=device-width" />
      </head>
      <Elements stripe={stripePromise} >
        <Page {...pageProps} />
      </Elements>
    </main>
  )
}
