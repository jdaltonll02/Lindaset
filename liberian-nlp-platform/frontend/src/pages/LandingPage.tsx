import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { 
  GlobeAltIcon, 
  SpeakerWaveIcon, 
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

export function LandingPage() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Machine Translation',
      description: 'Build parallel corpora for English ↔ Liberian language translation'
    },
    {
      icon: SpeakerWaveIcon,
      title: 'Speech Recognition',
      description: 'Create audio datasets for automatic speech recognition systems'
    },
    {
      icon: GlobeAltIcon,
      title: 'Speech Translation',
      description: 'Develop speech-to-speech translation capabilities'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Driven',
      description: 'Collaborative platform with quality control and validation'
    }
  ]

  const stats = [
    { label: 'Liberian Languages', value: '16' },
    { label: 'Language Families', value: '4' },
    { label: 'Target Speakers', value: '5M+' },
    { label: 'Open License', value: 'CC-BY' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GlobeAltIcon className="h-8 w-8 text-primary-800" />
              <span className="ml-2 text-xl font-serif font-semibold text-neutral-800">
                Liberian NLP Platform
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-800"
                  >
                    <UserCircleIcon className="h-6 w-6" />
                    <span>{user?.username}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 z-10">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Edit Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setShowProfileMenu(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-neutral-600 hover:text-neutral-800">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-serif font-bold text-neutral-800 mb-6"
            >
              Preserving Liberian Languages
              <span className="text-primary-800 block">Through Technology</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto text-balance"
            >
              A collaborative platform for building high-quality NLP datasets for all 16 Liberian tribal languages. 
              Supporting machine translation, speech recognition, and language preservation efforts.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Start Contributing
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/languages" className="btn-outline text-lg px-8 py-3">
                Explore Languages
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary-800 mb-2">
                  {stat.value}
                </div>
                <div className="text-neutral-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-neutral-800 mb-4">
              Building the Future of Liberian NLP
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Our platform supports multiple data collection workflows with rigorous quality control
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary-800 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Liberia is home to 16 distinct tribal languages, each representing centuries of cultural heritage. 
                Many of these languages are under-resourced in the digital age, limiting their speakers' access 
                to modern technology and threatening their preservation.
              </p>
              <p className="text-lg opacity-90">
                This platform empowers native speakers, linguists, and researchers to collaboratively build 
                high-quality datasets that will enable the development of NLP tools, preserve linguistic diversity, 
                and bridge the digital divide.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-8">
              <ChartBarIcon className="h-16 w-16 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Quality First</h3>
              <ul className="space-y-2 opacity-90">
                <li>• Three-layer validation system</li>
                <li>• Automated quality checks</li>
                <li>• Human expert review</li>
                <li>• Community consensus</li>
                <li>• Transparent governance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-neutral-800 mb-6">
            Join the Movement
          </h2>
          <p className="text-xl text-neutral-600 mb-8">
            Whether you're a native speaker, linguist, researcher, or technology enthusiast, 
            your contribution can help preserve and digitize Liberian languages for future generations.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Start Contributing Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <GlobeAltIcon className="h-6 w-6" />
                <span className="ml-2 font-serif font-semibold">Liberian NLP Platform</span>
              </div>
              <p className="text-neutral-300">
                Preserving and digitizing Liberian languages through collaborative technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-neutral-300">
                <li><Link to="/languages" className="hover:text-white">Languages</Link></li>
                <li><Link to="/datasets" className="hover:text-white">Datasets</Link></li>
                <li><Link to="/docs" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-neutral-300">
                <li><a href="#" className="hover:text-white">GitHub</a></li>
                <li><a href="#" className="hover:text-white">Research Papers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 Liberian NLP Platform. Licensed under CC-BY-4.0.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}