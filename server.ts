import { Application } from "https://deno.land/x/oak/mod.ts"
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { Session } from "https://deno.land/x/session/mod.ts";
import router from './routes.ts'


const port =  Deno.env.get("PORT") || 3000
const app = new Application()



// Configuring Session for the Oak framework
const session = new Session({ 
    framework: "oak",
    store: "memory", 
});
await session.init();

// Adding the Session middleware. Now every context will include a property
// called session that you can use the get and set functions on
app.use(session.use()(session));

// Adding oakCors to streamline connection between front end server and backend server
app.use(oakCors())
app.use(router.routes())
app.use(router.allowedMethods())


console.log(`Server running on port ${port}`)

await app.listen({port: +port})
