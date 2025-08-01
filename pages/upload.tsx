import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import '../styles/Backend.css';
import Papa from 'papaparse';

interface UploadCSVProps {
  user: any; // You can replace `any` with a proper user type if available
}

interface Option {
  label: string;
  value: string;
  table1?: string;
  id?: string | number;
}

type TableType = 'Price' | 'Dealer' | '';

export default function UploadCSV({ user }: UploadCSVProps) {
  const [dataf, setDataf] = useState<Record<string, string | number | null>[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [table, setTable] = useState<string>('');
  const [table1, setTable1] = useState<string>('');
  const [showButton, setShowButton] = useState<boolean>(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string>('');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const customBearerToken = process.env.NEXT_PUBLIC_API_Bearer!;

  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${customBearerToken}`,
      },
    },
  });



  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase.from('tbl_user_login').select('excel_upload');
      if (error) {
        console.error('Error fetching options:', error);
        setError('Failed to fetch options');
      } else if (data && data.length > 0) {
        try {
          const parsedArray: Option[] = data.flatMap(row => row.excel_upload as Option[])
         
          setOptions(parsedArray);
          if (parsedArray.length > 0) {
         
            setTable(parsedArray[0].value as string);
            setTable1(parsedArray[0].table1 as string)
            setError(table1);
          }
        } catch (err) {
      
          setError('Invalid excel_upload data format');
        }
      }
    };

    fetchOptions();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      complete: async (results: { data: Record<string, string | number | null>[]; }) => {
        const parsed = results.data as Record<string, string | number | null>[];
        setDataf(parsed);

        const keysA1 = Object.keys(parsed[0]);
        let keysA2: string[] = [];


        const { data, error } = await supabase.from(table).select('*').limit(1);;
      if (error) {
        console.error('Error fetching options:', error);
        setError('Failed to fetch options');
      } else if (data && data.length > 0) {
        try {
           
            keysA2 =Object.keys(data[0])
        } catch (err) {
      
          setError('Invalid excel_upload data format');
        }
      }



        const missingInA1 = keysA1.filter((key) => !keysA2.includes(key));

        if (missingInA1.length === 0) {
          setError('');
          setSuccess('All keys match!');
          setShowButton(true);
        } else {
          setSuccess('');
          setError(
            `Extra keys: [${missingInA1.join(', ')}]`
          );
        }
      },
      error: () => {
        setError('Error parsing CSV');
      },
    });
  };

  const insertMatinal = async () => {
    setLoading(true);
    setMessage('');

    await new Promise((resolve) => setTimeout(resolve, 10000));

    switch (table) {
      case 'Price':
        await supabase.from('tbl_product_master_Excel_Uplode').delete().not('id', 'is', null);
        await supabase.from('tbl_product_master_Excel_Uplode').insert(dataf);
        await supabase.rpc('fn_updatet_tbl_product_master_excel_uplode');
        break;

      case 'Dealer':
        await supabase.from('tbl_dealer_master_excel_uplode').delete().not('id', 'is', null);
        await supabase.from('tbl_dealer_master_excel_uplode').insert(dataf);
        await supabase.rpc('fn_updatet_tbl_dealer_master_excel_uplode');
        break;
    }

    setShowButton(false);
    alert('Insert successful!');
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => signOut()}>Sign Out</button>
      <h1>Upload CSV File</h1>

      {options.map((opt) => (
        <label
          key={opt.id ?? opt.value}
          className={`radio-label ${selected === opt.value ? 'selected' : ''}`}
        >
          <input
            type="radio"
            name="dynamicRadio"
            value={opt.value}
            checked={selected === opt.value}
            onChange={() => {
              const val = opt.value as TableType;
              setSelected(val);
              setTable(val);
            }}
          />
          {opt.label}
        </label>
      ))}

      <input type="file" accept=".csv" onChange={handleFileChange} />

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
          <h3>Parsed Data: {dataf.length} rows</h3>
          <pre>{JSON.stringify(dataf[0], null, 2)}</pre>
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

// Server-side authentication
export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<UploadCSVProps>> {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}
const overlayStyle: React.CSSProperties = {
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

const loaderStyle: React.CSSProperties = {
  padding: "20px 40px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  fontSize: "1.5rem",
  fontWeight: "bold",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
};
