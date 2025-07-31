import { getSession, signOut } from "next-auth/react";
import {useEffect, useState } from 'react';
import { createClient } from "@supabase/supabase-js";
import Papa from 'papaparse';
import '../styles/Backend.css';


export default function UploadCSV({ user }) {
  const [dataf, setDataf] = useState([]);
  const [error, setError] = useState('');
  const [success, setsuccess] = useState('');
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [table, setTable] = useState('');
  const [showButton, setShowButton] = useState(false);

  const handleChange = (event) => {
    setTable(event.target.value);
  };

   const loadingStart = (event) => {
    setLoading(true);
  };
  const loadingStop = (event) => {
    setLoading(false);
  };
 

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setError('Please upload a file');
      return;
    }

    if (file.type !== 'text/csv') {
      setError('Only CSV files are allowed');
      return;
    }
 

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setDataf(results.data);


        const Pricekeys = { city:"", mtoc:"", model_variant:"",state:"", ex_show_room_price:"",	model:"",	model_category:"",	color:"",	model_code:"",	category:"",	model_name:"",	color_display_name:"",	color_code:"",	model_variant_display_name:"" };
        const Dealerkeys = {no:"",	region:"",	network_code:"",	network_type:"",	dealer_code:"",	dealer_firm_name:"",	
          dealer_trade_name:"",	secondary_network_name:"",	"3rd_own_party":"",	zone:"",	area_code:"",	network_location:"",	
          city:"",	state:"",	district:"",	address:"",	pin_code:"",	contact_person:"",	mobile:"",	email:"",	
          monday_and_working_hrs:"",	tuesday_and_working_hrs:"",	wednesday_and_working_hrs:"",	thursday_and_working_hrs:"",
          friday_and_working_hrs:"",	saturday_and_working_hrs:"",	sunday_and_working_hrs:"",	google_my_business_id_cid:"",	
          latitude:"",	longitude:"",	certified_or_not:"",	name_of_certification:"",	display_area_available:"",	
          service_centre:"",	vas_product_sold_by_asc:"",	genuine_lubes_and_chemicals:"",	parts:"",	dealer_image:"",	
          payu_merchent_id:"",	dealer_type:""}

        const keysA1 = Object.keys(results.data[0]);
        let keysA2 = null;
        switch(table) 
        {
          case "Price":
            keysA2=Object.keys(Pricekeys);
            break;
          case "Dealer":
            keysA2=Object.keys(Dealerkeys);
            break;
         
        }
        

        const missingInA1 = keysA1.filter(key => !keysA2.includes(key));
        const missingInA2 = keysA2.filter(key => !keysA1.includes(key));

        if (missingInA2.length==0 && missingInA1.length ==0)
        {
          setError("");
          setsuccess("There is "+ missingInA2.length +" missing key: '"+ missingInA2 +"'. There are "+missingInA1.length +" extra keys: '"+ missingInA1 +"'.");
          setShowButton(true);
        }else
        {
          setsuccess("")
          setError("There is "+ missingInA2.length +" missing key: '"+ missingInA2 +"'. There are "+missingInA1.length +" extra keys: '"+ missingInA1 +"'.");
        }
      },
      error: function (err) {
        setError('Error parsing CSV');
      },
    });

  };

   const insertMatinal = async () => {
    setLoading(true);
    setMessage('')
    await new Promise(resolve => setTimeout(resolve, 10000));
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

               switch(table) 
                {
                  case "Price":
                    await supabase
                    .from('tbl_product_master_Excel_Uplode')
                    .delete()
                    .not('id', 'is', null);
                    const { data:insertdataPrice , error:insertErrorPrice  } = await supabase
                    .from('tbl_product_master_Excel_Uplode')
                    .insert(dataf)
                    await supabase.rpc('fn_updatet_tbl_product_master_excel_uplode')
                    break;
                  case "Dealer":
                    await supabase
                    .from('tbl_dealer_master_excel_uplode')
                    .delete()
                    .not('id', 'is', null);
                    const { data:insertdataDealer, error:insertErrorDealer } = await supabase
                    .from('tbl_dealer_master_excel_uplode')
                    .insert(dataf)
                    await supabase.rpc('fn_updatet_tbl_dealer_master_excel_uplode')
                    break;
                
                }

       
     


    if (error) {
      alert('Insert failed.')
    } else {
    setShowButton(false);
      alert('Insert successful!')
    }
  setLoading(false);

  }

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => signOut()}>Sign Out</button>
      <h1>Upload CSV File</h1>
      <label className={`radio-label ${table === 'Price' ? 'selected' : ''}`}>
        <input
          type="radio"
          value="Price"
          checked={table === 'Price'}
          onChange={handleChange}
          name="table"
        />
        <span>Price Master</span>
      </label>

      <label className={`radio-label ${table === 'Dealer' ? 'selected' : ''}`}>
        <input
          type="radio"
          value="Dealer"
          checked={table === 'Dealer'}
          onChange={handleChange}
          name="table"
        />
        <span>Dealer Master</span>
      </label>


      <input type="file" accept=".csv" onChange={handleFileChange}  />

      <div>
      <button
        onClick={insertMatinal}
        disabled={loading}
        style={{ display: showButton ? 'block' : 'none' }}
      >
      Upload to Server
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {dataf.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Parsed Data:{dataf.length}</h3>
          
          <pre>{JSON.stringify(dataf[0], 1, 2)}</pre>
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
export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}

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

