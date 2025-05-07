"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Instrument_Sans } from "next/font/google";

const InstrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const Page = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <form className="flex flex-col items-center justify-center h-screen">
        <div
          style={{
            padding: "550px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
          className="w-full"
        >
          <h1 className="text-2xl font-bold m-2">WELCOME BACK</h1>
          <div className="flex flex-col gap-0 w-full">
            <div className="flex gap-4 bg-[#1A1A1A] rounded-t-4xl py-8 px-16 w-full">
              <Image
                src="/icons/emailPixel.svg"
                alt="email icon"
                width={24}
                height={24}
              />
              <input
                placeholder="Enter your email"
                ref={emailRef}
                className="outline-none w-full"
              />
            </div>
            <div className="flex gap-4 bg-[#282828] rounded-b-4xl py-8 px-16 w-full">
              <Image
                src="/icons/passwordPixel.svg"
                alt="email icon"
                width={24}
                height={24}
              />
              <input
                placeholder="Enter your password"
                type="password"
                ref={passwordRef}
                className="outline-none w-full"
              />
            </div>
          </div>
          <div className="flex w-full gap-12">
            <Link
              href="/register"
              className={`w-full border-1 border-white rounded-full py-6 cursor-pointer hover:bg-white hover:text-black transition-colors duration-200 ease-in-out text-center ${InstrumentSans.className}`}
            >
              REGISTER INSTEAD?
            </Link>
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
              className={`w-full bg-[#D71921] rounded-full py-6 cursor-pointer hover:opacity-70 transition-opacity duration-200 ease-in-out ${InstrumentSans.className}`}
            >
              STEP FORWARD
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default Page;
