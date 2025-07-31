import { getSession, signOut } from "next-auth/react";
import {useEffect, useState } from 'react';
import { createClient } from "@supabase/supabase-js";
import Papa from 'papaparse';
import '../styles/Backend.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function UploadCSV({ user }) {
  const [error, setError] = useState('');
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false)
  const [dataf, setDataf] = useState([]);
  const [message, setMessage] = useState('')
  const [selectedDate, setSelectedDate] = useState(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
              const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
              const customBearerToken = process.env.NEXT_PUBLIC_API_Bearer;
              const supabase = createClient (supabaseUrl, supabaseKey,
              {
                global:{
                  headers:{
                    Authorization: `Bearer ${customBearerToken}`
                  }
                }
              })
              ;


  useEffect(() => {
    const fetchOptions = async () => {
        const { data, error } = await supabase.from('tbl_user_login').select('report_name');
      if (error) {
        console.error('Error fetching options:', error);
      } else {
       setSelected(data[0].report_name)
        const parsedArray = JSON.parse(data[0].report_name);
        setOptions(parsedArray);
      }
    };

    fetchOptions();
  }, []);

  const GetData = async () => {
    setLoading(true);
    setMessage('')
    
            await new Promise(resolve => setTimeout(resolve, 10000));
            const { data, error } = await supabase
                    .from(selected)
                    .select('*')

                    
    if (error) {
      alert('Select failed.')
    } else {
      setDataf(data)
    }
  setLoading(false);

  }

 const handleExport = () => {
  const escapeCSV = (value) => {
    if (typeof value === 'string') {
      // Escape double quotes by doubling them
      value = value.replace(/"/g, '""');
      // If value contains comma, newline, or double quotes, wrap it in double quotes
      if (value.search(/("|,|\n)/g) >= 0) {
        value = `"${value}"`;
      }
    }
    return value;
  };

  const headers = Object.keys(dataf[0]);
  const rows = dataf.map(obj => headers.map(key => escapeCSV(obj[key])).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = selected+'.csv';
  link.click();
};



  return (
     <div style={{textAlign:"center"}}>
      {options.map((opt) => (
        <label key={opt.id} className={`radio-label ${selected === opt.value ? 'selected' : ''}`}>
          <input
            type="radio"
            name="dynamicRadio"
            value={opt.label}
            checked={selected === opt.label}
            onChange={() => setSelected(opt.value)}
          />
          {opt.label}
        </label>
      ))}

       <div  className="datepicker-wrapper">
      
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="MMMM d, yyyy"
          placeholderText="From date"
        />


        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="MMMM d, yyyy"
          placeholderText="To date"
        />

      
    </div>

      <button
        onClick={GetData}
        disabled={loading}
      >
      View Report
      </button>
       <button onClick={handleExport}>Download CSV</button>
      {dataf.length > 0 && (
        <div className="reportTable">
          <h3>Parsed Data: {dataf.length} rows</h3>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {Object.keys(dataf[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataf.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (

        <div style={overlayStyle}>
          <div style={loaderStyle}>Loading... Please wait</div>
        </div>
      )}

       

    </div>

  );
}
// Protect this page server-side
// export async function getServerSideProps(context) {
//   const session = await getSession(context);
//   if (!session) {
//     return {
//       redirect: {
//         destination: "/",
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: { user: session.user },
//   };
// }
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const loaderStyle = {
  padding: "20px 40px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  fontSize: "1.5rem",
  fontWeight: "bold",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
};

