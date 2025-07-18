"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/auth";

const Home = () => {
  useEffect(() => {
    // Check if user is authenticated and redirect to steps page
    redirectIfAuthenticated();
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen gap-8 md:gap-16 lg:gap-32 xl:gap-48 px-4 md:px-8 lg:px-12 py-8 font-['5by7']">
      <div className="flex flex-col gap-6 md:gap-8 lg:gap-12 text-center lg:text-left">
        <div className="flex justify-center lg:justify-start">
          <Image
            src="/steppy.svg"
            alt="Dotted Footsteps"
            width={180}
            height={180}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-60 lg:h-60"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl tracking-widest font-['5by7B'] leading-tight">
          EVERY STEP
          <br />
          MATTERS
        </h1>
        <Link
          href="/login"
          className="w-full max-w-xs mx-auto lg:mx-0 text-center font-bold bg-[#D71921] rounded-full py-4 md:py-6 px-6 cursor-pointer hover:opacity-70 transition-opacity duration-200 ease-in-out font-['5by7B'] text-sm sm:text-base"
        >
          START TRACKING
        </Link>
      </div>
      <div className="hidden md:block flex-shrink-0">
        <Image
          src="/home-page.png"
          alt="Hero Image"
          width={774}
          height={623}
          className="w-64 h-auto sm:w-80 md:w-96 lg:w-[500px] xl:w-[774px] max-w-full"
        />
      </div>
    </div>
  );
};

export default Home;
