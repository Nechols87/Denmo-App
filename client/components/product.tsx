import React from 'react';


export default function Product({name, description, price, id, inCart, getData}){

    // console.log(id)
    const addToCart = () => {
        console.log(id)
        fetch(`http://localhost:3000/api/addtocart/${id}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(() => getData())
        .catch((err) => console.error(err))
        // fetch('')
    }

    const removeFromCart = () => {
        console.log(id)
        fetch(`http://localhost:3000/api/deletefromcart/${id}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(() => getData())
        .catch((err) => console.error(err))
        // fetch('')
    }
    return(
        <div className="product-card">
            <h4>{name}</h4>
            <p>Price:{price}</p>
            <div className="cart-btn-container">
            <div>
            {inCart === false && <button onClick={() => addToCart()} className="cart-btn">Add to cart</button> }
            </div>
            <div>
            {inCart === true && <button onClick={() => removeFromCart()} className="cart-btn">Remove from cart</button>}
            </div>
            </div>
           
        </div>
    )
}