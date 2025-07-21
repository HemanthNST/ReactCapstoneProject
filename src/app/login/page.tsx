"use client";
import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notyf } from "@/lib/notyf";
import { redirectIfAuthenticated } from "@/lib/auth";

const Page = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Check for URL parameters to show notifications
  useEffect(() => {
    // Check if user is authenticated and redirect to steps page
    redirectIfAuthenticated();

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      switch (error) {
        case "google_auth_failed":
          notyf.error("Google authentication failed. Please try again.");
          break;
        case "session_required":
          notyf.error("Please log in to connect Google Fit.");
          break;
        case "invalid_session":
          notyf.error("Your session has expired. Please log in again.");
          break;
        case "code_expired":
          notyf.error(
            "Authorization code expired. Please try connecting Google Fit again."
          );
          break;
        default:
          notyf.error("An error occurred. Please try again.");
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <>
      <form className="flex flex-col items-center justify-center min-h-screen font-['5by7'] px-4 md:px-8 lg:px-12 py-20 md:py-24">
        <div className="w-full max-w-md mx-auto flex flex-col gap-4 md:gap-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center font-['5by7B'] mb-4">
            WELCOME BACK
          </h1>
          <div className="flex flex-col gap-0 w-full">
            <div className="flex gap-3 md:gap-4 bg-[#1A1A1A] rounded-t-lg md:rounded-t-2xl py-4 md:py-6 lg:py-8 px-4 md:px-8 lg:px-16 w-full">
              <Image
                src="/icons/emailPixel.svg"
                alt="email icon"
                width={24}
                height={24}
                className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
              />
              <input
                placeholder="Enter your email"
                ref={emailRef}
                className="outline-none instru w-full bg-transparent text-white placeholder-gray-400 text-sm md:text-base"
              />
            </div>
            <div className="flex gap-3 md:gap-4 bg-[#282828] rounded-b-lg md:rounded-b-2xl py-4 md:py-6 lg:py-8 px-4 md:px-8 lg:px-16 w-full">
              <Image
                src="/icons/passwordPixel.svg"
                alt="password icon"
                width={24}
                height={24}
                className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
              />
              <input
                placeholder="Enter your password"
                type="password"
                ref={passwordRef}
                className="outline-none instru w-full bg-transparent text-white placeholder-gray-400 text-sm md:text-base"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row w-full gap-4 md:gap-6 mt-4">
            <Link
              href="/register"
              className="w-full border border-white rounded-full py-3 md:py-4 lg:py-6 cursor-pointer hover:bg-white hover:text-black transition-colors duration-200 ease-in-out text-center font-['5by7B'] text-sm md:text-base">
              REGISTER INSTEAD?
            </Link>
            <button
              onClick={async e => {
                e.preventDefault();
                const email = emailRef.current?.value;
                const password = passwordRef.current?.value;

                // Validate inputs
                if (!email || !password) {
                  notyf.error("Please enter both email and password.");
                  return;
                }

                if (!email.includes("@")) {
                  notyf.error("Please enter a valid email address.");
                  return;
                }

                try {
                  notyf.open({
                    type: "info",
                    message: "Signing in...",
                  });

                  const res = await fetch("/api/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ email, password }),
                    headers: {
                      "Content-Type": "application/json",
                      include: "credentials",
                    },
                  });

                  const data = await res.json();

                  if (res.ok) {
                    notyf.success("Welcome back! Redirecting to dashboard...");
                    setTimeout(() => {
                      window.location.href = "/steps";
                    }, 1000);
                  } else {
                    // Handle specific error cases
                    if (res.status === 401) {
                      notyf.error(
                        "Invalid email or password. Please try again."
                      );
                    } else if (res.status === 404) {
                      notyf.error(
                        "Account not found. Please check your email or register."
                      );
                    } else {
                      notyf.error(
                        data.error || "Login failed. Please try again."
                      );
                    }
                  }
                } catch (error) {
                  console.error("Login error:", error);
                  notyf.error(
                    "Network error. Please check your connection and try again."
                  );
                }
              }}
              className="w-full bg-[#D71921] rounded-full py-3 md:py-4 lg:py-6 cursor-pointer hover:opacity-70 transition-opacity duration-200 ease-in-out font-['5by7B'] text-sm md:text-base">
              STEP FORWARD
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default Page;
