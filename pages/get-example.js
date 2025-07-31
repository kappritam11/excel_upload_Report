import { useEffect, useState } from 'react';

export default function GetExample() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // e.g. https://api.example.com/data
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;  // optional
        const Bearer = process.env.NEXT_PUBLIC_API_Bearer;

        const res = await fetch(apiUrl +"tbl_user_login?select=*", {
          headers: {
            'apikey':`${apiKey}`,
            'Authorization': `Bearer ${Bearer}`,  // omit if not needed
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) return <div>Error1: {error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>GET API Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
