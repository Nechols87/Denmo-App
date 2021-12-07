// import { useDeno } from 'aleph/react'
import React, {useState, useEffect} from 'react';





export default function Home () {
  // const version = useDeno(() => Deno.version.deno)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getData()
  }, [])

  const getData =  () => {
    fetch('http://localhost:3000/api/products')
    .then((res) => res.json())
    // .then((data) => console.log(data))
    .then((data) => setData(data.data))
    .then(() => setLoading(true))
    // console.log(json);
    


  }

  return (
    <div className="page">
      <h1>Hello world</h1>
      <p>Products: </p>
    {
      loading === false && <p>Loading...</p>
    }
    {
      data.length > 0 && data.map((el, key) => (
        <p key={el.id}>{el.name}</p>
      ))
    }
    </div>
  )
}
