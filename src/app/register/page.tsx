"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notyf } from "@/lib/notyf";

const Page = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );

  const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      notyf.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      notyf.error("File size must be less than 5MB");
      return;
    }

    setProfilePictureFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = e => {
      setProfilePicture(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <form className="flex flex-col items-center justify-center h-screen font-['5by7']">
        <div
          style={{
            padding: "550px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
          className="w-full">
          <h1 className="text-2xl font-bold mb-0 ml-0 m-2 font-['5by7B']">
            WELCOME TO STEPPY
          </h1>
          <h1 className="text-xl font-bold tracking-wider font-['5by7B']">
            let&#39;s create your profile
          </h1>

          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-[#D71921] to-red-700 rounded-full flex items-center justify-center overflow-hidden mb-4">
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt="Profile Preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <label className="absolute inset-0 w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  className="hidden"
                />
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
            </div>
            <p className="text-sm text-gray-400">
              Add a profile picture (optional)
            </p>
          </div>

          <div className="flex flex-col gap-0 w-full">
            <div className="flex gap-4 bg-[#1A1A1A] rounded-t-4xl py-8 px-16 w-full">
              <Image
                src="/icons/emailPixel.svg"
                alt="email icon"
                width={24}
                height={24}
              />
              <input
                placeholder="Enter your name"
                ref={nameRef}
                className="outline-none w-full"
              />
            </div>
            <div className="flex gap-4 bg-[#282828] py-8 px-16 w-full">
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
            <div className="flex gap-4 bg-[#1A1A1A] py-8 px-16 w-full">
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
            <div className="flex gap-4 bg-[#282828] rounded-b-4xl py-8 px-16 w-full">
              <Image
                src="/icons/passwordPixel.svg"
                alt="email icon"
                width={24}
                height={24}
              />
              <input
                placeholder="Confirm your password"
                type="password"
                ref={confirmPasswordRef}
                className="outline-none w-full"
              />
            </div>
          </div>
          <div className="flex w-full gap-12">
            <Link
              href="/login"
              className="w-full border-1 border-white rounded-full py-6 cursor-pointer hover:bg-white hover:text-black transition-colors duration-200 ease-in-out text-center font-['5by7B']">
              LOGIN INSTEAD?
            </Link>
            <button
              onClick={async e => {
                e.preventDefault();
                const name = nameRef.current?.value;
                const email = emailRef.current?.value;
                const password = passwordRef.current?.value;
                const confirmPassword = confirmPasswordRef.current?.value;

                // Validate inputs
                if (!name || !email || !password || !confirmPassword) {
                  notyf.error("Please fill in all fields.");
                  return;
                }

                if (!email.includes("@")) {
                  notyf.error("Please enter a valid email address.");
                  return;
                }

                if (password.length < 6) {
                  notyf.error("Password must be at least 6 characters long.");
                  return;
                }

                if (password !== confirmPassword) {
                  notyf.error(
                    "Passwords don't match! Please check and try again."
                  );
                  return;
                }

                try {
                  notyf.open({
                    type: "info",
                    message: "Creating your account...",
                  });

                  const res = await fetch("/api/auth/register", {
                    method: "POST",
                    body: JSON.stringify({ name, email, password }),
                    headers: {
                      "Content-Type": "application/json",
                      include: "credentials",
                    },
                  });

                  const data = await res.json();

                  if (res.ok) {
                    notyf.success(
                      "Account created successfully! Welcome to Steppy!"
                    );

                    // Upload profile picture if one was selected
                    if (profilePictureFile) {
                      try {
                        const formData = new FormData();
                        formData.append("profilePicture", profilePictureFile);

                        await fetch("/api/user/profile-picture", {
                          method: "POST",
                          body: formData,
                        });
                      } catch (error) {
                        console.error("Profile picture upload failed:", error);
                        // Don't show error to user since registration was successful
                      }
                    }

                    setTimeout(() => {
                      window.location.href = "/steps";
                    }, 1000);
                  } else {
                    // Handle specific error cases
                    if (res.status === 409) {
                      notyf.error(
                        "An account with this email already exists. Please try logging in instead."
                      );
                    } else if (res.status === 400) {
                      notyf.error(
                        data.error ||
                          "Invalid registration data. Please check your inputs."
                      );
                    } else {
                      notyf.error(
                        data.error || "Registration failed. Please try again."
                      );
                    }
                  }
                } catch (error) {
                  console.error("Registration error:", error);
                  notyf.error(
                    "Network error. Please check your connection and try again."
                  );
                }
              }}
              className="w-full bg-[#D71921] rounded-full py-6 cursor-pointer hover:opacity-70 transition-opacity duration-200 ease-in-out font-['5by7B']">
              STEP FORWARD
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default Page;
