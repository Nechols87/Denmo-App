import React from 'react';


export default function Product({name, description, price}){
    return(
        <div className="product-card">
            <h4>{name}</h4>
            <p>{price}</p>
        </div>
    )
}