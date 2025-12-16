import React, { useState } from 'react';
import { Camera, Video, Check, Send, Sparkles, User, Mail, Phone, Building, Calendar, MapPin, DollarSign, MessageSquare, Instagram, Facebook, Globe, Search, Layers, ChevronRight, ArrowRight } from 'lucide-react';

interface ServiceOption {
  id: string;
  label: string;
  category: 'photography' | 'videography';
  icon: React.ReactNode;
}

const Quote: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [referralSource, setReferralSource] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    date: '',
    location: '',
    budget: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const services: ServiceOption[] = [
    // Photography
    { id: 'corp-photo', label: 'Corporate Events', category: 'photography', icon: <Building className="w-5 h-5"/> },
    { id: 'wedding-photo', label: 'Wedding & Engagement', category: 'photography', icon: <Sparkles className="w-5 h-5"/> },
    { id: 'studio-photo', label: 'Studio & Portraits', category: 'photography', icon: <Camera className="w-5 h-5"/> },
    { id: 'family-photo', label: 'Family & Parties', category: 'photography', icon: <User className="w-5 h-5"/> },
    { id: 'food-photo', label: 'Food & Commercial', category: 'photography', icon: <Layers className="w-5 h-5"/> },
    { id: 'drone-photo', label: 'Drone Photography', category: 'photography', icon: <Camera className="w-5 h-5"/> },
    // Videography
    { id: 'corp-video', label: 'Corporate Video', category: 'videography', icon: <Video className="w-5 h-5"/> },
    { id: 'wedding-video', label: 'Wedding Films', category: 'videography', icon: <Video className="w-5 h-5"/> },
    { id: 'docu-video', label: 'Documentaries', category: 'videography', icon: <Video className="w-5 h-5"/> },
    { id: 'live-video', label: 'Livestreaming', category: 'videography', icon: <Video className="w-5 h-5"/> },
    { id: 'drone-video', label: 'Aerial Videography', category: 'videography', icon: <Video className="w-5 h-5"/> },
  ];

  const referralOptions = [
    { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-4 h-4" /> },
    { id: 'google', label: 'Google Search', icon: <Search className="w-4 h-4" /> },
    { id: 'friend', label: 'Referral', icon: <User className="w-4 h-4" /> },
    { id: 'website', label: 'Other', icon: <Globe className="w-4 h-4" /> },
  ];

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      window.scrollTo(0, 0);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-xl w-full bg-white rounded-3xl p-12 text-center shadow-2xl border border-gold-100 relative z-10 animate-[fadeIn_0.5s_ease-out]">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Check className="w-12 h-12" />
          </div>
          <h2 className="font-serif text-4xl font-bold text-stone-900 mb-6">Request Sent!</h2>
          <p className="text-stone-600 mb-10 text-lg leading-relaxed">
            Thank you, <strong>{formData.name}</strong>. We have received your request. Our team is currently reviewing your details and will send a personalized proposal to <strong>{formData.email}</strong> shortly.
          </p>
          <div className="flex justify-center gap-4">
            <button 
                onClick={() => setSubmitted(false)} 
                className="px-8 py-3 bg-stone-100 text-stone-600 rounded-full font-bold hover:bg-stone-200 transition-colors"
            >
                New Request
            </button>
            <a 
                href="/" 
                className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-gold-500 hover:text-stone-900 transition-all"
            >
                Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* 1. Redesigned Hero */}
      <div className="bg-stone-900 pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gold-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-stone-700/30 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-left md:w-2/3 animate-[fadeInLeft_0.8s_ease-out]">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-bold tracking-widest uppercase mb-6">
                    <Sparkles className="w-3 h-3" /> Get Started
                </div>
                <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-none">
                    Your Vision. <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-amber-600">Our Expertise.</span>
                </h1>
                <p className="text-stone-400 text-lg md:text-xl max-w-xl font-light leading-relaxed mb-8">
                    Ready to elevate your brand or capture a milestone? We provide tailored visual and marketing solutions. No cookie-cutter packages—just results designed for you.
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-stone-500 font-mono uppercase tracking-wider">
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-gold-500" /> Fast Response</span>
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-gold-500" /> Custom Strategy</span>
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-gold-500" /> Clear Pricing</span>
                </div>
            </div>

            {/* Decorative Process Card */}
            <div className="md:w-1/3 relative hidden md:block animate-[fadeInRight_0.8s_ease-out]">
                 <div className="relative z-10 bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <h3 className="text-white font-serif text-2xl font-bold mb-6 border-b border-white/10 pb-4">The Process</h3>
                    <ul className="space-y-6">
                        <li className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold-500 text-stone-900 font-bold flex items-center justify-center shadow-lg shadow-gold-500/20">1</span>
                            <div>
                                <h4 className="text-white font-bold text-sm">Request</h4>
                                <p className="text-stone-400 text-xs mt-1">Tell us about your project needs.</p>
                            </div>
                        </li>
                         <li className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-800 text-white border border-stone-600 font-bold flex items-center justify-center">2</span>
                            <div>
                                <h4 className="text-white font-bold text-sm">Proposal</h4>
                                <p className="text-stone-400 text-xs mt-1">We craft a custom plan & budget.</p>
                            </div>
                        </li>
                         <li className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-800 text-white border border-stone-600 font-bold flex items-center justify-center">3</span>
                            <div>
                                <h4 className="text-white font-bold text-sm">Create</h4>
                                <p className="text-stone-400 text-xs mt-1">We execute with precision.</p>
                            </div>
                        </li>
                    </ul>
                 </div>
                 {/* Decorative circles behind card */}
                 <div className="absolute -top-4 -right-4 w-20 h-20 bg-gold-500 rounded-full mix-blend-overlay opacity-50 blur-xl"></div>
                 <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500 rounded-full mix-blend-overlay opacity-30 blur-2xl"></div>
            </div>
        </div>
      </div>

      {/* 2. Quick Action Strip */}
      <div className="bg-gold-500 text-stone-900 py-4 px-4 shadow-lg relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
              <p className="font-bold text-base md:text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Not sure what you need? We offer free 15-minute discovery calls.
              </p>
              <a href="tel:+254700123456" className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-white hover:text-stone-900 transition-colors flex items-center gap-2 shadow-md">
                  <Phone className="w-4 h-4" /> Call Us Now
              </a>
          </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-stone-100">
          
          {/* Step 1: Service Selection */}
          <div className="p-8 md:p-16 border-b border-stone-100">
            <div className="mb-10">
                <span className="text-gold-500 font-bold tracking-widest uppercase text-xs mb-2 block">Step 01</span>
                <h3 className="font-serif text-3xl font-bold text-stone-900">What do you need?</h3>
                <p className="text-stone-500 mt-2">Select as many services as applicable by ticking the boxes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Photography Column */}
                <div>
                    <h4 className="flex items-center gap-2 font-bold text-stone-900 mb-6 text-lg">
                        <Camera className="w-5 h-5 text-gold-500" /> Photography
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {services.filter(s => s.category === 'photography').map(service => (
                        <div 
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 flex items-center gap-4 group select-none
                            ${selectedServices.includes(service.id) 
                                ? 'border-gold-500 bg-gold-50/40' 
                                : 'border-stone-100 hover:border-gold-200 hover:bg-stone-50'}`}
                        >
                            {/* Checkbox Visual */}
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200
                                ${selectedServices.includes(service.id) 
                                    ? 'bg-gold-500 border-gold-500 text-stone-900' 
                                    : 'bg-white border-stone-300 group-hover:border-gold-400'}`}
                            >
                                {selectedServices.includes(service.id) && <Check className="w-4 h-4" strokeWidth={4} />}
                            </div>

                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`transition-colors ${selectedServices.includes(service.id) ? 'text-gold-600' : 'text-stone-400 group-hover:text-gold-500'}`}>
                                    {service.icon}
                                </div>
                                <span className={`font-bold text-sm truncate ${selectedServices.includes(service.id) ? 'text-stone-900' : 'text-stone-600'}`}>
                                    {service.label}
                                </span>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Videography Column */}
                <div>
                     <h4 className="flex items-center gap-2 font-bold text-stone-900 mb-6 text-lg">
                        <Video className="w-5 h-5 text-gold-500" /> Videography
                    </h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {services.filter(s => s.category === 'videography').map(service => (
                        <div 
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 flex items-center gap-4 group select-none
                            ${selectedServices.includes(service.id) 
                                ? 'border-gold-500 bg-gold-50/40' 
                                : 'border-stone-100 hover:border-gold-200 hover:bg-stone-50'}`}
                        >
                            {/* Checkbox Visual */}
                             <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200
                                ${selectedServices.includes(service.id) 
                                    ? 'bg-gold-500 border-gold-500 text-stone-900' 
                                    : 'bg-white border-stone-300 group-hover:border-gold-400'}`}
                            >
                                {selectedServices.includes(service.id) && <Check className="w-4 h-4" strokeWidth={4} />}
                            </div>

                             <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`transition-colors ${selectedServices.includes(service.id) ? 'text-gold-600' : 'text-stone-400 group-hover:text-gold-500'}`}>
                                    {service.icon}
                                </div>
                                <span className={`font-bold text-sm truncate ${selectedServices.includes(service.id) ? 'text-stone-900' : 'text-stone-600'}`}>
                                    {service.label}
                                </span>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {selectedServices.length === 0 && (
                <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center justify-center gap-2 animate-pulse">
                    Please tick the boxes for the services you are interested in.
                </div>
            )}
          </div>

          {/* Step 2: Project & Contact Info */}
          <div className="p-8 md:p-16 bg-stone-50/30">
             <div className="mb-10">
                <span className="text-gold-500 font-bold tracking-widest uppercase text-xs mb-2 block">Step 02</span>
                <h3 className="font-serif text-3xl font-bold text-stone-900">Project Details</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-6">
                    <h4 className="font-bold text-stone-900 border-b border-stone-200 pb-2 mb-4">Your Information</h4>
                    
                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all" placeholder="Jane Doe" />
                        </div>
                         <div className="group">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 block">Email Address</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all" placeholder="jane@example.com" />
                        </div>
                        <div className="group">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 block">Phone Number</label>
                            <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all" placeholder="+254 700 000 000" />
                        </div>
                         <div className="group">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 block">Organization (Optional)</label>
                            <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all" placeholder="Company Name" />
                        </div>
                    </div>
                </div>

                {/* Project Details */}
                <div className="lg:col-span-2 space-y-6">
                     <h4 className="font-bold text-stone-900 border-b border-stone-200 pb-2 mb-4">Event / Shoot Details</h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="group">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 block">Preferred Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all" />
                        </div>
                         <div className="group">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 block">Location / Venue</label>
                            <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all" placeholder="e.g. Windsor Golf Club" />
                        </div>
                     </div>

                     <div className="group">
                         <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 block">Budget Range</label>
                         <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                             {['< 20k', '20k - 50k', '50k - 100k', '100k - 250k', '250k +'].map((range) => (
                                 <button 
                                    key={range}
                                    type="button"
                                    onClick={() => setFormData(prev => ({...prev, budget: range}))}
                                    className={`px-2 py-3 rounded-lg text-sm font-medium border transition-all ${formData.budget === range ? 'bg-stone-900 text-gold-500 border-stone-900' : 'bg-white border-stone-200 text-stone-500 hover:border-gold-400'}`}
                                 >
                                     {range}
                                 </button>
                             ))}
                         </div>
                     </div>

                     <div className="group">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 block">Project Description</label>
                        <textarea required name="message" value={formData.message} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all resize-none" placeholder="Tell us about the project vision, specific shots required, or any other questions..."></textarea>
                    </div>
                </div>
            </div>
          </div>

          {/* Referral & Submit */}
          <div className="p-8 md:p-16 border-t border-stone-100 bg-white">
             <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                 <div className="w-full lg:w-auto">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3 block">How did you find us?</label>
                    <div className="flex flex-wrap gap-2">
                    {referralOptions.map(option => (
                        <button
                        key={option.id}
                        type="button"
                        onClick={() => setReferralSource(option.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 border
                            ${referralSource === option.id 
                            ? 'bg-gold-50 text-gold-700 border-gold-200' 
                            : 'bg-stone-50 text-stone-500 border-transparent hover:bg-stone-100'}`}
                        >
                        {option.icon}
                        {option.label}
                        </button>
                    ))}
                    </div>
                 </div>

                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full lg:w-auto bg-gradient-to-r from-gold-500 to-yellow-600 text-white font-bold text-lg px-12 py-5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {isSubmitting ? 'Sending Request...' : (
                        <>
                            Submit Quote Request <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </button>
             </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Quote;