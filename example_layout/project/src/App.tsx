import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, MessageSquare, Gamepad2, Newspaper, Bell, User, Menu } from 'lucide-react';
import { HDate } from '@hebcal/core';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatHebrewDate = (date: Date) => {
    const hDate = new HDate(date);
    return `${hDate.getDate()} ${hDate.getMonthName()} ${hDate.getFullYear()}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-indigo-600 ml-2 md:ml-0">Nexus</h1>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search everything..."
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <nav className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pb-3`}>
            <div className="space-y-1">
              {['Marketplace', 'Forum', 'Games', 'News'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  {item}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="hidden md:block fixed w-full top-16 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              <NavItem icon={<ShoppingBag className="h-5 w-5" />} text="Marketplace" />
              <NavItem icon={<MessageSquare className="h-5 w-5" />} text="Forum" />
              <NavItem icon={<Gamepad2 className="h-5 w-5" />} text="Games" />
              <NavItem icon={<Newspaper className="h-5 w-5" />} text="News" />
            </div>
            {/* Date and Time */}
            <div className="hidden md:flex items-center">
              <div className="text-xs text-gray-600 text-right">
                <div className="font-medium">{formatHebrewDate(currentTime)}</div>
                <div>{formatDate(currentTime)}</div>
                <div className="font-medium">{formatTime(currentTime)}</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Featured Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeaturedCard
              image="https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=800"
              title="New Marketplace Features"
              description="Discover our latest AI-powered recommendations and seamless shopping experience."
            />
            <FeaturedCard
              image="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"
              title="Gaming Tournament"
              description="Join our weekly gaming tournaments and compete for amazing prizes!"
            />
            <FeaturedCard
              image="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800"
              title="Tech News"
              description="Stay updated with the latest technology trends and market insights."
            />
          </div>
        </section>

        {/* Trending Items */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Trending in Marketplace</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <ProductCard key={item} />
            ))}
          </div>
        </section>

        {/* Active Discussions */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Active Discussions</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <DiscussionCard key={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <a
      href={`#${text.toLowerCase()}`}
      className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-600"
    >
      {icon}
      <span className="ml-2">{text}</span>
    </a>
  );
}

function FeaturedCard({ image, title, description }: { image: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:transform hover:scale-[1.02]">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function ProductCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400"
        alt="Product"
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900">Premium Watch</h3>
        <p className="text-lg font-bold text-indigo-600 mt-1">$299</p>
      </div>
    </div>
  );
}

function DiscussionCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-4">
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">The Future of Gaming Technology</h3>
          <p className="text-sm text-gray-600 mt-1">
            Discussion about emerging gaming technologies and their impact on the industry...
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>24 replies</span>
            <span>•</span>
            <span>3 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;