/**
 * Landing Page - TWA E-Library
 * Main entry point with login and registration options
 */

import Link from "next/link"
import { BookOpen, Library, Users, Clock, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-2">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left space-y-6 sm:space-y-8">
            <div className="inline-block">
              <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Welcome to Digital Library
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              Your Gateway to
              <span className="text-primary block mt-2">Knowledge & Learning</span>
            </h1>
            
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
            <div className="grid grid-cols-3 gap-4 pt-8 max-w-lg mx-auto lg:mx-0">
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
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 p-8 backdrop-blur-sm border border-primary/20">
              <div className="aspect-square rounded-xl bg-white/50 dark:bg-gray-800/50 p-8 flex items-center justify-center">
                <Library className="h-48 w-48 text-primary animate-pulse" />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-bounce">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-bounce delay-100">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
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
          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
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

          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
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

          <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <Card className="bg-gradient-to-r from-primary to-indigo-600 border-0 text-white">
          <CardContent className="p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Join hundreds of students already using our digital library platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8 py-6">
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-2 border-white text-black hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} TWA E-Library. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
