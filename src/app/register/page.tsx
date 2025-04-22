"use client";
import { useRef } from "react";

const Page = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <form>
      <input placeholder="name" ref={nameRef} />
      <input placeholder="email" ref={emailRef} />
      <input placeholder="password" ref={passwordRef} />
      <button
        onClick={async (e) => {
          e.preventDefault();
          const name = nameRef.current?.value;
          const email = emailRef.current?.value;
          const password = passwordRef.current?.value;

          const res = await fetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
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
