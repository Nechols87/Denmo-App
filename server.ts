import { Application } from "https://deno.land/x/oak/mod.ts"
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import router from './routes.ts'

const port =  Deno.env.get("PORT") || 3000
const app = new Application()


app.use(oakCors())
app.use(router.routes())
app.use(router.allowedMethods())


console.log(`Server running on port ${port}`)

await app.listen({port: +port})
