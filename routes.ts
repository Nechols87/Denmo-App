import { Router } from "https://deno.land/x/oak/mod.ts"
import { addProduct, getProducts, getProduct, deleteProduct } from './controllers/products.ts'
import { addUser, loginUser, jwtLogin, logout } from './controllers/users.ts'

const router = new Router();


router.post('/api/products', addProduct)
      .get('/api/products', getProducts)
      .get('/api/products/:id', getProduct)
      .delete('/api/products/:id', deleteProduct)
      .post('/api/register', addUser)
      .post('/api/login', loginUser)
      .get('/api/user', jwtLogin)
      .post('/api/logout', logout)
      

export default router