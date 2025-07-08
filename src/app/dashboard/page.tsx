"use client";
import { useEffect, useState } from "react";
import { Instrument_Sans } from "next/font/google";

const InstrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface StepData {
  date: string;
  steps: number;
}

interface UserData {
  totalSteps: number;
  dailySteps: StepData[];
  connected: boolean;
  message?: string;
  dailyStepsGoal?: number;
}

const Dashboard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
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
      console.log("Google Fit connected successfully!");
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorParam) {
      console.error("Google Fit connection error:", errorParam);
      setError(`Connection error: ${errorParam}`);
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchStepData = async () => {
    console.log("🔄 Refresh Data button clicked - fetching step data...");
    try {
      setLoading(true);
      const res = await fetch("/api/fitness/steps-simple");

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Step data received from API:", data);
        setUserData(data);
      } else {
        const errorData = await res.json();
        console.error("❌ API error response:", errorData);
        setError(errorData.error);
      }
    } catch (error) {
      console.error("❌ Failed to fetch step data:", error);
      setError("Failed to fetch step data");
    } finally {
      setLoading(false);
      console.log("✅ Fetch step data completed");
    }
  };

  const calculateStreak = (dailySteps: StepData[], goal: number): number => {
    // Sort steps by date (most recent first)
    const sortedSteps = [...dailySteps].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
    window.location.href = "/api/auth/google";
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
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
              className={`bg-[#D71921] text-white px-8 py-4 rounded-full hover:opacity-70 transition-opacity ${InstrumentSans.className}`}>
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
              className={`mt-4 bg-[#D71921] text-white px-8 py-4 rounded-full hover:opacity-70 transition-opacity ${InstrumentSans.className}`}>
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
                className={`bg-[#D71921] text-white px-8 py-4 rounded-full hover:opacity-70 transition-opacity ${InstrumentSans.className}`}>
                REFRESH DATA
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Total Steps Card */}
              <div className="bg-[#1A1A1A] rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Total Steps (Last 7 Days)
                </h2>
                <div className="text-6xl font-bold text-[#D71921] mb-2">
                  {userData.totalSteps.toLocaleString()}
                </div>
                <p className="text-gray-400">Keep stepping forward!</p>
              </div>

              {/* Streak Card */}
              <div className="bg-[#1A1A1A] rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">🔥 Current Streak</h2>
                {(() => {
                  const goal = 10000; // Hardcoded goal for streaks
                  const streak = calculateStreak(userData.dailySteps, goal);
                  return (
                    <div>
                      <div className="text-6xl font-bold text-[#FF6B35] mb-2">
                        {streak}
                      </div>
                      <p className="text-gray-400 mb-2">
                        {streak === 1 ? "day" : "days"} hitting{" "}
                        {goal.toLocaleString()}+ steps
                      </p>
                      {streak > 0 ? (
                        <p className="text-[#FF6B35] text-sm">
                          🎉 Keep the momentum going!
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Get {goal.toLocaleString()}+ steps today to start your
                          streak!
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Daily Steps */}
              <div className="bg-[#1A1A1A] rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Daily Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData.dailySteps.map(day => {
                    const goal = 10000; // Hardcoded goal
                    const metGoal = day.steps >= goal;

                    return (
                      <div
                        key={day.date}
                        className="bg-[#282828] rounded-lg p-6 text-center relative">
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
                        <div className="text-sm text-gray-400 mb-2">steps</div>
                        {/* Goal achievement indicator */}
                        {metGoal && (
                          <div className="absolute top-2 right-2">
                            <span className="text-[#FF6B35] text-lg">🔥</span>
                          </div>
                        )}

                        <div
                          className={`text-xs mt-2 ${
                            metGoal ? "text-[#FF6B35]" : "text-gray-500"
                          }`}>
                          {metGoal
                            ? `${goal.toLocaleString()}+ achieved!`
                            : `${(goal - day.steps).toLocaleString()} to goal`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={fetchStepData}
                  className={`bg-[#282828] text-white px-6 py-3 rounded-full hover:bg-[#3A3A3A] transition-colors ${InstrumentSans.className}`}>
                  REFRESH DATA
                </button>
                <button
                  onClick={connectGoogleFit}
                  className={`bg-[#D71921] text-white px-6 py-3 rounded-full hover:opacity-70 transition-opacity ${InstrumentSans.className}`}>
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

export default Dashboard;
