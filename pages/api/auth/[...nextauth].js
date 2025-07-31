import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "user" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {

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
          const { data, error } = await supabase
          .from('tbl_user_login')
          .select('id')
          .eq('user_name', credentials.username)
          .eq('password', credentials.password) // Only for example; use Supabase Auth in real apps
          .single();
          if (error) {
          }else{
            return { id: 1, name: "User", username: "user" };
          }

        // // Simple hardcoded check — replace with your DB logic
        // if (credentials.username === "user" && credentials.password === "pass") {
        //   return { id: 1, name: "User", username: "user" };
        // }
        return null;
      },
    }),
  ],

  // Configure session behavior
  session: {
    strategy: "jwt",
    maxAge:5,
  },

  jwt: {
    secret: process.env.JWT_SECRET || "553BB732-2B9C-40FE-8959-3734203DF189",
    maxAge:5,
  },

  pages: {
    signIn: "/", // Use custom login page
  },
});
