import React, { useState } from 'react';
import { Send, CheckCircle, User, Mail, Phone, Camera, BookOpen, Star, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Enrollment: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    education: '',
    experience: '',
    hasCamera: 'No',
    goals: '',
    intakeMonth: 'Next Available'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        <div className={`min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'} flex items-center justify-center px-4 relative overflow-hidden font-sans`}>
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className={`max-w-xl w-full ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-gold-100'} rounded-3xl p-12 text-center shadow-2xl relative z-10 animate-[fadeIn_0.5s_ease-out]`}>
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className={`font-serif text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'} mb-6`}>Application Received!</h2>
            <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-600'} mb-10 text-lg leading-relaxed`}>
                Thank you, <strong>{formData.fullName}</strong>. Your enrollment application for the Lenny Media School of Photography has been received. Our admissions team will contact you at <strong>{formData.phone}</strong> within 24 hours to schedule an interview or finalize your registration.
            </p>
            <div className="flex justify-center gap-4">
                <Link 
                    to="/school" 
                    className={`px-8 py-3 ${isDarkMode ? 'bg-stone-800 text-white hover:bg-gold-500 hover:text-stone-900' : 'bg-stone-900 text-white hover:bg-gold-500 hover:text-stone-900'} rounded-full font-bold transition-all`}
                >
                    Back to School Page
                </Link>
            </div>
            </div>
        </div>
      );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'} font-sans`}>
      <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-stone-900'} pt-36 pb-32 px-4 text-center relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500 rounded-full blur-[150px] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className={`inline-block py-1 px-3 border border-gold-500/30 rounded-full text-gold-400 text-xs font-bold tracking-widest mb-6 ${isDarkMode ? 'bg-stone-800/50 backdrop-blur-md' : 'bg-white/5 backdrop-blur-md'}`}>
            Student Intake
          </span>
          <h1 className={`font-serif text-5xl md:text-7xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-6 leading-tight`}>
            Join the Next Cohort
          </h1>
          <p className={`${isDarkMode ? 'text-stone-300' : 'text-stone-300'} text-xl max-w-2xl mx-auto font-light leading-relaxed`}>
            Take the first step towards a professional career in photography. Fill out the application below.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-24 relative z-20">
        <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'} rounded-[2rem] shadow-2xl overflow-hidden border`}>
            <div className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-8 border-b border-stone-100 pb-4">
                    <BookOpen className="w-6 h-6 text-gold-500" />
                    <h2 className={`font-serif text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Student Application Form</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="group">
                        <label className={`text-xs font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} uppercase tracking-wide mb-1.5 block`}>Full Name</label>
                        <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all`} placeholder="John Doe" />
                    </div>
                    <div className="group">
                        <label className={`text-xs font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} uppercase tracking-wide mb-1.5 block`}>Age</label>
                        <input required type="number" name="age" value={formData.age} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all`} placeholder="e.g. 24" />
                    </div>
                    <div className="group">
                        <label className={`text-xs font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} uppercase tracking-wide mb-1.5 block`}>Phone Number</label>
                        <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all`} placeholder="0700 000 000" />
                    </div>
                     <div className="group">
                        <label className={`text-xs font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} uppercase tracking-wide mb-1.5 block`}>Email Address</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all`} placeholder="john@example.com" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     <div className="group">
                        <label className={`text-xs font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} uppercase tracking-wide mb-1.5 block`}>Education / Occupation</label>
                        <input type="text" name="education" value={formData.education} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all`} placeholder="e.g. University Student / Graphic Designer" />
                    </div>
                    <div className="group">
                        <label className={`text-xs font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} uppercase tracking-wide mb-1.5 block`}>Experience Level</label>
                        <select name="experience" value={formData.experience} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all`}>
                            <option value="">Select Level...</option>
                            <option value="Beginner">Total Beginner</option>
                            <option value="Hobbyist">Hobbyist (Know basics)</option>
                            <option value="Intermediate">Intermediate</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="group">
                        <label className={`text-xs font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} uppercase tracking-wide mb-1.5 block`}>Do you own a camera?</label>
                        <select name="hasCamera" value={formData.hasCamera} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all`}>
                            <option value="No">No, I will use school equipment</option>
                            <option value="Yes">Yes, I have my own</option>
                        </select>
                    </div>
                     <div className="group">
                        <label className={`text-xs font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} uppercase tracking-wide mb-1.5 block`}>Preferred Intake</label>
                        <select name="intakeMonth" value={formData.intakeMonth} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all`}>
                            <option value="Next Available">Next Available Cohort</option>
                            <option value="Next Month">Next Month</option>
                            <option value="Flexible">I'm Flexible</option>
                        </select>
                    </div>
                </div>

                <div className="group mb-10">
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} uppercase tracking-wide mb-1.5 block`}>Why do you want to join this course?</label>
                    <textarea name="goals" rows={4} value={formData.goals} onChange={handleChange} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-stone-700 border-stone-600' : 'bg-stone-50 border-stone-200'} rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all placeholder-stone-400`} placeholder="Tell us about your goals (e.g. Start a business, Hobby, Employment)..."></textarea>
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full ${isDarkMode ? 'bg-stone-800 text-white' : 'bg-stone-900 text-white'} font-bold text-lg py-5 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:bg-gold-500 hover:text-stone-900 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-75 cursor-wait' : ''}`}
                >
                    {isSubmitting ? 'Submitting Application...' : (
                        <>
                            Submit Application <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </button>
                <p className={`text-center text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-400'} mt-6`}>
                    By submitting this form, you agree to our terms of enrollment. A non-refundable registration fee may apply upon acceptance.
                </p>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Enrollment;