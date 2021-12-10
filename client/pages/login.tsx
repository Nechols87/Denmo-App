import React, {useState} from 'react';
import { redirect } from 'https://deno.land/x/aleph/framework/core/mod.ts';

export default function Signup(){

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const submitHandler = (e) => {
        console.log('clicked');
        e.preventDefault();
        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        })
        .then(() => redirect('/'))
        // .then((response) => console.log(response))
        // .catch((err) => console.error(err))
    }

    return(
        <div>
            <h1>Login page</h1>
            <form onSubmit={submitHandler}>
                <label>Username</label>
                <input onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                <label>Password</label>
                <input type="password" onChange={(e) => setPassword(e.target.value)}/>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}