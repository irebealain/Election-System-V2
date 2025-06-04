import { Link } from "react-router-dom"
import Button from "../components/common/Button"
import ModeToggle from "../components/common/ModeToggle"

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full transition-all duration-200 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold font-satoshi">ElectSys</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent">
                Home
              </Link>
              <Link to="/about" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent">
                About Us
              </Link>
              <Link to="/contact" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <ModeToggle />
              <div className="hidden md:block">
                <Button asChild variant="outline" className="mr-2">
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/login">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-28 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold font-satoshi tracking-tight">
                  Modern Election System for Modern Institutions
                </h1>
                <p className="text-lg text-muted-foreground">
                  A secure, transparent, and efficient way to conduct elections in your institution.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link to="/login">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="#features">Learn More</a>
                  </Button>
                </div>
              </div>
              <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                <img src="/placeholder.svg" alt="Election System" className="object-cover w-full h-full rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/50">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-satoshi">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                title="Secure Voting"
                description="End-to-end encryption and authentication ensures your votes are secure and private."
                icon="🔒"
              />
              <FeatureCard
                title="Real-time Results"
                description="View election results in real-time with beautiful, interactive charts and visualizations."
                icon="📊"
              />
              <FeatureCard
                title="Multi-level Access"
                description="Different access levels for students, administrators, and super administrators."
                icon="👥"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 font-satoshi">Election System</h3>
              <p className="text-gray-300">Modern, secure, and efficient election management for institutions.</p>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4 font-satoshi">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4 font-satoshi">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/faq" className="text-gray-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-gray-300 hover:text-white">
                    Support
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-300 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4 font-satoshi">Contact Us</h4>
              <p className="text-gray-300">info@electionsystem.com</p>
              <p className="text-gray-300">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} Election System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-background rounded-lg p-6 shadow-sm border">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-medium mb-2 font-satoshi">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

export default HomePage
