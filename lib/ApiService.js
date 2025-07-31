import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);



// class ApiService {
//   constructor(baseUrl, apiKey, bearerToken) {
//     this.baseUrl = baseUrl;
//     this.apiKey = apiKey;
//     this.bearerToken = bearerToken;
//   }



//   async get(endpoint) {
//     try {
//       const res = await fetch(`${this.baseUrl}${endpoint}`, {
//         headers: {
//           'apikey': this.apiKey,
//           'Authorization': `Bearer ${this.bearerToken}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!res.ok) {
//         throw new Error(`Error: ${res.status}`);
//       }

//       return await res.json();
//     } catch (err) {
//       throw err;
//     }
//   }
// }

// export default ApiService;