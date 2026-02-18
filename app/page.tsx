/**
 * Landing Page - TWA E-Library
 * Main entry point with login and registration options
 */

import Link from "next/link"
import Image from "next/image"
import { BookOpen, Users, Clock, Shield } from "lucide-react"
import VerticalTicker from '@/components/VerticalTicker'
import MotionWrapper from '@/components/MotionWrapper'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 sticky top-0 z-50">
        <MotionWrapper className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/digital-library-seal.png" alt="TWA Seal" width={48} height={48} className="rounded-full object-cover w-12 h-12" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                TWA E-Library
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="shadow-md hover:shadow-lg transition-shadow">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </MotionWrapper>
      </nav>

      {/* Hero Section */}
      <section className="w-full relative overflow-hidden py-12 sm:py-20 lg:py-28">
        {/* Background photo (grayscale, low opacity) */}
        <div
          aria-hidden
          style={{ backgroundImage: `url('/library.jpg')` }}
          className="absolute inset-0 bg-center bg-cover filter grayscale opacity-20 z-0"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <MotionWrapper className="relative z-20 text-center md:-mt-30 lg:text-left space-y-6 sm:space-y-8">
            <div className="inline-block">
              <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Welcome to Digital Library
              </span>
            </div>
            
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                  Your Gateway to
                  <VerticalTicker />
                </h1>

            {/* Mobile student image shown directly under the heading on small screens */}
            <div className="lg:hidden mt-6 flex justify-center">
              <Image
                src="/student-model.png"
                alt="Student holding books"
                width={600}
                height={600}
                className="w-full max-w-xs h-auto object-contain"
                priority
              />
            </div>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
              Access thousands of books, manage your borrowing, and explore a world of knowledge — all from one modern platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                  <Users className="mr-2 h-5 w-5" />
                  Register Now
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Shield className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <MotionWrapper className="grid grid-cols-3 gap-4 pt-8 max-w-lg mx-auto lg:mx-0" delay={0.08}>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary">1000+</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Books</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Students</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary">24/7</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Access</div>
              </div>
            </MotionWrapper>
          </MotionWrapper>

          {/* (Mobile image moved into the hero content so it appears immediately under the heading) */}

          {/* Hero Image/Illustration - student image displayed larger on wide screens */}
          <MotionWrapper className="relative hidden lg:flex items-center justify-center lg:justify-end lg:pr-8 z-20" delay={0.12}>
            {/* Decorative yellow circle behind the student image (large, solid) */}
            <div
              aria-hidden
              className="absolute -right-20 -bottom-40 -translate-y-1/2 translate-x-1/4 w-72 h-72 md:w-[750px] md:h-[750px] rounded-full bg-[#f7de85] z-10"
            />

            <div className="relative -right-20 -bottom-10  z-10 w-full max-w-[1000px] h-auto">
              <Image
                src="/student-model.png"
                alt="Student holding books"
                width={1000}
                height={1000}
                className="w-full max-w-[1000px] h-auto object-contain lg:scale-100 xl:scale-110 lg:-mr-8 relative z-10"
                priority
              />
            </div>
          </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Our Library?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Modern features designed to make your learning experience seamless and enjoyable
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Feature Cards */}
          <MotionWrapper delay={0.08}>
            <Card className="border-2 hover:border-yellow-300 transition-colors hover:bg-yellow-50 hover:shadow-lg">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Vast Collection
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access thousands of books across multiple categories and subjects
                </p>
              </CardContent>
            </Card>
          </MotionWrapper>

          <MotionWrapper delay={0.12}>
            <Card className="border-2 hover:border-yellow-300 transition-colors hover:bg-yellow-50 hover:shadow-lg">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Easy Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Track your borrowings, due dates, and history all in one place
                </p>
              </CardContent>
            </Card>
          </MotionWrapper>

          <MotionWrapper delay={0.16}>
            <Card className="border-2 hover:border-yellow-300 transition-colors hover:bg-yellow-50 hover:shadow-lg">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Secure & Reliable
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your data is protected with industry-standard security measures
                </p>
              </CardContent>
            </Card>
          </MotionWrapper>
        </div>
      </section>

      {/* (Removed CTA section as requested) */}

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} TWA E-Library. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
