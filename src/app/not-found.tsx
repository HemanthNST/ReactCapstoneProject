"use client";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-9xl text-[#D71921]">404</h1>
      <h4 className="text-5xl">steps not found</h4>

      <Link
        href="/"
        className={`m-5 border-1 border-white rounded-full px-20 py-6 cursor-pointer hover:bg-white hover:text-black transition-colors duration-200 ease-in-out text-center`}
      >
        REDIRECT TO HOME
      </Link>
    </div>
  );
};

export default NotFound;
