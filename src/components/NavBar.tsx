import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="absolute top-3 md:top-5 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-48 w-full z-10">
      <div className="bg-[#181818] px-4 sm:px-6 md:px-8 lg:px-15 h-16 sm:h-20 md:h-24 w-full flex justify-between items-center rounded-full">
        <Link href="/" className="flex items-center gap-3 md:gap-5">
          <Image 
            src="/logo.svg" 
            width={43} 
            height={38} 
            alt="Logo"
            className="w-8 h-7 sm:w-10 sm:h-9 md:w-11 md:h-10 lg:w-12 lg:h-11"
          />
        </Link>
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-9 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-['5by7']">
          <Link href="/about" className="hover:opacity-70 transition-opacity duration-200">
            about
          </Link>
          <Link href="/steps" className="hover:opacity-70 transition-opacity duration-200">
            steps
          </Link>
          <Link href="/profile" className="hover:opacity-70 transition-opacity duration-200">
            profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
