import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Video, Star, ChevronDown, MapPin, Instagram, Play, Aperture, MonitorPlay, Compass, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// --- Utility Components ---

const FadeIn: React.FC<{ children: React.ReactNode; delay?: string; className?: string }> = ({ children, delay = '0ms', className = '' }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true);
        });
      },
      { threshold: 0.1 }
    );
    const currentElement = domRef.current;
    if (currentElement) observer.observe(currentElement);
    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

const ParallaxImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = '' }) => {
    return (
        <div className={`relative overflow-hidden ${className} group`}>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10 duration-500"></div>
            <img 
                src={src} 
                alt={alt} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.5s] ease-out" 
            />
        </div>
    )
}

// --- Page Sections ---

const Hero = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Fixed Background for Parallax Feel - Eager loaded for LCP */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=2000&auto=format&fit=crop')" 
        }}
      >
        <div className="absolute inset-0 bg-stone-950/60"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto">
        <FadeIn delay="100ms">
            <p className="text-gold-500 font-bold tracking-[0.3em] uppercase text-sm mb-6">
                Juja • Nairobi • Kenya
            </p>
        </FadeIn>
        
        <FadeIn delay="300ms">
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 tracking-tighter leading-none">
                LENNY<br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">MEDIA</span>
            </h1>
        </FadeIn>

        <FadeIn delay="500ms">
            <p className={`text-xl md:text-2xl font-light max-w-2xl mx-auto mb-12 leading-relaxed ${isDarkMode ? 'text-stone-300' : 'text-stone-300'}`}>
                We craft timeless visuals for brands, weddings, and individuals. 
                <br className="hidden md:block"/> Authentic storytelling through the lens.
            </p>
        </FadeIn>

        <FadeIn delay="700ms">
            <div className="flex flex-col md:flex-row gap-6">
                <Link 
                    to="/portfolio" 
                    className={`group relative px-8 py-4 font-bold rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 ${isDarkMode ? 'bg-white text-stone-900' : 'bg-white text-stone-900'}`}
                >
                    <span className="relative z-10 group-hover:text-gold-600 transition-colors">View Portfolio</span>
                </Link>
                <Link 
                    to="/booking" 
                    className={`group px-8 py-4 border border-white/30 text-white font-bold rounded-full hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm ${isDarkMode ? 'border-white/20' : 'border-white/30'}`}
                >
                    Book a Session
                </Link>
            </div>
        </FadeIn>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
        <ChevronDown className="w-8 h-8" />
      </div>
    </div>
  );
};

const Marquee = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`py-6 overflow-hidden whitespace-nowrap border-y ${isDarkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-900 border-stone-800'}`}>
      <div className="inline-block animate-[marquee_20s_linear_infinite]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} className={`font-serif text-2xl mx-12 italic opacity-50 hover:opacity-100 hover:text-gold-500 transition-colors cursor-default ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                Photography • Videography • Branding • Live Streaming • Direction •
            </span>
        ))}
      </div>
    </div>
  );
};

const AboutSection = () => {
    const { isDarkMode } = useTheme();

    return (
        <section className={`py-24 md:py-32 ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'} px-4 overflow-hidden`}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                
                {/* Visual Grid Collage */}
                <div className="relative">
                    <FadeIn delay="0ms">
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                          {/* Left Column of Grid */}
                          <div className="flex flex-col gap-4 md:gap-6 pt-0 md:pt-12">
                            <img 
                              src="https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?q=80&w=800&auto=format&fit=crop" 
                              alt="Studio Session" 
                              loading="lazy"
                              decoding="async"
                              className="rounded-2xl shadow-xl w-full h-48 md:h-64 object-cover hover:scale-[1.02] transition-transform duration-500"
                            />
                            <div className={`p-6 rounded-2xl text-white shadow-xl flex flex-col justify-center h-full transform hover:bg-stone-800 transition-colors ${isDarkMode ? 'bg-stone-800' : 'bg-stone-900'}`}>
                                <Star className="w-8 h-8 text-gold-500 mb-4" />
                                <p className="font-serif text-lg leading-tight italic">"The studio vibe is unmatched. Professionalism at its peak."</p>
                                <p className="text-stone-500 text-xs mt-4 uppercase tracking-wider font-bold">- Validated Review</p>
                            </div>
                          </div>
                          
                          {/* Right Column of Grid */}
                          <div className="flex flex-col gap-4 md:gap-6">
                            <div className="bg-gold-500 rounded-2xl p-6 shadow-xl flex items-center justify-center aspect-square md:aspect-auto md:h-40 relative overflow-hidden group">
                               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                               <Camera className="w-12 h-12 text-stone-900 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <img 
                              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop" 
                              alt="Professional Camera Gear" 
                              loading="lazy"
                              decoding="async"
                              className="rounded-2xl shadow-xl w-full h-64 md:h-80 object-cover hover:scale-[1.02] transition-transform duration-500"
                            />
                          </div>
                        </div>
                    </FadeIn>
                </div>
                
                {/* Content Side */}
                <div className="relative z-10">
                    <FadeIn delay="200ms">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="w-8 h-[2px] bg-gold-500"></span>
                            <span className="text-gold-600 font-bold uppercase tracking-widest text-xs">Our Roots</span>
                        </div>
                        <h2 className={`font-serif text-5xl md:text-6xl font-bold mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                            Capturing the Spirit of <span className="text-gold-600">Excellence.</span>
                        </h2>
                    </FadeIn>
                    
                    <FadeIn delay="400ms">
                        <p className={`text-lg leading-relaxed mb-6 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                            Based in Juja, our lens extends far beyond the studio. We are deeply inspired by the vibrant landscapes and raw beauty of our clients' stories.
                        </p>
                        <p className={`text-lg leading-relaxed mb-10 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                            Whether it's a corporate event in Nairobi, a wedding in the Rift Valley, or a creative session in our modern studio, we bring a distinct artistic authenticity to every frame we shoot.
                        </p>
                    </FadeIn>

                    <FadeIn delay="600ms">
                        <div className="grid grid-cols-2 gap-8 mb-10 border-t pt-8">
                            <div>
                                <h3 className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Juja</h3>
                                <p className={`text-sm uppercase tracking-wide ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Headquarters</p>
                            </div>
                            <div>
                                <h3 className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>47+</h3>
                                <p className={`text-sm uppercase tracking-wide ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Counties Covered</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <Link to="/about" className={`inline-flex items-center gap-2 font-bold border-b-2 pb-1 hover:text-gold-600 hover:border-gold-600 transition-all ${isDarkMode ? 'text-white border-white' : 'text-stone-900 border-stone-900'}`}>
                                Read Our Story <ArrowRight className="w-4 h-4" />
                            </Link>
                             <Link to="/booking" className={`inline-flex items-center gap-2 font-bold border-b-2 pb-1 hover:text-stone-900 hover:border-stone-900 transition-all ${isDarkMode ? 'text-gold-600 border-gold-600' : 'text-gold-600 border-gold-600'}`}>
                                Book a Shoot <Camera className="w-4 h-4" />
                            </Link>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    )
}

const ServicesSection = () => {
    const { isDarkMode } = useTheme();
    const services = [
        {
            icon: <Camera className="w-8 h-8" />,
            title: "Photography",
            description: "From studio portraits to large-scale events, we deliver high-resolution imagery that speaks.",
            image: "https://images.unsplash.com/photo-1542038784424-fa00ed4998ca?q=80&w=800&auto=format&fit=crop"
        },
        {
            icon: <Video className="w-8 h-8" />,
            title: "Videography",
            description: "Cinematic 4K video production for weddings, commercials, and documentaries.",
            image: "https://images.unsplash.com/photo-1579632652768-6cb9dcf85912?q=80&w=800&auto=format&fit=crop"
        },
        {
            icon: <MonitorPlay className="w-8 h-8" />,
            title: "Live Streaming",
            description: "Multi-camera broadcasting to reach your audience anywhere in the world in real-time.",
            image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=800&auto=format&fit=crop"
        }
    ];

    return (
        <section className={`py-24 px-4 ${isDarkMode ? 'bg-stone-950' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto mb-16 text-center">
                 <FadeIn>
                    <h2 className={`font-serif text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Our Expertise</h2>
                    <p className={`max-w-xl mx-auto ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Comprehensive visual solutions tailored to your unique needs.</p>
                 </FadeIn>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service, idx) => (
                    <FadeIn key={idx} delay={`${idx * 200}ms`}>
                        <div className={`group relative rounded-2xl overflow-hidden ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'} hover:shadow-2xl transition-all duration-500 h-[450px]`}>
                            {/* Background Image that appears on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <img 
                                    src={service.image} 
                                    alt={service.title} 
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover grayscale opacity-20" 
                                />
                            </div>
                            
                            <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-stone-900 mb-6 shadow-md group-hover:bg-gold-500 transition-colors">
                                        {service.icon}
                                    </div>
                                    <h3 className={`font-serif text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{service.title}</h3>
                                    <p className={`leading-relaxed font-medium transition-colors ${isDarkMode ? 'text-stone-300 group-hover:text-white' : 'text-stone-600 group-hover:text-stone-900'}`}>
                                        {service.description}
                                    </p>
                                </div>
                                <div className="transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <Link to="/services" className={`inline-flex items-center gap-2 font-bold hover:text-gold-600 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                        Learn More <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </section>
    )
}

const GallerySection = () => {
    const { isDarkMode } = useTheme();
    const images = [
        { src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=600&auto=format&fit=crop", span: "md:col-span-1", title: "Weddings" },
        { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop", span: "md:col-span-1", title: "Portraits" },
        { src: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1200&auto=format&fit=crop", span: "md:col-span-2", title: "Celebrations" },
        { src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop", span: "md:col-span-2", title: "Corporate" },
        { src: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop", span: "md:col-span-1", title: "Events" },
        { src: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?q=80&w=600&auto=format&fit=crop", span: "md:col-span-1", title: "Lifestyle" },
    ];

    return (
        <section className={`py-24 ${isDarkMode ? 'bg-stone-950' : 'bg-white'} text-white px-4`}>
             <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                 <FadeIn>
                    <h2 className={`font-serif text-4xl md:text-5xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Selected Works</h2>
                    <p className={isDarkMode ? 'text-stone-400' : 'text-stone-600'}>A curated showcase of our recent projects.</p>
                 </FadeIn>
                 <FadeIn delay="200ms">
                     <Link to="/portfolio" className={`inline-flex items-center gap-2 px-6 py-3 border rounded-full transition-all ${isDarkMode ? 'border-white/30 hover:bg-white hover:text-stone-900' : 'border-stone-900 hover:bg-stone-900 hover:text-white'}`}>
                        View Full Portfolio <ArrowRight className="w-4 h-4" />
                     </Link>
                 </FadeIn>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                    <FadeIn key={idx} delay={`${idx * 100}ms`} className={`${img.span} h-64 md:h-80`}>
                        <Link to="/portfolio" className="block w-full h-full relative group overflow-hidden rounded-xl">
                            <img 
                                src={img.src} 
                                alt={img.title} 
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-white font-serif text-2xl font-bold tracking-wide">{img.title}</span>
                            </div>
                        </Link>
                    </FadeIn>
                ))}
            </div>
        </section>
    )
}

const FinalCTA = () => {
    const { isDarkMode } = useTheme();

    return (
        <section className={`relative py-32 ${isDarkMode ? 'bg-stone-950' : 'bg-white'} px-4 overflow-hidden`}>
             {/* Reliable subtle background texture */}
             <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop')] opacity-5 bg-cover bg-center ${isDarkMode ? '' : ''}`}></div>
             {/* Gradient Blob */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-200 rounded-full blur-[120px] opacity-30"></div>

             <div className="max-w-4xl mx-auto text-center relative z-10">
                <FadeIn>
                    <h2 className={`font-serif text-5xl md:text-7xl font-bold mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        Let's Create <br/> Something <span className="text-gold-600">Iconic.</span>
                    </h2>
                    <p className={`text-xl mb-12 max-w-2xl mx-auto ${isDarkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                        Your story deserves to be told with excellence. Join the hundreds of clients who trust Lenny Media.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/booking" className={`px-10 py-5 font-bold text-lg rounded-full shadow-2xl hover:scale-105 transition-all duration-300 ${isDarkMode ? 'bg-stone-800 text-white hover:bg-gold-600' : 'bg-stone-900 text-white hover:bg-gold-500 hover:text-stone-900'}`}>
                            Book Your Session
                        </Link>
                        <Link to="/quote" className={`px-10 py-5 border-2 font-bold text-lg rounded-full transition-all duration-300 ${isDarkMode ? 'bg-white text-stone-900 border-stone-700 hover:border-stone-900' : 'bg-white text-stone-900 border-stone-200 hover:border-stone-900'}`}>
                            Get a Quote
                        </Link>
                    </div>
                </FadeIn>
             </div>
        </section>
    )
}

const Home = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`w-full overflow-x-hidden font-sans ${isDarkMode ? 'bg-stone-950' : 'bg-white'}`}>
      <Hero />
      <Marquee />
      <AboutSection />
      <ServicesSection />
      <GallerySection />
      <FinalCTA />
    </div>
  );
};

export default Home;