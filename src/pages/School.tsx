import React from 'react';
import { Camera, BookOpen, Users, Award, CheckCircle, ArrowRight, Zap, Sun, Layout, Briefcase, DollarSign, Calendar, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const School: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  const curriculum = [
    {
      week: "WEEK 1",
      title: "Photography Foundations & Camera Mastery",
      icon: <Camera className="w-6 h-6" />,
      description: "Build a solid technical foundation. Understand your gear and master the exposure triangle.",
      lessons: [
        "Introduction to Photography & Career Opportunities",
        "Understanding Cameras (DSLR vs Mirrorless)",
        "Exposure Triangle: ISO, Aperture, Shutter Speed",
        "Manual vs Auto Modes",
        "Lenses, Focal Lengths & Proper Handling"
      ],
      practical: "Manual mode practice & Exposure control exercises"
    },
    {
      week: "WEEK 2",
      title: "Composition, Lighting & Creative Skills",
      icon: <Sun className="w-6 h-6" />,
      description: "Learn to see light and frame your shots artistically to create visually compelling images.",
      lessons: [
        "Composition Rules: Thirds, Leading Lines, Symmetry",
        "Natural Light: Golden Hour & Indoor Techniques",
        "Studio Lighting Basics: LEDs, Softboxes, Ring Lights",
        "Light Positioning & Background Setup"
      ],
      practical: "Portrait shoot (Studio & Outdoor)"
    },
    {
      week: "WEEK 3",
      title: "Specialization & Real-World Photography",
      icon: <Layout className="w-6 h-6" />,
      description: "Dive into specific genres. Learn how to handle portraits, events, and products professionally.",
      lessons: [
        "Portrait & Studio: Posing, Passports & Communication",
        "Event Photography: Weddings, Corporate & Emotions",
        "Commercial Basics: Product & Brand Photography",
        "Social Media Content Creation"
      ],
      practical: "Graduation-style shoot & Product photography setup"
    },
    {
      week: "WEEK 4",
      title: "Editing, Business & Portfolio Building",
      icon: <Briefcase className="w-6 h-6" />,
      description: "Polish your work and prepare for the market. Learn editing workflows and business basics.",
      lessons: [
        "Editing Workflow: Lightroom & Photoshop Basics",
        "Color Correction, Retouching & File Formats",
        "Business: Pricing, Contracts & Finding Clients",
        "Branding: Instagram & WhatsApp Marketing"
      ],
      practical: "Portfolio selection & Final photoshoot project"
    }
  ];

  const benefits = [
    "Hands-on practical training",
    "Access to studio equipment",
    "Real photoshoots",
    "Certificate of Completion",
    "Portfolio guidance",
    "Business & monetization skills"
  ];

  const idealCandidates = [
    "Beginners with no experience",
    "Content creators & influencers",
    "Students & entrepreneurs",
    "Anyone passionate about photography"
  ];

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-stone-950' : 'bg-white'}`}>
      {/* Hero Section */}
      <div className="relative min-h-[90vh] md:h-[85vh] w-full overflow-hidden bg-stone-900 text-white flex items-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2000&auto=format&fit=crop" 
            alt="Photography Students" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center md:items-start text-center md:text-left py-20 md:py-0">
            
            {/* Glowing Intake CTA - Enhanced Size & Visibility */}
            <div className="mb-12 flex flex-col items-center md:items-start animate-[fadeIn_0.8s_ease-out] w-full md:w-auto">
                <Link to="/enrollment" className="relative inline-flex group transform hover:scale-105 transition-transform duration-300 max-w-full">
                    <div className="absolute transition-all duration-1000 opacity-80 -inset-1 bg-gradient-to-r from-gold-500 via-yellow-400 to-gold-600 rounded-full blur-lg group-hover:opacity-100 group-hover:blur-xl group-hover:duration-200 animate-pulse"></div>
                    <div className="relative inline-flex items-center justify-center px-8 md:px-12 py-5 text-lg font-bold text-stone-900 transition-all duration-200 bg-white font-pj rounded-full focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-gray-900 ring-2 ring-gold-500 shadow-2xl border-2 border-white">
                        <span className="flex h-4 w-4 mr-3 md:mr-4 relative flex-shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 shadow-lg"></span>
                        </span>
                        <div className="flex flex-col md:flex-row md:items-center leading-none md:leading-normal">
                             <span className="uppercase tracking-widest font-black text-lg md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-700 drop-shadow-sm whitespace-nowrap">INTAKE ONGOING</span>
                             <span className="hidden md:inline mx-4 text-stone-300 text-2xl font-light">|</span>
                             <span className="md:hidden text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Join Next Month</span>
                             <span className="hidden md:inline text-stone-600 group-hover:text-gold-600 transition-colors font-medium text-lg">Join Next Month's Cohort</span>
                        </div>
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform text-gold-600 hidden md:block" strokeWidth={3} />
                    </div>
                </Link>
                <div className="mt-4 text-gold-400 text-xs font-bold font-mono uppercase tracking-widest animate-pulse bg-black/40 px-3 py-1 rounded-full md:bg-transparent md:p-0">
                    Limited Spots Available
                </div>
            </div>

            <span className="inline-block py-1 px-3 border border-gold-500 w-fit rounded-full text-gold-400 text-sm font-medium tracking-widest uppercase mb-6 bg-black/30 backdrop-blur-sm">
                Lenny Media School of Photography
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight max-w-3xl">
                Turn Your Passion Into <br/> <span className="text-gold-500">A Profession.</span>
            </h1>
            <p className="text-xl text-stone-300 max-w-xl mb-10 font-light leading-relaxed">
                Join Juja's premier creative academy. Master the art of visual storytelling with hands-on training from industry experts at Juja Square.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                <a href="#curriculum" className="px-8 py-4 bg-gold-500 hover:bg-gold-400 text-stone-900 font-bold rounded-full transition-all hover:scale-105 flex items-center justify-center gap-2 text-lg shadow-lg shadow-gold-500/20">
                    View Curriculum
                </a>
                <Link to="/enrollment" className="px-8 py-4 bg-white/10 border-2 border-white/50 text-white font-bold rounded-full hover:bg-white hover:text-stone-900 transition-all flex items-center justify-center gap-2 text-lg backdrop-blur-sm">
                    Enroll Now
                </Link>
            </div>
        </div>
      </div>

      {/* Course Overview Intro */}
      <div id="overview" className={`pt-20 pb-10 px-4 scroll-mt-24 ${isDarkMode ? 'bg-stone-950' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto text-center">
            <h2 className={`font-serif text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Intensive Photography Course</h2>
            <p className={`text-xl leading-relaxed mb-8 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                This intensive one-month course focuses on <span className="text-gold-600 font-bold">hands-on photography skills</span>, camera mastery, composition, lighting, editing, and real-world shooting. Students will graduate with confidence, a small portfolio, and practical knowledge they can immediately monetize.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-12">
                <div className={`p-6 rounded-2xl border flex items-start gap-4 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                    <div className={`p-3 rounded-full shadow-sm text-gold-500 ${isDarkMode ? 'bg-stone-800' : 'bg-white'}`}><Calendar className="w-6 h-6"/></div>
                    <div>
                        <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Duration</h4>
                        <p className={isDarkMode ? 'text-stone-300' : 'text-stone-600'}>4 Weeks (Intensive)</p>
                    </div>
                </div>
                <div className={`p-6 rounded-2xl border flex items-start gap-4 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                     <div className={`p-3 rounded-full shadow-sm text-gold-500 ${isDarkMode ? 'bg-stone-800' : 'bg-white'}`}><DollarSign className="w-6 h-6"/></div>
                    <div>
                        <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Investment</h4>
                        <p className={isDarkMode ? 'text-stone-300' : 'text-stone-600'}>Ksh 15,000</p>
                    </div>
                </div>
                <div className={`p-6 rounded-2xl border flex items-start gap-4 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                     <div className={`p-3 rounded-full shadow-sm text-gold-500 ${isDarkMode ? 'bg-stone-800' : 'bg-white'}`}><Award className="w-6 h-6"/></div>
                    <div>
                        <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Certification</h4>
                        <p className={isDarkMode ? 'text-stone-300' : 'text-stone-600'}>Certificate of Completion</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Benefits & Ideal For Section */}
      <div className={`py-20 px-4 mt-10 ${isDarkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
                {/* Benefits */}
                <div className={`p-10 rounded-3xl shadow-sm border relative overflow-hidden ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-20"></div>
                    <h3 className={`font-serif text-3xl font-bold mb-8 flex items-center gap-3 relative z-10 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                        What Students Get
                    </h3>
                    <ul className="space-y-6 relative z-10">
                        {benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-4 group">
                                <div className={`p-1.5 rounded-full text-green-600 mt-0.5 group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <span className={`text-lg font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Ideal For */}
                <div className="flex flex-col justify-center">
                    <div className={`inline-block p-2 rounded-lg w-fit mb-4 ${isDarkMode ? 'bg-gold-900/30' : 'bg-gold-100'}`}>
                        <Users className="w-6 h-6 text-gold-600" />
                    </div>
                    <h3 className={`font-serif text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Ideal For</h3>
                    <p className={`text-lg mb-8 leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                        This course is crafted to bridge the gap between passion and profession. Whether you are picking up a camera for the first time or looking to sharpen your skills for business, this program is for:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {idealCandidates.map((candidate, idx) => (
                            <div key={idx} className={`p-5 rounded-2xl border shadow-sm flex items-center gap-3 hover:border-gold-500 hover:shadow-md transition-all ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}>
                                <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
                                <span className={`font-bold text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>{candidate}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Curriculum Breakdown */}
      <div id="curriculum" className={`py-24 px-4 scroll-mt-24 ${isDarkMode ? 'bg-stone-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <span className="text-gold-500 font-bold uppercase tracking-widest text-sm mb-2 block">Syllabus</span>
                <h2 className={`font-serif text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Course Outline</h2>
                <p className={isDarkMode ? 'text-stone-400' : 'text-stone-500'}>A structured path from basics to business.</p>
            </div>

            <div className="space-y-8">
                {curriculum.map((module, idx) => (
                    <div key={idx} className={`rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border relative overflow-hidden group ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
                        <div className="absolute top-0 left-0 w-2 h-full bg-gold-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
                            {/* Week Header */}
                            <div className="lg:w-1/4 flex-shrink-0">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-4 ${isDarkMode ? 'bg-stone-800 text-gold-400' : 'bg-stone-900 text-gold-500'}`}>
                                    {module.icon} {module.week}
                                </div>
                                <h3 className={`font-serif text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{module.title}</h3>
                                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{module.description}</p>
                            </div>

                            {/* Divider (Desktop) */}
                            <div className={`hidden lg:block w-px self-stretch ${isDarkMode ? 'bg-stone-700' : 'bg-stone-200'}`}></div>

                            {/* Lessons */}
                            <div className="lg:w-1/2">
                                <h4 className={`font-bold mb-4 uppercase text-xs tracking-wider ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Lessons Covered</h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                                    {module.lessons.map((lesson, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2 flex-shrink-0"></div>
                                            <span className={`text-sm ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>{lesson}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Practical */}
                            <div className={`lg:w-1/4 rounded-2xl p-6 border shadow-sm ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                                <h4 className={`font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                                    <Zap className="w-4 h-4 text-gold-600" /> Practical Session
                                </h4>
                                <p className={`text-sm italic ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                                    "{module.practical}"
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center">
                <Link 
                    to="/enrollment"
                    className="inline-flex items-center gap-3 bg-gold-500 text-stone-900 px-10 py-5 rounded-full font-bold text-lg hover:bg-gold-600 transition-all duration-300 shadow-xl"
                >
                    Enroll for This Course <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className={`py-24 px-4 ${isDarkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className={`font-serif text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Why Learn With Us?</h2>
                <p className={`max-w-2xl mx-auto text-lg ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>We don't just teach theory; we train you for the real world.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className={`p-8 rounded-2xl border hover:border-gold-500 transition-colors text-center group shadow-sm ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gold-500 group-hover:text-stone-900 transition-colors shadow-inner ${isDarkMode ? 'bg-stone-700' : 'bg-stone-50'}`}>
                        <Zap className="h-8 w-8 group-hover:text-stone-900" />
                    </div>
                    <h3 className={`font-bold text-xl mb-3 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Hands-On Training</h3>
                    <p className={`leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Access to professional cameras, lenses, and lighting equipment. Learn by doing from day one.</p>
                </div>
                <div className={`p-8 rounded-2xl border hover:border-gold-500 transition-colors text-center group shadow-sm ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gold-500 group-hover:text-stone-900 transition-colors shadow-inner ${isDarkMode ? 'bg-stone-700' : 'bg-stone-50'}`}>
                        <Users className="h-8 w-8 group-hover:text-stone-900" />
                    </div>
                    <h3 className={`font-bold text-xl mb-3 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Expert Mentorship</h3>
                    <p className={`leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Learn directly from Lenny Media's lead photographers with years of field experience in events and studio work.</p>
                </div>
                <div className={`p-8 rounded-2xl border hover:border-gold-500 transition-colors text-center group shadow-sm ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gold-500 group-hover:text-stone-900 transition-colors shadow-inner ${isDarkMode ? 'bg-stone-700' : 'bg-stone-50'}`}>
                        <Award className="h-8 w-8 group-hover:text-stone-900" />
                    </div>
                    <h3 className={`font-bold text-xl mb-3 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Certification</h3>
                    <p className={`leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Receive a recognized certificate upon completion and assistance with building your professional portfolio.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Location / CTA Banner */}
      <div className="py-20 px-4 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500 rounded-full blur-[150px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Visit Our Campus</h2>
            <p className="text-xl text-stone-300 mb-8 font-light">
                Come see our facilities and talk to our instructors. We are located at the heart of Juja.
            </p>
            <div className="inline-block bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 mb-10">
                <p className="text-2xl font-bold text-gold-500 mb-2">Juja Square Building</p>
                <p className="text-lg">1st Floor, Next to the Highway</p>
                <p className="text-stone-400">Juja, Kenya</p>
            </div>
            <div>
                <Link to="/contact" className="inline-flex items-center gap-2 text-white border-b border-gold-500 pb-1 hover:text-gold-500 transition-colors font-bold text-lg">
                    Get Directions <ArrowRight className="h-5 w-5" />
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default School;