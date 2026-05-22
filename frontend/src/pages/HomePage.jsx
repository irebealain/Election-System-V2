import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import logo from "../assets/Logo.svg"
import dashboardImg from "../assets/ElectionDashboard.png"
import {
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  BarChart3,
  Shield,
  Menu,
  X,
  Star,
  Sparkles,
  Vote,
  UserCheck,
  Eye,
} from "lucide-react"

export default function SchoolElectionLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0])
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const votingRef = useRef(null)

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" })
  const votingInView = useInView(votingRef, { once: true, margin: "-100px" })

  const handleScroll = () => {
    const scrollPosition = window.scrollY + 100

    const sections = [
      { id: "home", position: 0 },
      { id: "features", position: featuresRef.current?.offsetTop || 0 },
      { id: "how-it-works", position: howItWorksRef.current?.offsetTop || 0 },
      { id: "voting", position: votingRef.current?.offsetTop || 0 },
    ]

    const current = sections.reduce((acc, section) => {
      return scrollPosition >= section.position ? section.id : acc
    }, "home")

    setActiveSection(current)
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      })
    }
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Moving and rotating background shapes */}
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/4 -right-40 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/4 w-72 h-72 bg-emerald-300/25 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, -20, 0],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-orange-300/25 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -left-20 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl"
          animate={{
            y: [0, -40, 0],
            rotate: [0, 45, 90],
          }}
          transition={{
            duration: 9,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-10 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Animated Floating Stars Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
        <AnimatedStar className="top-20 left-10" delay={0} scrollY={y} />
        <AnimatedStar className="top-40 right-20" delay={2} scrollY={y} />
        <AnimatedStar className="top-60 left-1/4" delay={4} scrollY={y} />
        <AnimatedStar className="bottom-40 right-10" delay={1} scrollY={y} />
        <AnimatedStar className="bottom-60 left-20" delay={3} scrollY={y} />
        <AnimatedStar className="top-1/3 right-1/3" delay={5} scrollY={y} />
        <AnimatedStar className="top-1/2 left-10" delay={1.5} scrollY={y} />
        <AnimatedStar className="bottom-1/3 right-20" delay={3.5} scrollY={y} />
      </div>

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <motion.div className="flex-shrink-0" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                {/* <div className="h-10 w-10 bg-slate-900 rounded-[20px] flex items-center justify-center text-white font-bold text-lg">
                  
                </div> */}
                <img src= {logo} alt="Logo" />
              </motion.div>
              <div className="hidden md:block ml-8">
                <div className="ml-10 flex items-baseline space-x-8">
                  <NavLink active={activeSection === "home"} onClick={() => scrollToSection("home")}>
                    Home
                  </NavLink>
                  <NavLink active={activeSection === "features"} onClick={() => scrollToSection("features")}>
                    Features
                  </NavLink>
                  <NavLink active={activeSection === "how-it-works"} onClick={() => scrollToSection("how-it-works")}>
                    How It Works
                  </NavLink>
                  <NavLink active={activeSection === "voting"} onClick={() => scrollToSection("voting")}>
                    Voting Process
                  </NavLink>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <motion.button
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-[20px] transition-all duration-300 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}              >
                <Link to="/login">Get Started</Link>
              </motion.button>
            </div>
            <div className="md:hidden">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-[20px] text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                whileTap={{ scale: 0.95 }}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white/95 backdrop-blur-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <MobileNavLink active={activeSection === "home"} onClick={() => scrollToSection("home")}>
                  Home
                </MobileNavLink>
                <MobileNavLink active={activeSection === "features"} onClick={() => scrollToSection("features")}>
                  Features
                </MobileNavLink>
                <MobileNavLink
                  active={activeSection === "how-it-works"}
                  onClick={() => scrollToSection("how-it-works")}
                >
                  How It Works
                </MobileNavLink>
                <MobileNavLink active={activeSection === "voting"} onClick={() => scrollToSection("voting")}>
                  Voting Process
                </MobileNavLink>
                <div className="pt-4 px-3">
                  <motion.button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-[20px] transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100/80 text-emerald-700 text-sm font-medium mb-8 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Modern ASYV Voting Platform
            </motion.div>
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="block">Transform ASYV's</span>
              <span className="block text-slate-600 opacity-80">SG Elections</span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-slate-500 opacity-90 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              A secure, transparent, and engaging digital election platform designed specifically for educational
              institutions
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <motion.button
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-[20px] font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/login">Start Your Election </Link><ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
              <motion.button
                className="bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-[20px] font-medium transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Demo
              </motion.button>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            className="relative max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            style={{ opacity }}
          >
            <motion.div
              className="relative z-10 bg-white p-3 rounded-[20px] shadow-2xl transition-transform duration-700"
              whileHover={{ rotate: 1, scale: 1.02 }}
            >
              <div className="rounded-[20px] overflow-hidden">
                <img src= {dashboardImg} alt="Election System Dashboard" className="w-full h-auto" />
              </div>
            </motion.div>
            {/* Reflection effect */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-[90%] h-32 bg-slate-900/5 blur-3xl rounded-full"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 relative z-20">
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">Built for Modern Casting</h2>
            <p className="text-xl text-slate-500 opacity-90 max-w-3xl mx-auto">
              Everything you need to run secure, transparent, and engaging school elections
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FeatureCard
              icon={<Shield className="h-7 w-7 text-emerald-600" />}
              title="Secure & Private"
              description="End-to-end encryption ensures every vote is protected and anonymous"
              delay={0}
              accent="emerald"
            />
            <FeatureCard
              icon={<Users className="h-7 w-7 text-orange-600" />}
              title="Easy Participation"
              description="Intuitive interface designed for students of all technical levels"
              delay={0.1}
              accent="orange"
            />
            <FeatureCard
              icon={<BarChart3 className="h-7 w-7 text-emerald-600" />}
              title="Real-time Analytics"
              description="Live results and participation tracking with beautiful visualizations"
              delay={0.2}
              accent="emerald"
            />
            <FeatureCard
              icon={<Award className="h-7 w-7 text-orange-600" />}
              title="Candidate Profiles"
              description="Rich profiles allowing candidates to showcase their vision and qualifications"
              delay={0.3}
              accent="orange"
            />
            <FeatureCard
              icon={<CheckCircle className="h-7 w-7 text-emerald-600" />}
              title="Transparent Process"
              description="Complete audit trail while maintaining voter privacy and security"
              delay={0.4}
              accent="emerald"
            />
            <FeatureCard
              icon={<Sparkles className="h-7 w-7 text-orange-600" />}
              title="Modern Experience"
              description="Beautiful, responsive design that works perfectly on any device"
              delay={0.5}
              accent="orange"
            />
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative z-20">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">Simple Setup Process</h2>
            <p className="text-xl text-slate-500 opacity-90 max-w-3xl mx-auto">
              Get the elections running in just a few easy steps
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-12"
            initial={{ opacity: 0 }}
            animate={howItWorksInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ProcessStep
              number="01"
              title="Setup Election"
              description="Create your election, add positions, set dates, and configure voting parameters"
              delay={0}
              accent="emerald"
            />
            <ProcessStep
              number="02"
              title="Register Candidates"
              description="Students can register as candidates and create their campaign profiles"
              delay={0.2}
              accent="orange"
            />
            <ProcessStep
              number="03"
              title="Launch & Monitor"
              description="Open voting to students and monitor results in real-time through the dashboard"
              delay={0.4}
              accent="emerald"
            />
          </motion.div>
        </div>
      </section>

      {/* Voting Process Section */}
      <section id="voting" ref={votingRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={votingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">How Students Vote</h2>
            <p className="text-xl text-slate-500 opacity-90 max-w-3xl mx-auto">
              A simple, secure voting process designed for students
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={votingInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <VotingStep
              icon={<UserCheck className="h-8 w-8 text-emerald-600" />}
              title="Login Securely"
              description="Students log in with their school credentials"
              delay={0}
              accent="emerald"
            />
            <VotingStep
              icon={<Eye className="h-8 w-8 text-orange-600" />}
              title="Review Candidates"
              description="Browse candidate profiles and campaign information"
              delay={0.1}
              accent="orange"
            />
            <VotingStep
              icon={<Vote className="h-8 w-8 text-emerald-600" />}
              title="Cast Vote"
              description="Select candidates and submit secure ballot"
              delay={0.2}
              accent="emerald"
            />
            <VotingStep
              icon={<CheckCircle className="h-8 w-8 text-orange-600" />}
              title="Confirmation"
              description="Receive confirmation that vote was recorded"
              delay={0.3}
              accent="orange"
            />
          </motion.div>
        </div>
      </section>

      {/* Simple Footer */}
      <motion.footer
        className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative z-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto max-w-7xl text-center">
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <img src={logo} alt="Logo" />
            <span className="font-bold text-2xl">ASYV Election System</span>
          </motion.div>
          <motion.p
            className="text-slate-400 text-lg mb-6 opacity-80"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Modern, secure, and transparent election system for ASYV
          </motion.p>
          <motion.p
            className="text-slate-500 text-sm opacity-70"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            &copy; {new Date().getFullYear()} Election System. All rights reserved.
          </motion.p>
        </div>
      </motion.footer>
    </div>
  )
}

// Animation Components
function AnimatedStar({ className, delay, scrollY }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.2, 0.8, 0.2],
        scale: [0.8, 1.2, 0.8],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 4,
        delay: delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
      style={{
        y: useTransform(scrollY, [0, 1], ["0%", `${50 + delay * 10}%`]),
      }}
    >
      <Star className="h-4 w-4 text-slate-300 opacity-60" fill="currentColor" />
    </motion.div>
  )
}

// Navigation Components
function NavLink({ children, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className={`px-4 py-2 rounded-[20px] text-sm font-medium transition-all duration-300 ${
        active ? "text-slate-900 bg-slate-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

function MobileNavLink({ children, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className={`block px-3 py-3 rounded-[20px] text-base font-medium w-full text-left transition-all duration-300 ${
        active ? "text-slate-900 bg-slate-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      }`}
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  )
}

// Feature Components
function FeatureCard({ icon, title, description, delay, accent }) {
  const bgColor = accent === "emerald" ? "bg-emerald-100/80" : "bg-orange-100/80"

  return (
    <motion.div
      className="bg-white rounded-[20px] p-8 shadow-sm hover:shadow-lg transition-all duration-500 border border-slate-100"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      viewport={{ once: true }}
    >
      <motion.div
        className={`${bgColor} rounded-[20px] w-14 h-14 flex items-center justify-center mb-6 backdrop-blur-sm`}
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 opacity-90 leading-relaxed">{description}</p>
    </motion.div>
  )
}

// Process Step Component
function ProcessStep({ number, title, description, delay, accent }) {
  const bgColor = accent === "emerald" ? "bg-emerald-500" : "bg-orange-500"

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <motion.div
        className={`${bgColor} text-white rounded-[20px] w-16 h-16 flex items-center justify-center mx-auto mb-6 font-bold text-lg shadow-lg`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        {number}
      </motion.div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 opacity-90 leading-relaxed">{description}</p>
    </motion.div>
  )
}

// Voting Step Component
function VotingStep({ icon, title, description, delay, accent }) {
  const bgColor = accent === "emerald" ? "bg-emerald-100/80" : "bg-orange-100/80"

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <motion.div
        className={`${bgColor} rounded-[20px] w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 backdrop-blur-sm`}
        whileHover={{ scale: 1.1, rotate: -5 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 opacity-90 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}
