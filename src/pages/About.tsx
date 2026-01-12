import React from 'react';
import { Heart, Award, Users, Camera, Zap, Video, MapPin, Briefcase, Globe, MonitorPlay } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const About: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-stone-950' : 'bg-white'}`}>
      {/* Hero Section */}
      <div className={`relative ${isDarkMode ? 'bg-stone-900' : 'bg-stone-900'} py-32 px-4 overflow-hidden`}>
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1554048612-387768052bf7?q=80&w=2000&auto=format&fit=crop" alt="Studio Camera" className="w-full h-full object-cover grayscale" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <span className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-4 block">Visual Storytellers</span>
          <h1 className={`font-serif text-5xl md:text-7xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-8`}>About Lenny Media</h1>
          <p className={`text-xl ${isDarkMode ? 'text-stone-300' : 'text-stone-300'} max-w-3xl mx-auto leading-relaxed`}>
            We believe every moment has a story worth telling — and every brand deserves visuals that speak with power, emotion, and authenticity.
          </p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gold-100 rounded-full z-0"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-stone-100 rounded-full z-0"></div>
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop" alt="Photography Team" className="relative z-10 rounded-3xl shadow-2xl w-full object-cover h-[500px]" />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-4">
                     <MapPin className="h-5 w-5 text-gold-500" />
                     <span className={`${isDarkMode ? 'text-stone-300' : 'text-stone-500'} font-medium uppercase tracking-wide text-sm`}>Juja Square, 1st Floor</span>
                </div>
                <h2 className={`font-serif text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-6`}>Who We Are</h2>
                <div className="w-20 h-1.5 bg-gold-500 mb-8"></div>
                <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg mb-6 leading-relaxed`}>
                   Located at Juja Square Building, we are a creative photography and videography studio proudly serving Juja, Thika Road, Nairobi, and beyond.
                </p>
                <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg leading-relaxed mb-6`}>
                    We specialize in professional photography and high-quality videography designed to capture life's most important moments and elevate brands through compelling visual storytelling. From intimate studio portraits to large-scale events, from weddings full of emotion to corporate productions driven by purpose, our work is built on creativity, precision, and passion.
                </p>
            </div>
        </div>
      </div>

      {/* Services Breakdown (Refined to match Services.tsx) */}
      <div className={`${isDarkMode ? 'bg-stone-800' : 'bg-stone-50'} py-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
            
            {/* 1. Corporate & Commercial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                    <div className={`bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center shadow-sm mb-6 ${isDarkMode ? 'bg-stone-700' : ''}`}>
                        <Briefcase className="h-8 w-8 text-gold-500" />
                    </div>
                    <h3 className={`font-serif text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4`}>Corporate & Commercial</h3>
                    <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg leading-relaxed mb-4`}>
                        We empower businesses with professional visual content. Our corporate services cover large-scale <strong>conferences</strong>, <strong>team building events</strong>, and executive <strong>headshots</strong>.
                    </p>
                    <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg leading-relaxed`}>
                        Beyond events, we excel in <strong>product photography</strong>, appetizing <strong>food & hotel visuals</strong>, and <strong>real estate</strong> showcases. We also offer end-to-end <strong>documentary production</strong> and high-definition <strong>livestreaming</strong> to help you reach a global audience.
                    </p>
                </div>
                <div className="order-1 md:order-2 rounded-3xl overflow-hidden shadow-xl h-[400px]">
                     {/* Image: Corporate/Conference */}
                    <img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop" alt="Corporate Event" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
            </div>

            {/* 2. Weddings & Celebrations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="h-[400px] rounded-3xl overflow-hidden shadow-xl">
                    {/* Image: Wedding/Celebration */}
                    <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop" alt="Wedding Celebration" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div>
                     <div className={`bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center shadow-sm mb-6 ${isDarkMode ? 'bg-stone-700' : ''}`}>
                        <Heart className="h-8 w-8 text-gold-500" />
                    </div>
                    <h3 className={`font-serif text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4`}>Weddings & Social Events</h3>
                    <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg leading-relaxed mb-4`}>
                        From the intimate exchange of vows to the vibrant energy of a reception, we capture the soul of your celebration. We are experts in <strong>Weddings, Ruracio,</strong> and traditional ceremonies.
                    </p>
                    <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg leading-relaxed`}>
                        Our team also covers <strong>birthdays, baby showers,</strong> and <strong>private parties</strong>. With our 4K cinematic video coverage and drone capabilities, we turn your special moments into a timeless film that you can cherish forever.
                    </p>
                </div>
            </div>

             {/* 3. Studio & Creative */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                     <div className={`bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center shadow-sm mb-6 ${isDarkMode ? 'bg-stone-700' : ''}`}>
                        <Camera className="h-8 w-8 text-gold-500" />
                    </div>
                    <h3 className={`font-serif text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-4`}>Studio, Portraits & Lifestyle</h3>
                    <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg leading-relaxed mb-4`}>
                        Located at Juja Square, our modern, fully equipped studio is the perfect space for <strong>high-end portraits, graduation shoots,</strong> and creative <strong>fashion photography</strong>.
                    </p>
                     <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} text-lg leading-relaxed`}>
                        We also specialize in <strong>outdoor and lifestyle photography</strong>, utilizing natural light to create authentic, personality-driven images. Whether you need a family portrait or a creative modeling portfolio, we bring your vision to life.
                    </p>
                </div>
                <div className="order-1 md:order-2 rounded-3xl overflow-hidden shadow-xl h-[400px]">
                    {/* Image: Studio/Portrait */}
                    <img src="https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?q=80&w=1200&auto=format&fit=crop" alt="Studio Portrait" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
            </div>

        </div>
      </div>

      {/* Mission & Values */}
      <div className={`py-24 px-4 relative overflow-hidden ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}>
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className={`font-serif text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-8`}>Our Philosophy</h2>
            <p className={`text-xl ${isDarkMode ? 'text-stone-300' : 'text-stone-600'} mb-12 leading-relaxed`}>
                "At Lenny Media Kenya, we don't just take photos or shoot videos — we create experiences, preserve memories, and build visual identities. Our mission is to deliver premium-quality work that exceeds expectations while remaining accessible to individuals, students, creators, and businesses alike."
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                    { title: "Creativity", desc: "Pushing boundaries to deliver unique, artistic perspectives." },
                    { title: "Precision", desc: "Attention to detail in lighting, composition, and editing." },
                    { title: "Passion", desc: "Driven by a love for storytelling and capturing genuine emotion." }
                ].map((val, i) => (
                    <div key={i} className={`${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-100'} p-6 rounded-2xl border`}>
                        <h4 className="font-bold text-lg text-gold-600 mb-2">{val.title}</h4>
                        <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>{val.desc}</p>
                    </div>
                ))}
            </div>
         </div>
      </div>
      
      {/* Call to Action */}
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-stone-900'} text-white py-24 px-4 text-center`}>
          <div className="max-w-4xl mx-auto">
              <Camera className="h-12 w-12 text-gold-500 mx-auto mb-6" />
              <h2 className={`font-serif text-3xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-6`}>Tell Your Story Beautifully</h2>
              <p className={`text-xl ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} mb-10`}>
                  Step into our studio at Juja Square or book a session online.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/booking" className="bg-gold-500 text-stone-900 px-10 py-4 rounded-full font-bold hover:bg-white transition-all duration-300">
                    Book a Session
                </Link>
                <Link to="/contact" className={`border ${isDarkMode ? 'border-stone-700' : 'border-stone-700'} text-white px-10 py-4 rounded-full font-bold hover:${isDarkMode ? 'bg-stone-800' : 'bg-stone-800'} transition-all duration-300`}>
                    Visit Our Studio
                </Link>
              </div>
          </div>
      </div>
    </div>
  );
};

export default About;