import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instrument_Sans } from "next/font/google";

const InstrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const Home = () => {
  return (
    <div className="flex items-center justify-center h-screen gap-48">
      <div className="flex flex-col gap-12">
        <Image
          src="/steppy.svg"
          alt="Dotted Footsteps"
          width={240}
          height={240}
        />
        <h1 className="text-4xl tracking-widest">
          EVERY STEP
          <br />
          MATTERS
        </h1>
        <Link
          href="/login"
          className={`w-full text-center font-bold bg-[#D71921] rounded-full py-6 cursor-pointer hover:opacity-70 transition-opacity duration-200 ease-in-out ${InstrumentSans.className}`}
        >
          START TRACKING
        </Link>
      </div>
      <Image src="/home-page.png" alt="Hero Image" width={774} height={623} />
    </div>
  );
};

export default Home;
