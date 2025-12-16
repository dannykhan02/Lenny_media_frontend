import React from 'react';
import { Camera, Video, Check, ArrowRight, Zap, Star, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
  const photographyServices = [
    { 
        title: 'Corporate Events Photography', 
        price: 'Ksh 25,000 – 60,000', 
        desc: 'Professional coverage for conferences, product launches, AGMs, and team building. Includes rapid delivery for press.',
        features: ['Unlimited High-Res Photos', 'Rapid Turnaround', 'Online Gallery']
    },
    { 
        title: 'Wedding & Engagement', 
        price: 'Ksh 40,000 – 150,000', 
        desc: 'Capturing your love story with cinematic flair. From intimate engagement shoots to full wedding day coverage.',
        features: ['Pre-wedding Shoot', 'Photobook Options', 'Two Shooters']
    },
    { 
        title: 'Studio Shots & Hire', 
        price: 'Ksh 3,000 – 15,000', 
        desc: 'High-end portraits in our fully equipped Juja studio. Studio space also available for rental to other creatives.',
        features: ['Professional Lighting', 'Multiple Backdrops', 'Retouching Included']
    },
    { 
        title: 'Portrait Shots Photography', 
        price: 'Ksh 3,000 – 10,000', 
        desc: 'Personal branding, creative modeling portfolios, and professional headshots designed to make you stand out.',
        features: ['Outfit Changes', 'Posing Guidance', 'Digital Delivery']
    },
    { 
        title: 'Outdoor & Indoor Photography', 
        price: 'Ksh 5,000 – 15,000', 
        desc: 'Versatile lifestyle shoots leveraging natural light, scenic landscapes, or architectural interiors.',
        features: ['Location Scouting', 'Natural Light', 'Creative Direction']
    },
    { 
        title: 'Family & Parties', 
        price: 'Ksh 10,000 – 30,000', 
        desc: 'Baby showers, birthdays, and family reunions. We capture the candid joy and warmth of your loved ones.',
        features: ['Group Portraits', 'Candid Moments', 'Print Options']
    },
    { 
        title: 'Wildlife, Tours & Travel', 
        price: 'Custom Quote', 
        desc: 'Documenting adventures, safaris, and nature with high-end telephoto equipment for tour operators or individuals.',
        features: ['Telephoto Equipment', 'Travel Ready', 'Commercial Rights']
    },
    { 
        title: 'Food & Hotel Photography', 
        price: 'Ksh 10,000 – 40,000', 
        desc: 'Appetizing visuals for menus, social media, and hospitality marketing. Essential for restaurants and Airbnbs.',
        features: ['Styling Assistance', 'Macro Details', 'Social Media Ready']
    },
    { 
        title: 'Drone & Aerial Photography', 
        price: 'Ksh 15,000 – 30,000', 
        desc: 'Stunning high-resolution aerial stills for real estate, construction progress, and landscapes.',
        features: ['4K Resolution', 'Licensed Pilot', 'Unique Angles']
    },
  ];

  const videographyServices = [
    { 
        title: 'Corporate Events Video', 
        price: 'Ksh 40,000 – 100,000', 
        desc: 'Full production coverage including highlight reels, full speeches, and interviews for internal or external use.',
        features: ['Multi-Camera Setup', 'High Quality Audio', 'Highlight Reel']
    },
    { 
        title: 'Wedding Video Coverage', 
        price: 'Ksh 60,000 – 200,000', 
        desc: '4K cinematic wedding films. Multiple camera angles, crystal clear audio, and expert color grading.',
        features: ['Cinematic Editing', 'Drone Coverage', 'Teaser Trailer']
    },
    { 
        title: 'Documentaries Production', 
        price: 'Custom Quote', 
        desc: 'In-depth storytelling. Scripting, interviews, B-roll, and narration for NGOs, brands, or personal projects.',
        features: ['Storyboarding', 'Interview Lighting', 'Professional Voiceover']
    },
    { 
        title: 'Livestreaming Coverage', 
        price: 'Ksh 25,000 – 80,000', 
        desc: 'Multi-camera live broadcasting to YouTube, Facebook, or private servers. Perfect for hybrid events.',
        features: ['Stable Connection', 'Graphic Overlays', 'Live Switching']
    },
    { 
        title: 'Drone & Aerial Videography', 
        price: 'Ksh 20,000 – 50,000', 
        desc: 'Smooth, cinematic aerial motion shots to add high production value to any project.',
        features: ['4K/60fps Video', 'Smooth Motion', 'Wide Dynamic Range']
    },
  ];

  return (
    <div className="bg-stone-50 min-h-screen font-sans">
      {/* Hero Header */}
      <div className="relative bg-stone-950 pt-36 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
             {/* Richer Gold Gradient Background Effect */}
             <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-b from-gold-600/10 to-transparent rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-stone-800/50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center z-10">
          
          {/* Updated Premium Badge - Gold Background */}
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-stone-900 mb-8 shadow-lg shadow-gold-500/30 animate-[fadeIn_1s] border border-gold-300 transform hover:scale-105 transition-transform duration-300">
            <Star className="w-5 h-5 fill-stone-900" strokeWidth={2.5} />
            <span className="font-bold tracking-widest uppercase text-xs">Premium Quality Services</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Services & Investment
          </h1>
          <p className="text-stone-300 max-w-2xl mx-auto text-xl leading-relaxed font-light">
            Transparent pricing for world-class artistry. Choose the package that fits your vision.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Photography Section */}
        <div className="mb-24">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-stone-100">
              <Camera className="h-8 w-8 text-gold-500" />
            </div>
            <div>
              <h2 className="font-serif text-4xl font-bold text-stone-900">Photography</h2>
              <p className="text-stone-500 text-lg">Stills that capture the soul.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photographyServices.map((service, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-stone-100 hover:border-gold-500/30 flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-300 to-gold-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                
                <h3 className="font-serif font-bold text-2xl text-stone-900 mb-2 group-hover:text-gold-600 transition-colors">{service.title}</h3>
                <p className="text-stone-500 mb-6 text-sm leading-relaxed">{service.desc}</p>
                
                {/* Features List */}
                <div className="space-y-3 mb-8 flex-grow">
                    {service.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-stone-600">
                            <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-gold-600" />
                            </div>
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-stone-100 mt-auto">
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-2">Starting from</p>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-xl font-bold text-stone-900">{service.price}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Link 
                            to={`/booking?service=${encodeURIComponent(service.title)}`}
                            className="flex items-center justify-center gap-2 bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 text-sm"
                        >
                            Book Now
                        </Link>
                        <Link 
                            to="/quote"
                            className="flex items-center justify-center gap-2 bg-white border-2 border-gold-500 text-gold-600 font-bold py-3 rounded-xl hover:bg-gold-50 transition-all text-sm hover:shadow-md"
                        >
                            Get Quote
                        </Link>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Videography Section */}
        <div>
          <div className="flex items-center gap-6 mb-12">
             <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center shadow-lg border border-stone-800">
              <Video className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-4xl font-bold text-stone-900">Videography</h2>
              <p className="text-stone-500 text-lg">Motion pictures in 4K resolution.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videographyServices.map((service, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-stone-100 hover:border-stone-900/30 flex flex-col group relative overflow-hidden">
                {service.title.includes('Wedding') && (
                  <div className="absolute top-0 right-0 bg-stone-900 text-gold-500 text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10 flex items-center gap-1 shadow-md">
                    <Zap className="w-3 h-3" fill="currentColor" /> POPULAR
                  </div>
                )}
                
                 <div className="absolute top-0 left-0 w-full h-1 bg-stone-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                <h3 className="font-serif font-bold text-2xl text-stone-900 mb-2 group-hover:text-gold-600 transition-colors">{service.title}</h3>
                <p className="text-stone-500 mb-6 text-sm leading-relaxed">{service.desc}</p>
                
                 {/* Features List */}
                 <div className="space-y-3 mb-8 flex-grow">
                    {service.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-stone-600">
                            <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-stone-900" />
                            </div>
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-stone-100 mt-auto">
                     <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-2">Starting from</p>
                     <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-xl font-bold text-stone-900">{service.price}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Link 
                            to={`/booking?service=${encodeURIComponent(service.title)}`}
                            className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl text-sm"
                        >
                            Book Now
                        </Link>
                        <Link 
                            to="/quote"
                            className="flex items-center justify-center gap-2 bg-white border-2 border-stone-900 text-stone-900 font-bold py-3 rounded-xl hover:bg-stone-50 transition-all text-sm hover:shadow-md"
                        >
                            Get Quote
                        </Link>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CTA Bottom */}
      <div className="bg-stone-900 text-white py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">Have a unique project?</h2>
            <p className="text-stone-400 mb-10 max-w-lg mx-auto text-lg">We create custom packages tailored to your specific creative requirements. Let's discuss your vision.</p>
            <Link to="/contact" className="inline-flex items-center gap-3 px-10 py-4 bg-transparent border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-stone-900 rounded-full transition-all duration-300 font-bold uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]">
            Get a Custom Quote <ArrowRight className="h-5 w-5" />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;