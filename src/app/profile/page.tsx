"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { notyf } from "@/lib/notyf";

interface UserProfile {
  name: string;
  email: string;
  totalSteps: number;
  dailyStepsGoal: number;
  joinDate: string;
  connected: boolean;
  profilePicture?: string;
}

const Profile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [uploadingPicture, setUploadingPicture] = useState(false);

  useEffect(() => {
    // Verify user session and fetch profile data
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/verify");
        if (res.ok) {
          const userData = await res.json();

          // Fetch additional profile data
          const stepsRes = await fetch("/api/fitness/steps");
          let stepsData = {
            totalSteps: 0,
            dailyStepsGoal: 10000,
            connected: false,
          };

          if (stepsRes.ok) {
            stepsData = await stepsRes.json();
          }

          setUserProfile({
            name: userData.name,
            email: userData.email,
            totalSteps: stepsData.totalSteps || 0,
            dailyStepsGoal: stepsData.dailyStepsGoal || 10000,
            joinDate: userData.createdAt || new Date().toISOString(),
            connected: stepsData.connected || false,
            profilePicture: userData.profilePicture || null,
          });
          setNewGoal(String(stepsData.dailyStepsGoal || 10000));
          setNewName(userData.name);
        } else {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateGoal = async () => {
    if (!newGoal || isNaN(Number(newGoal))) {
      notyf.error("Please enter a valid goal number");
      return;
    }

    try {
      const res = await fetch("/api/user/goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal: Number(newGoal) }),
      });

      if (res.ok) {
        setUserProfile(prev =>
          prev ? { ...prev, dailyStepsGoal: Number(newGoal) } : null
        );
        setEditing(false);
        notyf.success("Daily goal updated successfully!");
      } else {
        notyf.error("Failed to update goal");
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      notyf.error("Failed to update goal");
    }
  };

  const handleUpdateName = async () => {
    if (!newName || newName.trim().length < 1) {
      notyf.error("Please enter a valid name");
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (res.ok) {
        setUserProfile(prev =>
          prev ? { ...prev, name: newName.trim() } : null
        );
        setEditingName(false);
        notyf.success("Name updated successfully!");
      } else {
        notyf.error("Failed to update name");
      }
    } catch (error) {
      console.error("Error updating name:", error);
      notyf.error("Failed to update name");
    }
  };

  const handleUploadPicture = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    setUploadingPicture(true);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await fetch("/api/user/profile-picture", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUserProfile(prev =>
          prev ? { ...prev, profilePicture: data.profilePicture } : null
        );
        notyf.success("Profile picture updated successfully!");
      } else {
        notyf.error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      notyf.error("Failed to upload profile picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleConnectFitness = () => {
    window.location.href = "/api/auth/google";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D71921] mx-auto mb-4"></div>
          <p className="text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500">Failed to load profile</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#D71921] text-white rounded-lg hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-['5by7']">
      <NavBar />

      <div className="pt-32 px-8 lg:px-24 max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-[#D71921] to-red-700 rounded-full flex items-center justify-center overflow-hidden">
              {userProfile.profilePicture ? (
                <Image
                  src={userProfile.profilePicture}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Upload button overlay */}
            <label className="absolute inset-0 w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadPicture}
                className="hidden"
                disabled={uploadingPicture}
              />
              {uploadingPicture ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
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
              )}
            </label>
          </div>

          {editingName ? (
            <div className="flex items-center justify-center gap-4 mb-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="bg-black border border-gray-600 rounded-lg px-4 py-2 text-2xl font-bold text-center text-white max-w-xs"
                placeholder="Enter your name"
                autoFocus
              />
              <button
                onClick={handleUpdateName}
                className="px-4 py-2 bg-[#D71921] text-white rounded-lg hover:bg-red-700 transition-colors">
                Save
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNewName(userProfile.name);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="text-4xl lg:text-5xl font-bold">
                {userProfile.name}
              </h1>
              <button
                onClick={() => setEditingName(true)}
                className="p-2 text-gray-400 hover:text-[#D71921] transition-colors"
                title="Edit name">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          )}

          <p className="text-gray-400 text-lg">{userProfile.email}</p>
          <p className="text-gray-500 text-sm mt-2">
            Member since {formatDate(userProfile.joinDate)}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4 text-[#D71921]">
              Total Steps
            </h3>
            <p className="text-3xl font-bold mb-2">
              {userProfile.totalSteps.toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm">All time steps tracked</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4 text-[#D71921]">
              Daily Goal
            </h3>
            <div className="flex items-center justify-between">
              {editing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    value={newGoal}
                    onChange={e => setNewGoal(e.target.value)}
                    className="bg-black border border-gray-600 rounded-lg px-3 py-2 text-white flex-1"
                    placeholder="Enter daily goal"
                  />
                  <button
                    onClick={handleUpdateGoal}
                    className="px-4 py-2 bg-[#D71921] text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setNewGoal(String(userProfile.dailyStepsGoal));
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-3xl font-bold mb-2">
                      {userProfile.dailyStepsGoal.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">Steps per day</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-[#D71921] text-white rounded-lg hover:bg-red-700 transition-colors">
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fitness Connection Status */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 mb-12">
          <h3 className="text-xl font-bold mb-4 text-[#D71921]">
            Fitness Tracking
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold mb-2">
                Google Fit Connection
              </p>
              <p className="text-gray-400">
                {userProfile.connected
                  ? "Connected and syncing step data"
                  : "Connect to start tracking your steps automatically"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  userProfile.connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span
                className={`font-semibold ${
                  userProfile.connected ? "text-green-500" : "text-red-500"
                }`}>
                {userProfile.connected ? "Connected" : "Disconnected"}
              </span>
              {!userProfile.connected && (
                <button
                  onClick={handleConnectFitness}
                  className="px-4 py-2 bg-[#D71921] text-white rounded-lg hover:bg-red-700 transition-colors">
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 mb-12">
          <h3 className="text-xl font-bold mb-4 text-[#D71921]">
            Account Actions
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => (window.location.href = "/steps")}
              className="w-full text-left px-4 py-3 bg-black border border-gray-600 rounded-lg hover:border-[#D71921] transition-colors">
              <span className="font-semibold">View Step Data</span>
              <p className="text-gray-400 text-sm">
                Check your daily steps and progress
              </p>
            </button>

            <button
              onClick={() => {
                if (confirm("Are you sure you want to sign out?")) {
                  window.location.href = "/login";
                }
              }}
              className="w-full text-left px-4 py-3 bg-black border border-red-600 rounded-lg hover:border-red-500 transition-colors text-red-400">
              <span className="font-semibold">Sign Out</span>
              <p className="text-gray-400 text-sm">
                Sign out of your Steppy account
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
