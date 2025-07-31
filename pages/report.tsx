import { getSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import "../styles/Backend.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Option {
  id?: string | number;
  label: string;
  value: string;
}

interface DataRow {
  [key: string]: any;
}

interface UploadCSVProps {
  user?: {
    name?: string;
    email?: string;
    // add more user fields if needed
  };
}

export default function UploadCSV({ user }: UploadCSVProps) {
  const [error, setError] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dataf, setDataf] = useState<DataRow[]>([]);
  const [message, setMessage] = useState<string>("");
  const [selectedDateFrom, setSelectedDateFrom] = useState<Date | null>(null);
  const [selectedDateTo, setSelectedDateTo] = useState<Date | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const customBearerToken = process.env.NEXT_PUBLIC_API_Bearer || "";

  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${customBearerToken}`,
      },
    },
  });

  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase.from("tbl_user_login").select("report_name");

      if (error) {
        console.error("Error fetching options:", error);
        setError("Failed to fetch options");
      } else if (data && data.length > 0) {
        // Assuming report_name is a JSON string representing an array of options
        try {
          const parsedArray = JSON.parse(data[0].report_name) as Option[];
          setOptions(parsedArray);
          if (parsedArray.length > 0) {
            setSelected(parsedArray[0].value);
          }
        } catch (err) {
          console.error("Failed to parse report_name JSON", err);
          setError("Invalid report_name data format");
        }
      }
    };

    fetchOptions();
  }, [supabase]);

  const GetData = async () => {
    setLoading(true);
    setMessage("");

    // Optional: Use selectedDateFrom and selectedDateTo for filtering if needed

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const { data, error } = await supabase.from(selected).select("*");

    if (error) {
      alert("Select failed.");
      setError(error.message);
    } else if (data) {
      setDataf(data);
      setMessage(`Loaded ${data.length} rows`);
    }
    setLoading(false);
  };

  const handleExport = () => {
    if (dataf.length === 0) return;

    const escapeCSV = (value: any): string => {
      if (typeof value === "string") {
        value = value.replace(/"/g, '""');
        if (value.search(/("|,|\n)/g) >= 0) {
          value = `"${value}"`;
        }
        return value;
      }
      if (value === null || value === undefined) return "";
      return String(value);
    };

    const headers = Object.keys(dataf[0]);
    const rows = dataf.map((obj) => headers.map((key) => escapeCSV(obj[key])).join(","));
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = selected + ".csv";
    link.click();
  };

  return (
    <div style={{ textAlign: "center" }}>
      {options.map((opt) => (
        <label key={opt.id ?? opt.value} className={`radio-label ${selected === opt.value ? "selected" : ""}`}>
          <input
            type="radio"
            name="dynamicRadio"
            value={opt.value}
            checked={selected === opt.value}
            onChange={() => setSelected(opt.value)}
          />
          {opt.label}
        </label>
      ))}

      <div className="datepicker-wrapper">
        <DatePicker
          selected={selectedDateFrom}
          onChange={(date) => setSelectedDateFrom(date)}
          dateFormat="MMMM d, yyyy"
          placeholderText="From date"
        />

        <DatePicker
          selected={selectedDateTo}
          onChange={(date) => setSelectedDateTo(date)}
          dateFormat="MMMM d, yyyy"
          placeholderText="To date"
        />
      </div>

      <button onClick={GetData} disabled={loading}>
        View Report
      </button>
      <button onClick={handleExport} disabled={dataf.length === 0}>
        Download CSV
      </button>

      {dataf.length > 0 && (
        <div className="reportTable">
          <h3>Parsed Data: {dataf.length} rows</h3>
          <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>{Object.keys(dataf[0]).map((key) => <th key={key}>{key}</th>)}</tr>
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
