import React, {useEffect, useState} from 'react';
import { redirect } from 'https://deno.land/x/aleph/framework/core/mod.ts';

export default function Cart(){
    const [cart, setCart] = useState([]);

    const getCartData = () => {
        fetch('http://localhost:3000/api/incart')
        .then((res) => res.json())
        .then((data) => setCart(data.data))
        .catch((err) => console.error(err))
    }

    const goBack = () => {
        redirect('/')
    }

    useEffect(() => {
        getCartData()
    }, [])


    return(
        <div className="card-container">
            <h1>Cart</h1>

            { cart.length === 0 && <p>Cart is empty</p>}
            {cart.length > 0 && cart.map((el) => (
                <div className="product-card">
                <p>{el.name}</p>
                </div>
            ))}
            {/* 
            map through items that have inCart = true, use same classname as products
            in index */}
            <button onClick={goBack}>Go back to home</button>
        </div>
    )
}