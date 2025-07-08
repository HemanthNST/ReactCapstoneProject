import React from "react";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";

const About = () => {
  return (
    <div className="min-h-screen bg-black text-white font-['5by7']">
      <NavBar />

      <div className="pt-32 px-8 lg:px-24 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/steppy.svg"
              alt="Steppy Logo"
              width={120}
              height={120}
            />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 tracking-wide font-['5by7B']">
            ABOUT STEPPY
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your personal fitness companion that turns every step into progress
            towards a healthier you.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#D71921] font-['5by7B']">
              Our Mission
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              At Steppy, we believe that fitness starts with a single step. Our
              mission is to make health tracking simple, motivating, and
              accessible to everyone. We&apos;re here to help you build lasting
              habits that lead to a healthier lifestyle.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Whether you&apos;re just beginning your fitness journey or looking
              to maintain an active lifestyle, Steppy provides the tools and
              motivation you need to succeed.
            </p>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src="/steppy.svg"
              alt="Mission Illustration"
              width={300}
              height={300}
              className="opacity-80"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center font-['5by7B']">
            Why Choose Steppy?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#181818] p-8 rounded-2xl">
              <div className="text-[#D71921] text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-4">Track Your Progress</h3>
              <p className="text-gray-300">
                Monitor your daily steps, set personalized goals, and watch your
                progress over time with detailed analytics and insights.
              </p>
            </div>

            <div className="bg-[#181818] p-8 rounded-2xl">
              <div className="text-[#D71921] text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold mb-4">Google Fit Integration</h3>
              <p className="text-gray-300">
                Seamlessly connect with Google Fit to automatically sync your
                step data and maintain accurate tracking across all your
                devices.
              </p>
            </div>

            <div className="bg-[#181818] p-8 rounded-2xl">
              <div className="text-[#D71921] text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-4">Personalized Goals</h3>
              <p className="text-gray-300">
                Set custom daily step goals that match your fitness level and
                gradually increase them as you build stronger habits.
              </p>
            </div>

            <div className="bg-[#181818] p-8 rounded-2xl">
              <div className="text-[#D71921] text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-4">Simple Interface</h3>
              <p className="text-gray-300">
                Clean, intuitive design that makes tracking your steps
                effortless. Focus on your fitness, not figuring out the app.
              </p>
            </div>

            <div className="bg-[#181818] p-8 rounded-2xl">
              <div className="text-[#D71921] text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-4">Privacy First</h3>
              <p className="text-gray-300">
                Your health data is yours. We prioritize your privacy and
                security with industry-standard protection for all your
                information.
              </p>
            </div>

            <div className="bg-[#181818] p-8 rounded-2xl">
              <div className="text-[#D71921] text-4xl mb-4">💪</div>
              <h3 className="text-xl font-bold mb-4">Stay Motivated</h3>
              <p className="text-gray-300">
                Get motivated with progress visualization and achievement
                tracking that celebrates every milestone on your fitness
                journey.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            The Steppy Story
          </h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Steppy was born from a simple idea: fitness doesn&apos;t have to
              be complicated. We noticed that many fitness apps were
              overwhelming, packed with features that distracted from the core
              goal of staying active.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Our team of developers and fitness enthusiasts came together to
              create something different - a step tracker that&apos;s powerful
              yet simple, motivating without being pushy, and effective without
              being overwhelming.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Today, Steppy helps thousands of people take control of their
              health, one step at a time. Join our community and discover how
              small steps can lead to big changes.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already started their fitness
            journey with Steppy. Every step matters, and yours starts today.
          </p>
          <Link
            href="/register"
            className="inline-block px-12 py-4 text-lg font-bold bg-[#D71921] rounded-full cursor-pointer hover:opacity-70 transition-opacity duration-200 ease-in-out font-['5by7B']">
            GET STARTED TODAY
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
