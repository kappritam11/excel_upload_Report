import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

// Define your environment variables with fallbacks or strict checks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const customBearerToken = process.env.NEXT_PUBLIC_API_Bearer || "";
const jwtSecret = process.env.JWT_SECRET || "553BB732-2B9C-40FE-8959-3734203DF189";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      Authorization: `Bearer ${customBearerToken}`,
    },
  },
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "user" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const { data, error } = await supabase
          .from("tbl_user_login")
          .select("id, user_name")
          .eq("user_name", credentials.username)
          .eq("password", credentials.password) // ⚠️ This is for example only; use hashed passwords in production!
          .single();

        if (error || !data) {
          return null;
        }

        // Return user object (required: `id`)
        return {
          id: data.id.toString(),
          name: data.user_name,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 10*60, 
  },

  jwt: {
    secret: jwtSecret,
    maxAge: 10*60,
  },

  pages: {
    signIn: "/login", // Custom login page
  },
};

export default NextAuth(authOptions);
