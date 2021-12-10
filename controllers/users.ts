import { Client } from "https://deno.land/x/postgres/mod.ts"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";
import {create, decode } from "https://deno.land/x/djwt@v2.4/mod.ts"
import "https://deno.land/x/dotenv/load.ts";
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
        const salt = await bcrypt.genSalt(8);
        const hash = await bcrypt.hash(user.password, salt);
        console.log(`hash: ${hash}`); 
        const result = await client.queryArray("INSERT INTO registration(username, password, email, firstname, lastname) VALUES($1,$2,$3,$4,$5) RETURNING id", 
        user.username, 
        hash,
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


const loginUser = async ({ request, response, cookies }: {request: any, response: any, cookies: any }) => {
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
        const isValid = await bcrypt.compare(password, result.rows[0].password);
        console.log(`isValid: ${isValid}`);    
        if (isValid === true){
            const key = await crypto.subtle.generateKey(
                { name: "HMAC", hash: "SHA-512" },
                true,
                ["sign", "verify"],
              );
           
            
            const jwt = await create({alg: "HS512", typ: "JWT"}, {user: result.rows[0].username}, key);
             
            cookies.set('jwt', jwt, {httpOnly: true});
            
            response.status = 201
            response.body = {
                message: 'success',
                data: "You have entered a correct password"
            };
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

const jwtLogin = async ({response, cookies}: { response: any, cookies: any }) => {
    const jwt = await cookies.get("jwt") || '';
    console.log(typeof jwt)
    if (!jwt) {
        response.body = 401;
        response.body = {
            message: 'unauthenticated'
        };
        return;
    }

 

    // const [ header, payload, signature] = await decode(jwt);
    const decoded: any = await decode(jwt);
    console.log(decoded);
    const user: any[] = decoded[1].user
    console.log(user)
    // const result = await verify(jwt, key);
    

    // const result = await verify(jwt, key);
    // console.log(`payload ${payload}`)
    if (!user) {
        response.body = 401;
        response.body = {
            message: 'unauthenticated'
        };
        return;
    }

    const result = await client.queryArray(`SELECT * FROM registration WHERE username = '${ user }'`)
    if(!result) {
        response.body = 401;
        response.body = {
            message: 'unauthenticated'
        };
        return;
    }
    response.body = {data: "still working"}
    return
    
}
const logout = async ({response, cookies}: {response: any, cookies: any}) => {
    cookies.delete('jwt');

    response.body = {
        message: 'success'
    }
}



export { addUser, loginUser, jwtLogin,  logout}