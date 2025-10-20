"use client";
import { useState, useEffect } from "react";
import { 
  Search, Filter, Download, FileText, BookOpen, TrendingUp, Users, 
  Settings, Star, Clock, ArrowRight, Menu, X, ChevronDown, Tag, 
  Calendar, Eye, Play, Share, Heart, Bookmark, ExternalLink,
  ThumbsUp, BarChart3, Zap, Globe, Lock, Unlock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NavHeader from "@/app/onboarding/navsection";
import { ebooks, } from "@/common/index"; 

export default function EbooksPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEbook, setSelectedEbook] = useState<typeof ebooks[number] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recent');
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

const filterOptions = ['All', 'E-book', 'Guide', 'Report', 'Webinar', 'Case Study'];
  
  // Filter and search logic
  const filteredEbooks = activeFilter === 'All' 
    ? ebooks 
    : ebooks.filter(ebook => ebook.type === activeFilter);

  const searchedEbooks = filteredEbooks.filter(ebook =>
    ebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ebook.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ebook.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ebook.readtime.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ebook.downloadUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ebook.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort ebooks
  const sortedEbooks = [...searchedEbooks].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.author || '').localeCompare(a.author || '');
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      default: // recent
        return 0; // Assuming original order is by recency
    }
  });

  const featuredEbooks = sortedEbooks.filter(ebook => ebook.rating >= 4.5).slice(0, 6);
  const regularEbooks = sortedEbooks.filter(ebook => !ebook.rating || ebook.rating < 4.5);

  // Modal functions
  const openModal = (ebook: typeof ebooks[number]) => {
    setSelectedEbook(ebook);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEbook(null);
    document.body.style.overflow = 'unset';
  };

  // Favorite toggle
  const toggleFavorite = (ebookId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(ebookId)) {
      newFavorites.delete(ebookId);
    } else {
      newFavorites.add(ebookId);
    }
    setFavorites(newFavorites);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <NavHeader />
      
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full translate-x-1/2 translate-y-1/2 opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              HelpEdge Knowledge Hub
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover expert guides, research reports, and practical resources to master IT Service Management
            </p>
            
            {/* Enhanced Search and Filter */}
            <motion.div 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto border border-white/20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search resources by title, author, or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/30"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {filterOptions.map((filter) => (
                    <motion.button
                      key={filter}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        activeFilter === filter
                          ? 'bg-white text-blue-600 shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {filter}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4 justify-center items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-blue-200">View:</span>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10'
                    }`}
                  >
                    List
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-blue-200">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="title">A-Z</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Resources Section */}
      {featuredEbooks.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
                <Star className="mr-2" size={16} />
                Editor&apos;s Picks
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Resources</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Curated selection of top-rated ITSM resources handpicked by our experts
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredEbooks.map((ebook, idx) => (
                <motion.div
                  key={ebook.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-blue-100"
                  onClick={() => openModal(ebook)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {ebook.type}
                    </span>
                    <button 
                      onClick={(e) => toggleFavorite(ebook.id, e)}
                      className="p-2 rounded-full hover:bg-white/50 transition-colors"
                    >
                      <Heart 
                        size={18} 
                        className={favorites.has(ebook.id) ? "text-red-500 fill-current" : "text-gray-400"} 
                      />
                    </button>
                  </div>
                  
                  <div className="mb-4 relative">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {ebook.type === 'E-book' && <BookOpen className="text-white" size={24} />}
                      {ebook.type === 'Report' && <TrendingUp className="text-white" size={24} />}
                      {ebook.type === 'Webinar' && <Play className="text-white" size={24} />}
                      {ebook.type === 'Case Study' && <Users className="text-white" size={24} />}
                    </div>
                    {ebook.premium && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        PREMIUM
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {ebook.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                    {ebook.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {ebook.readtime || '15 min read'}
                    </div>
                    <div className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      {(ebook.views || 0).toLocaleString()} views
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                      Read more <ArrowRight className="ml-1" size={16} />
                    </div>
                    <div className="flex items-center space-x-2">
                      {ebook.rating && (
                        <div className="flex items-center text-yellow-500">
                          <Star size={14} className="fill-current" />
                          <span className="text-sm font-medium ml-1">{ebook.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* All Resources Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 lg:mb-0">
              All Resources ({sortedEbooks.length})
            </h2>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 font-medium">View:</span>
                <div className="flex bg-white rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {sortedEbooks.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={viewMode === 'grid' 
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-6"
              }
            >
              {sortedEbooks.map((ebook, idx) => (
                <motion.div
                  key={ebook.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                  onClick={() => openModal(ebook)}
                >
                  {viewMode === 'list' && (
                    <div className="w-32 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        {ebook.type === 'E-book' && <BookOpen className="text-white" size={20} />}
                        {ebook.type === 'Report' && <TrendingUp className="text-white" size={20} />}
                        {ebook.type === 'Webinar' && <Play className="text-white" size={20} />}
                        {ebook.type === 'Case Study' && <Users className="text-white" size={20} />}
                      </div>
                    </div>
                  )}
                  
                  <div className={viewMode === 'list' ? "p-6 flex-1" : "p-6"}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {ebook.type}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => toggleFavorite(ebook.id, e)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Heart 
                            size={16} 
                            className={favorites.has(ebook.id) ? "text-red-500 fill-current" : "text-gray-400"} 
                          />
                        </button>
                        {ebook.premium && (
                          <Lock size={16} className="text-yellow-600" />
                        )}
                      </div>
                    </div>
                    
                    <h3 className={`font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors ${
                      viewMode === 'list' ? 'text-lg' : 'text-base line-clamp-2'
                    }`}>
                      {ebook.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {ebook.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {ebook.readtime || '15 min read'}
                      </div>
                      <div className="flex items-center">
                        <Eye size={12} className="mr-1" />
                        {(ebook.views || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Access resource <ArrowRight className="ml-1" size={14} />
                      </div>
                      <div className="flex items-center space-x-2">
                        {ebook.rating && (
                          <div className="flex items-center text-yellow-500">
                            <Star size={12} className="fill-current" />
                            <span className="text-xs font-medium ml-1">{ebook.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Ebook Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedEbook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 rounded-t-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 mb-3">
                        {selectedEbook.type}
                      </span>
                      <h2 className="text-3xl font-bold mb-2">{selectedEbook.title}</h2>
                      <p className="text-blue-100 text-lg">{selectedEbook.author}</p>
                    </div>
                    <button 
                      onClick={(e) => toggleFavorite(selectedEbook.id, e)}
                      className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <Heart 
                        size={24} 
                        className={favorites.has(selectedEbook.id) ? "text-red-400 fill-current" : "text-white"} 
                      />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      {selectedEbook.readtime || '15 min read'}
                    </div>
                    <div className="flex items-center">
                      <Eye size={16} className="mr-2" />
                      {(selectedEbook.views || 0).toLocaleString()} views
                    </div>
                    {selectedEbook.rating && (
                      <div className="flex items-center">
                        <Star size={16} className="fill-current mr-2" />
                        {selectedEbook.rating}/5
                      </div>
                    )}
                    {selectedEbook.pages && (
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2" />
                        {selectedEbook.pages} pages
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-8">
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {selectedEbook.description}
                  </p>
                  
                  {selectedEbook.tags && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEbook.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center">
                      <Download size={20} className="mr-2" />
                      Download Resource
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center">
                      <Share size={20} className="mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Ahead in ITSM
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get weekly insights, new resources, and industry trends delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Subscribe
              </motion.button>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              Join 15,000+ IT professionals. No spam, unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
