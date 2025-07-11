import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="absolute top-5 px-24 lg:px-48 w-full">
      <div className="bg-[#181818] px-15 h-24 w-full flex justify-between rounded-full">
        <Link href="/" className="flex items-center gap-5">
          <Image src="/logo.svg" width={43} height={38} alt="Logo" />
        </Link>
        <div className="flex items-center gap-5 lg:gap-9 text-xl lg:text-2xl font-['5by7']">
          <Link href="/about">about</Link>
          <Link href="/steps">steps</Link>
          <Link href="/profile">profile</Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
