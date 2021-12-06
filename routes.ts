import { Router } from "https://deno.land/x/oak/mod.ts"
import { addProduct, getProducts, getProduct, deleteProduct } from './controllers/products.ts'

const router = new Router();

router.get('/', (ctx) => {
    ctx.response.body = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <H1>Hello World</H1>
    </body>
    </html>`
})

router.post('/api/products', addProduct)
      .get('/api/products', getProducts)
      .get('/api/products/:id', getProduct)
      .delete('/api/products/:id', deleteProduct)
      

export default router