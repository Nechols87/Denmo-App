// import { useDeno } from 'aleph/react'
import React, {useState, useEffect} from 'react';
import '../style/index.css';
import Product from '../components/product.tsx';
// import useFetch from '../hooks/useFetch.tsx';
import { redirect } from 'https://deno.land/x/aleph/framework/core/mod.ts';

export default function Home () {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  //custom hook implementation
  // const {data, isLoading, error} = useFetch('http://localhost:3000/api/products');
  // console.log(data)setLoading(false)



  useEffect(() => {
    getData()
  }, [])

  const getData =  () => {
    fetch('http://localhost:3000/api/products')
    .then((res) => res.json())
    // .then((boo) => console.log(boo))
    .then((data) => setData(data.data))
    .then(() => setLoading(true))
    // console.log(json);
  }

  const checkout = () => {
    // console.log('should navigate to the cart')
    redirect('/cart');
  }

  return (
    <div className="page">
      <h1>Welcome to Swag Sale</h1>
      <h3>Products: </h3>
    {
      loading === false && <p>Loading...</p>
    }
    <div className="card-container">
    {
      data.length > 0 && data.map((el: any, key: any) => (
        // <h5 key={el.id}>{el.name}</h5>
        // <p key={el.id}>{el.description}</p>
        <Product key={el.id} id={el.id} name={el.name} description={el.description} price={el.price} inCart={el.incart} getData={getData}/>
      ))
    }
      </div>
      <button onClick={checkout} className="checkout-btn">Checkout</button>
    </div>
  )
}
