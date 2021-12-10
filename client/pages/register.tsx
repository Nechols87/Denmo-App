import React, {useState} from 'react';
import { redirect } from 'https://deno.land/x/aleph/framework/core/mod.ts';

export default function Signup(){
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const register = (e) => {
        console.log('clicked');
        e.preventDefault();
        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
                firstname, 
                lastname,
                email
            })
        })
        .then(() => redirect('/'))
    }
    return(
        <div>
            <h1>Login page</h1>
            <form onSubmit={register}>
                <label>First Name</label>
                <input onChange={(e) => setFirstname(e.target.value)} placeholder="first name" />
                <label>Last Name</label>
                <input onChange={(e) => setLastname(e.target.value)} placeholder="last name" />
                <label>Username</label>
                <input onChange={(e) => setUsername(e.target.value)} placeholder="username"  />
                <label>Email</label>
                <input onChange={(e) => setEmail(e.target.value)} placeholder="email"  />
                <label>Password</label>
                <input onChange={(e) => setPassword(e.target.value)} type="password"/>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}