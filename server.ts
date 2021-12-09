import { Application } from "https://deno.land/x/oak/mod.ts"
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import router from './routes.ts'


const port =  Deno.env.get("PORT") || 3000
const app = new Application()


app.use(oakCors({
    credentials: true,
    origin: /^.+localhost:(3000|4200|8080)$/,
}))
app.use(router.routes())
app.use(router.allowedMethods())

// console.log(config());
console.log(`Server running on port ${port}`)

await app.listen({port: +port})

