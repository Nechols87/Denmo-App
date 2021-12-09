import {useState, useEffect} from 'react';

const useFetch = (url: string) => {
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const getData = () => {
            fetch(url)
            .then((res) => res.json())
            // .then((data) => console.log(data))
            .then((data) => {
                setData(data.data)
            })
            .then(() => setLoading(false))
            .catch((err) =>{ 
                setError(err)
                setLoading(false)
            })

        };

        getData();
    }, [url]);


    return {isLoading, data, error}
}

export default useFetch;