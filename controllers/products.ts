import { Client } from "https://deno.land/x/postgres/mod.ts"
import { dbCreds } from '../config.ts'

const client = new Client(dbCreds);

const addProduct = async ({ request, response }: {request: any, response: any }) => {
    const body = await request.body();
    // console.log(body);
    const product = await body.value
    // console.log(body.value)
    if (!request.hasBody) {
        response.status = 400
        response.body = {
            success: false,
            msg: 'No data'
        }
    } else {
        try {
        await client.connect()
         
        const result = await client.queryArray("INSERT INTO products(name, description, price, image) VALUES($1,$2,$3,$4)", 
        product.name, 
        product.description,
        product.price,
        product.image)

        response.status = 201
        response.body = {
            success: true,
            data: product
        }
        // console.log(product)
    } catch (err) {
        response.status = 500
        response.body = {
            success: false,
            msg: err.toString()
        }
    } finally {
        await client.end()
    }  
  }  
}

const getProducts = async ({ response }:{ response: any }) => {
    try {
        await client.connect()

        const result = await client.queryObject("SELECT * FROM products")
        console.log(result.rows)
        // const products = [];
        let products;
        if (!result.rows.length){
            products = 'no products yet'
        }

        products = result.rows.map(el => {
            return el
        });
        response.status = 201
        response.body = {
            success: true,
            data: products
        }
    } catch (err) {
            response.status = 500
            response.body = {
                success: false,
                msg: err.toString()
            }
        } finally {
            await client.end()
    }  
}  
const getProduct = async ({ params, response }:{ params: {id: string}, response: any }) => {
    try {
        await client.connect()

        // console.log(params)

        const result = await client.queryObject("SELECT * FROM products WHERE id = $1", params.id)
        
        let product;
        if (!result){
            product = 'no product with that id found'
        }

        product = result.rows[0];
        response.status = 201
        response.body = {
            success: true,
            data: product
        }
    } catch (err) {
            response.status = 500
            response.body = {
                success: false,
                msg: err.toString()
            }
        } finally {
            await client.end()
    }  
}  
const deleteProduct = async ({ params, response }:{ params: {id: string}, response: any }) => {
    try {
        await client.connect()

        // console.log(params)

        const result = await client.queryObject("DELETE FROM products WHERE id = $1", params.id)
        
        let product;
        if (!result){
            product = 'no product with that id found'
        }

        product = result.rows[0];
        response.status = 201
        response.body = {
            success: true,
            data: product
        }
    } catch (err) {
            response.status = 500
            response.body = {
                success: false,
                msg: err.toString()
            }
        } finally {
            await client.end()
    }  
}  


export { addProduct, getProducts, getProduct, deleteProduct }