import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Truck, 
  ChevronRight,
  Utensils,
  Share2,
  Users,
  Leaf,
  Search
} from 'lucide-react';

const LandingPage = () => {
  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 scroll-smooth">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 p-2 rounded-xl text-white shadow-sm">
                <Leaf size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                FoodLink
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-500 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-green-500 transition-colors font-medium">How It Works</a>
              <a href="#impact" className="text-gray-600 hover:text-green-500 transition-colors font-medium">Impact</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-green-500 font-medium transition-colors">
                Log in
              </Link>
              <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/40">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Connect Surplus Food to <span className="text-green-500">Those Who Need It</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-2xl">
              Reduce waste. Feed people. Make an impact. Join our community to share perfectly good food with local individuals and charities.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/register?role=donor" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center transition-all shadow-xl shadow-green-500/20 hover:shadow-green-500/40 group">
                Donate Food
                <Heart className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
              <Link to="/register?role=receiver" className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center transition-all hover:border-orange-500 hover:text-orange-500 group">
                Find Food
                <Search className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-4 text-sm text-gray-500 font-medium">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img key={i} className="w-10 h-10 rounded-full border-2 border-white object-cover" src={`https://i.pravatar.cc/100?img=${i}`} alt="User" />
                ))}
              </div>
              <p>Join <span className="text-green-500 font-bold">2,000+</span> active members</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-green-100 to-orange-50 rounded-3xl transform rotate-3 scale-105 -z-10 transition-transform hover:rotate-6 duration-500"></div>
            <img 
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1000" 
              alt="Community food sharing" 
              className="rounded-3xl shadow-2xl object-cover h-[500px] w-full"
            />
            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4"
            >
              <div className="bg-orange-100 p-3 rounded-full text-orange-500">
                <Utensils size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Meals Saved</p>
                <p className="text-xl font-bold text-gray-900">12,450</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Everything you need to make sharing easy</h2>
            <p className="text-lg text-gray-600">Our platform provides smart tools to ensure surplus food reaches the right people quickly and safely.</p>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Share2, color: "text-blue-500", bg: "bg-blue-50", title: "Real-time Matching", desc: "Instant notifications when food is available in your area." },
              { icon: Clock, color: "text-orange-500", bg: "bg-orange-50", title: "Expiry Tracking", desc: "Smart alerts to ensure food is shared while it's still fresh." },
              { icon: MapPin, color: "text-green-500", bg: "bg-green-50", title: "Map Discovery", desc: "Interactive maps to easily locate available food nearby." },
              { icon: Truck, color: "text-purple-500", bg: "bg-purple-50", title: "Volunteer Delivery", desc: "Network of volunteers to transport food to those who can't travel." }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeIn} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
                <div className={`${feature.bg} ${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How FoodLink Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to fight food waste and feed your community.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-0.5 bg-gray-100 -z-10"></div>
            
            {[
              { step: "01", title: "Add Food", desc: "Restaurants, stores, or individuals list their surplus food with details and photos.", icon: Utensils },
              { step: "02", title: "Get Notified", desc: "Nearby users and charities receive instant alerts about available donations.", icon: Users },
              { step: "03", title: "Claim & Pickup", desc: "Reserve the food and pick it up, or request a volunteer delivery.", icon: MapPin }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2 }}
                className="text-center relative"
              >
                <div className="w-24 h-24 mx-auto bg-white border-4 border-green-500 rounded-full flex items-center justify-center text-green-500 mb-8 shadow-lg shadow-green-100 relative z-10 hover:scale-105 transition-transform">
                  <item.icon size={36} />
                  <div className="absolute -top-3 -right-3 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 px-4 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 bg-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">Our Impact So Far</h2>
              <p className="text-green-50 text-xl mb-10 leading-relaxed font-light">
                Together, we're building a sustainable future where good food never goes to waste. Every meal shared makes a difference.
              </p>
              <Link to="/register" className="inline-flex items-center bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-xl shadow-green-900/20 hover:shadow-green-900/40">
                Join the Movement <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Meals Saved", value: "50k+" },
                { label: "CO2 Reduced (kg)", value: "120k" },
                { label: "Active Donors", value: "850" },
                { label: "Charities Helped", value: "124" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-green-600/30 p-8 rounded-3xl backdrop-blur-sm border border-green-400/30 hover:bg-green-600/50 transition-colors"
                >
                  <p className="text-4xl lg:text-5xl font-extrabold mb-2 text-white">{stat.value}</p>
                  <p className="text-green-100 font-medium text-lg">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Leaf className="text-green-500" size={28} />
                <span className="text-2xl font-bold text-white">FoodLink</span>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-sm">Connecting surplus food to those who need it. Making communities stronger and more sustainable, one meal at a time.</p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors cursor-pointer text-gray-400">
                  <span className="font-bold">in</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors cursor-pointer text-gray-400">
                  <span className="font-bold">x</span>
                </div>
              </div>
            </div>
            
            <div className="col-span-1">
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-green-500 transition-colors">Donate Food</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Find Food</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Volunteer</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Live Map</a></li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-green-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <ul className="space-y-4 flex flex-row lg:flex-col gap-4 lg:gap-0">
                <li><a href="#" className="hover:text-green-500 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} FoodLink. All rights reserved.</p>
            <p>Designed with <Heart size={14} className="inline text-red-500 mx-1" /> for a better world</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
