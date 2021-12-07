import { Client } from "https://deno.land/x/postgres/mod.ts"
import { dbCreds } from '../config.ts'

const client = new Client(dbCreds);

const addUser = async ({ request, response }: {request: any, response: any }) => {
    const body = await request.body();
    // console.log(body);
    const user = await body.value
    console.log(user)
    if (!request.hasBody) {
        response.status = 400
        response.body = {
            success: false,
            msg: 'No data'
        }
    } else {
        try {
        await client.connect()
         
        const result = await client.queryArray("INSERT INTO registration(username, password, email, firstname, lastname) VALUES($1,$2,$3,$4,$5) RETURNING id", 
        user.username, 
        user.password,
        user.email,
        user.firstname,
        user.lastname)

        response.status = 201
        response.body = {
            success: true,
            data: user
        }
        console.log(user)
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

const loginUser = async ({ request, response }: {request: any, response: any }) => {
    const body = await request.body();
    const user = await body.value
    const { username, password } = user;
    if (!username || !password) {
        response.status = 400
        response.body = {
            success: false,
            msg: 'No data'
        }
    } else {
        try {
        await client.connect()
         
        const result: any = await client.queryObject(`SELECT * FROM registration WHERE username = '${username}'`)
        console.log(result.rows[0])    
        if (result.rows[0].password === password){
          response.status = 201
          response.body = {
            success: true,
            data: user
          }
        }
        else {
          response.body = {
            success: false,
            data: "You have entered an incorrect password"    
          }
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
}

export { addUser, loginUser }