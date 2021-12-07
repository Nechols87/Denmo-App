import { Router } from "https://deno.land/x/oak/mod.ts"
import { addProduct, getProducts, getProduct, deleteProduct } from './controllers/products.ts'
import { addUser, loginUser } from './controllers/users.ts'

const router = new Router();

router.get("/", async (context) => {

    // Examples of getting and setting variables on a session
    if (await context.state.session.get("pageCount") === undefined) {
        await context.state.session.set("pageCount", 0);

    } else {
        await context.state.session.set("pageCount", await context.state.session.get("pageCount") + 1);
    }
    
    context.response.body = `Visited page ${await context.state.session.get("pageCount")} times`;
});

router.post('/api/products', addProduct)
      .get('/api/products', getProducts)
      .get('/api/products/:id', getProduct)
      .delete('/api/products/:id', deleteProduct)
      .post('/api/register', addUser)
      .post('/api/login', loginUser)
      

export default router