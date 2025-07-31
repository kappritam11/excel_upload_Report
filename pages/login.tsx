import { signIn, useSession } from "next-auth/react";
import { useState, ChangeEvent, FormEvent, useEffect, JSX } from "react";
import { useRouter } from "next/router";
import '../styles/Backend.css';

interface UserInfo {
  username: string;
  password: string;
}

export default function LoginPage(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({ username: "", password: "" });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      username: userInfo.username,
      password: userInfo.password,
    });

    if (res?.error) {
      setError("Invalid username or password");
    } else {
      setError(null);
      router.push("/upload");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          required
          name="username"
          placeholder="Username"
          value={userInfo.username}
          onChange={handleChange}
          style={{ width: "95%", marginBottom: 10, padding: 8 }}
        />
        <input
          required
          name="password"
          type="password"
          placeholder="Password"
          value={userInfo.password}
          onChange={handleChange}
          style={{ width: "95%", marginBottom: 10, padding: 8 }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ width: "100%" }}>
          Login
        </button>
      </form>
    </div>
  );
}
