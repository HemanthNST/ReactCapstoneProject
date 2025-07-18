"use client";
import { useEffect, useState } from "react";
import { notyf } from "@/lib/notyf";
import { redirectIfNotAuthenticated } from "@/lib/auth";
import Image from "next/image";

interface StepData {
  date: string;
  steps: number;
}

interface UserData {
  totalSteps: number;
  todaySteps: number;
  dailySteps: StepData[];
  connected: boolean;
  message?: string;
  dailyStepsGoal?: number;
}

const Steps = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [goal, setGoal] = useState<number>(10000); // Default goal

  useEffect(() => {
    // Check authentication and redirect if not authenticated
    redirectIfNotAuthenticated();

    // Verify user session
    const verifySession = async () => {
      try {
        const res = await fetch("/api/auth/verify");
        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.name });
        } else {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        window.location.href = "/login";
      }
    };

    verifySession();
  }, []);

  useEffect(() => {
    // Verify user session
    const goalSetter = async () => {
      try {
        const res = await fetch("/api/user/goal");
        if (res.ok) {
          const data = await res.json();
          setGoal(data.dailyStepsGoal);
        } else {
          setGoal(10000);
        }
      } catch (error) {
        console.error("Failed to fetch user goal:", error);
        setGoal(10000);
      }
    };

    goalSetter();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStepData();
    }
  }, [user]);

  useEffect(() => {
    // Check URL parameters for connection status
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get("connected");
    const errorParam = urlParams.get("error");

    if (connected === "true") {
      notyf.success("Google Fit connected successfully! 🎉");
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorParam) {
      console.error("Google Fit connection error:", errorParam);
      setError(`Connection error: ${errorParam}`);

      // Show specific error messages
      switch (errorParam) {
        case "google_auth_failed":
          notyf.error("Failed to connect Google Fit. Please try again.");
          break;
        case "code_expired":
          notyf.error("Authorization expired. Please try connecting again.");
          break;
        default:
          notyf.error(`Connection error: ${errorParam}`);
      }

      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchStepData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors

      notyf.open({
        type: "info",
        message: "Refreshing step data...",
      });

      const res = await fetch("/api/fitness/steps-simple");

      if (res.ok) {
        const data = await res.json();
        setUserData(data);

        if (data.message) {
          notyf.open({
            type: "warning",
            message: data.message,
          });
        } else {
          notyf.success("Step data refreshed successfully!");
        }
      } else {
        const errorData = await res.json();
        console.error("❌ API error response:", errorData);
        setError(errorData.error);

        if (res.status === 401) {
          notyf.error(
            "Google Fit token expired. Please reconnect your account.",
          );
        } else if (
          res.status === 400 &&
          errorData.error?.includes("not connected")
        ) {
          notyf.error(
            "Google Fit not connected. Please connect your account first.",
          );
        } else {
          notyf.error(
            errorData.error || "Failed to fetch step data. Please try again.",
          );
        }
      }
    } catch (error) {
      console.error("❌ Failed to fetch step data:", error);
      setError("Failed to fetch step data");
      notyf.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (dailySteps: StepData[], goal: number): number => {
    // Sort steps by date (most recent first)
    const sortedSteps = [...dailySteps].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let currentStreak = 0;

    for (const day of sortedSteps) {
      if (day.steps >= goal) {
        currentStreak++;
      } else {
        break; // Streak is broken
      }
    }

    return currentStreak;
  };

  const connectGoogleFit = () => {
    notyf.open({
      type: "info",
      message: "Redirecting to Google for authentication...",
    });
    setTimeout(() => {
      window.location.href = "/api/auth/google";
    }, 500);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 mt-32 font-['5by7'] w-full">
      <div className="mx-auto w-5/6 md:w-4/5 xl:w-3/5 h-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-['5by7B']">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl text-gray-400">
            Here&apos;s your step activity
          </p>
        </div>

        {error && error.includes("not connected") ? (
          <div className="bg-[#1A1A1A] rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Google Fit</h2>
            <p className="text-gray-400 mb-6">
              Connect your Google Fit account to start tracking your steps
            </p>
            <button
              onClick={connectGoogleFit}
              className="bg-[#D71921] text-white px-8 py-4 rounded-full hover:opacity-70 transition-opacity font-['5by7B']"
            >
              CONNECT GOOGLE FIT
            </button>
          </div>
        ) : loading ? (
          <div className="bg-[#1A1A1A] rounded-lg p-8 text-center">
            <div className="text-xl">Loading your step data...</div>
          </div>
        ) : error ? (
          <div className="bg-[#1A1A1A] rounded-lg p-8 text-center">
            <div className="text-red-400 text-xl">{error}</div>
            <button
              onClick={connectGoogleFit}
              className="mt-4 bg-[#D71921] text-white px-8 py-4 rounded-full hover:opacity-70 transition-opacity font-['5by7B']"
            >
              RECONNECT GOOGLE FIT
            </button>
          </div>
        ) : userData ? (
          // Check if we have a "no data" message
          userData.message ? (
            <div className="bg-[#1A1A1A] rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">📊 Step Data</h2>
              <p className="text-gray-400 text-xl mb-6">{userData.message}</p>
              <p className="text-gray-400 mb-6">
                Make sure you have step data in your Google Fit app and try
                refreshing.
              </p>
              <button
                onClick={fetchStepData}
                className="bg-[#D71921] text-white px-8 py-4 rounded-full hover:opacity-70 transition-opacity font-['5by7B']"
              >
                REFRESH DATA
              </button>
            </div>
          ) : (
            <div className="flex flex-col justify-center space-y-6 h-full">
              <div className="flex flex-col xl:flex-row gap-12 xl:gap-24 items-center h-full">
                <div className="flex flex-col lg:flex-row xl:flex-col gap-12">
                  {/* Total Steps Card */}
                  <div className="bg-[#1A1A1A] rounded-full text-center w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 flex flex-col gap-4 items-center justify-center">
                    <div className="flex justify-center lg:justify-start">
                      <Image
                        src="/steppy.svg"
                        alt="Dotted Footsteps"
                        width={180}
                        height={180}
                        className="w-36 h-36 lg:w-48 lg:h-48 -my-8 lg:-my-12"
                      />
                    </div>
                    <div className="text-4xl lg:text-6xl font-bold z-1 -mb-5">
                      {userData.todaySteps}
                    </div>
                  </div>

                  {/* Streak Card */}
                  <div className="bg-[#1A1A1A] rounded-full text-center w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 flex flex-col gap-4 items-center justify-center">
                    <div className="flex justify-center lg:justify-start">
                      <Image
                        src="/icons/fire.svg"
                        alt="Fire"
                        width={180}
                        height={180}
                        className="w-24 h-24"
                      />
                    </div>
                    {(() => {
                      const streak = calculateStreak(userData.dailySteps, goal);
                      return (
                        <div>
                          <div className="text-4xl lg:text-6xl font-bold z-1 -mb-5">
                            {streak}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Daily Steps */}
                <div className="bg-[#1A1A1A] rounded-4xl p-8 w-full">
                  <h2 className="text-xl md:text-2xl font-bold mb-6">Daily Breakdown</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userData.dailySteps.map((day) => {
                      const metGoal = day.steps >= goal;

                      return (
                        <div
                          key={day.date}
                          className="bg-[#282828] rounded-4xl p-6 text-center relative"
                        >
                          <div className="text-sm text-gray-400 mb-2">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-3xl font-bold text-white mb-1">
                            {day.steps.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-400 mb-2">
                            steps
                          </div>
                          {/* Goal achievement indicator */}
                          {metGoal && (
                            <div className="absolute top-2 right-2">
                              <span className="text-[#FF6B35] text-lg">🔥</span>
                            </div>
                          )}

                          <div
                            className={`text-xs mt-2 ${
                              metGoal ? "text-[#FF6B35]" : "text-gray-500"
                            }`}
                          >
                            {metGoal
                              ? `${goal.toLocaleString()}+ achieved!`
                              : `${(goal - day.steps).toLocaleString()} to goal`}
                          </div>
                        </div>
                      );
                    })}
                    <div className="bg-[#282828] rounded-4xl p-6 text-center relative">
                      <div className="text-sm text-gray-400 mb-2">
                        Total Steps
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">
                        {userData.totalSteps.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400 mb-2">steps</div>
                      <div className={`text-xs mt-2 text-gray-500`}>
                        taken in the last 8 days
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={fetchStepData}
                  className="bg-[#282828] text-white px-6 py-3 rounded-full hover:bg-[#3A3A3A] transition-colors font-['5by7B']"
                >
                  REFRESH DATA
                </button>
                <button
                  onClick={connectGoogleFit}
                  className="bg-[#D71921] text-white px-6 py-3 rounded-full hover:opacity-70 transition-opacity font-['5by7B']"
                >
                  RECONNECT GOOGLE FIT
                </button>
              </div>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default Steps;
