"use client";
import { useRef } from "react";

const Page = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <form>
      <input placeholder="email" ref={emailRef} />
      <input placeholder="password" ref={passwordRef} />
      <button
        onClick={async (e) => {
          e.preventDefault();
          const email = emailRef.current?.value;
          const password = passwordRef.current?.value;

          const res = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
              "Content-Type": "application/json",
              include: "credentials",
            },
          });

          const data = await res.json();
          console.log(data);
        }}
      >
        Click Me
      </button>
    </form>
  );
};

export default Page;
