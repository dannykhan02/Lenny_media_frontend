import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Camera, ArrowRight, Target, BarChart, Globe, PenTool, Share2, Layers, Lightbulb, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Brands = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
      {/* Hero */}
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-stone-900'} pt-32 pb-24 px-4 text-center relative overflow-hidden`}>
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500 rounded-full blur-[150px] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[150px] opacity-10"></div>

        <div className="relative z-10 max-w-4xl mx-auto animate-[fadeIn_0.8s_ease-out]">
             <span className={`text-gold-500 font-bold tracking-widest uppercase text-sm mb-4 block ${isDarkMode ? 'text-gold-400' : 'text-gold-500'}`}>Our Ecosystem</span>
             <h1 className={`font-serif text-5xl md:text-7xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-6`}>The Collective</h1>
             <p className={`text-xl ${isDarkMode ? 'text-stone-300' : 'text-stone-300'} max-w-2xl mx-auto font-light leading-relaxed`}>
                We are more than just a camera. We are a multi-disciplinary group dedicated to elevating brands through visual storytelling and strategic marketing.
             </p>
        </div>
      </div>

      {/* LMBS Marketing Section */}
      <div className={`py-24 px-4 relative overflow-hidden ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row gap-16 items-center">
                <div className="w-full md:w-1/2">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-900'} rounded-full text-gold-500 font-bold text-sm mb-6 animate-[fadeInLeft_0.5s_ease-out]`}>
                        <Megaphone className="w-4 h-4" /> LMBS Marketing
                    </div>
                    <h2 className={`font-serif text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-6 leading-tight`}>
                        Strategic Growth & <br/> <span className="text-gold-600">Creative Branding.</span>
                    </h2>
                    <p className={`text-lg ${isDarkMode ? 'text-stone-300' : 'text-stone-600'} mb-6 leading-relaxed`}>
                        LMBS Marketing is our dedicated creative agency arm. While Lenny Media captures the visual, LMBS Marketing ensures it reaches the right audience. We bridge the gap between stunning visuals and tangible business growth.
                    </p>
                    <p className={`text-lg ${isDarkMode ? 'text-stone-300' : 'text-stone-600'} mb-8 leading-relaxed`}>
                        We specialize in building robust digital identities, crafting compelling social media strategies, and executing data-driven marketing campaigns that convert.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                        <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'} p-3 rounded-xl shadow-sm border`}>
                            <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-stone-700' : 'bg-stone-50'} flex items-center justify-center text-gold-600`}><Target className="w-5 h-5"/></div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>Brand Strategy</span>
                        </div>
                        <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'} p-3 rounded-xl shadow-sm border`}>
                             <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-stone-700' : 'bg-stone-50'} flex items-center justify-center text-gold-600`}><Share2 className="w-5 h-5"/></div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>Social Media Mgmt</span>
                        </div>
                        <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'} p-3 rounded-xl shadow-sm border`}>
                             <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-stone-700' : 'bg-stone-50'} flex items-center justify-center text-gold-600`}><PenTool className="w-5 h-5"/></div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>Content Creation</span>
                        </div>
                        <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'} p-3 rounded-xl shadow-sm border`}>
                             <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-stone-700' : 'bg-stone-50'} flex items-center justify-center text-gold-600`}><BarChart className="w-5 h-5"/></div>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>Digital Advertising</span>
                        </div>
                    </div>

                    <Link to="/contact" className={`inline-flex items-center gap-3 px-8 py-4 ${isDarkMode ? 'bg-stone-800 text-white' : 'bg-stone-900 text-white'} rounded-full font-bold hover:bg-gold-500 hover:text-stone-900 transition-all shadow-lg`}>
                        Consult LMBS Marketing <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
                
                <div className="w-full md:w-1/2 relative group">
                    <div className="absolute inset-0 bg-gold-500 rounded-3xl transform rotate-3 opacity-20 transition-transform duration-500 group-hover:rotate-6"></div>
                    <div className={`relative ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'} rounded-3xl shadow-xl overflow-hidden border p-8 md:p-12 transition-transform duration-500 group-hover:-translate-y-2`}>
                         <div className="grid grid-cols-2 gap-4">
                            <div className={`bg-stone-50 p-6 rounded-2xl text-center hover:bg-stone-100 transition-colors ${isDarkMode ? 'bg-stone-700 hover:bg-stone-600' : ''}`}>
                                <Globe className="w-8 h-8 text-stone-900 mx-auto mb-3" />
                                <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Digital</h4>
                            </div>
                            <div className={`bg-stone-900 p-6 rounded-2xl text-center text-white hover:bg-stone-800 transition-colors ${isDarkMode ? 'bg-stone-700 hover:bg-stone-600' : ''}`}>
                                <Lightbulb className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                                <h4 className="font-bold">Strategy</h4>
                            </div>
                             <div className="bg-gold-500 p-6 rounded-2xl text-center text-stone-900 col-span-2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
                                <Layers className="w-8 h-8 mx-auto mb-3" />
                                <h4 className="font-bold text-xl">Full-Service Agency</h4>
                                <p className="text-sm opacity-90 mt-1 font-medium">From Concept to Execution</p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Lenny Media Section (The Parent) */}
      <div className={`py-24 px-4 ${isDarkMode ? 'bg-stone-800' : 'bg-white'} border-t ${isDarkMode ? 'border-stone-700' : 'border-stone-100'}`}>
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row-reverse gap-16 items-center">
                <div className="w-full md:w-1/2">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-stone-700 text-gold-400' : 'bg-gold-100 text-gold-700'} rounded-full font-bold text-sm mb-6`}>
                        <Camera className="w-4 h-4" /> Lenny Media
                    </div>
                    <h2 className={`font-serif text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-6`}>
                        Premium Visual <br/> Production.
                    </h2>
                    <p className={`text-lg ${isDarkMode ? 'text-stone-300' : 'text-stone-600'} mb-6 leading-relaxed`}>
                        The core of our collective. Lenny Media focuses on the art of capturing time. We provide high-end photography and videography services for weddings, corporate events, and personal milestones.
                    </p>
                    <p className={`text-lg ${isDarkMode ? 'text-stone-300' : 'text-stone-600'} mb-8 leading-relaxed`}>
                        With state-of-the-art equipment and a team of seasoned artists, we ensure every frame tells a story.
                    </p>
                    <Link to="/services" className={`inline-flex items-center gap-3 px-8 py-4 ${isDarkMode ? 'bg-stone-700 border-stone-600 text-white' : 'bg-white border-2 border-stone-900 text-stone-900'} rounded-full font-bold hover:bg-stone-900 hover:text-white transition-all shadow-md`}>
                        Explore Production Services <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
                <div className="w-full md:w-1/2">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px] group">
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                         <img src="https://images.unsplash.com/photo-1588483977959-badc9893d432?q=80&w=1200&auto=format&fit=crop" alt="Production Team" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
                         <div className="absolute bottom-6 left-6 z-20">
                            <span className="bg-gold-500 text-stone-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Production House</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Call to Action */}
       <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-stone-900'} py-20 px-4 text-center`}>
          <div className="max-w-3xl mx-auto">
              <Zap className="h-12 w-12 text-gold-500 mx-auto mb-6" />
              <h2 className={`font-serif text-3xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-6`}>One Team. Infinite Possibilities.</h2>
              <p className={`text-xl ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} mb-10`}>
                  Whether you need stunning visuals or a strategic marketing campaign, our collective has you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="bg-gold-500 text-stone-900 px-10 py-4 rounded-full font-bold hover:bg-white transition-all duration-300 shadow-xl hover:scale-105">
                    Start a Project
                </Link>
              </div>
          </div>
      </div>
    </div>
  );
}
export default Brands;