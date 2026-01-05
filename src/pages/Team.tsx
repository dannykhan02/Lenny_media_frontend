import React, { useState } from 'react';
import { Camera, Video, Award, Users, Star, ArrowRight, Instagram, Twitter, Linkedin, ChevronDown, ChevronUp, Sparkles, Zap, Heart, MessageCircle } from 'lucide-react';

const Team = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [expandedBio, setExpandedBio] = useState({});

  const teamMembers = [
    {
      id: 1,
      name: "David Ochieng",
      role: "Lead Photographer & Creative Director",
      specialty: "Wedding & Portrait Photography",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
      bio: "With over 10 years of experience capturing life's most precious moments, David brings an artistic vision and technical mastery to every project. His passion for storytelling through imagery has made him one of Juja's most sought-after photographers.",
      achievements: ["500+ Weddings Captured", "Featured in Kenya Wedding Magazine", "International Photography Awards Winner"],
      skills: ["Portrait Photography", "Wedding Coverage", "Studio Lighting", "Photo Editing"],
      social: {
        instagram: "@david_lens",
        twitter: "@davidphotos",
        linkedin: "david-ochieng"
      },
      stats: {
        projects: "800+",
        experience: "10 Years",
        rating: "5.0"
      }
    },
    {
      id: 2,
      name: "Sarah Kimani",
      role: "Senior Videographer",
      specialty: "Cinematic Wedding Films & Events",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
      bio: "Sarah's cinematic approach to videography transforms events into timeless films. Her attention to detail and ability to capture genuine emotions has earned her recognition across East Africa.",
      achievements: ["300+ Event Films", "Best Videographer Award 2023", "Corporate Client Portfolio"],
      skills: ["Cinematic Filming", "Drone Operations", "Video Editing", "Color Grading"],
      social: {
        instagram: "@sarah_films",
        twitter: "@sarahvideo",
        linkedin: "sarah-kimani"
      },
      stats: {
        projects: "500+",
        experience: "7 Years",
        rating: "4.9"
      }
    },
    {
      id: 3,
      name: "James Mwangi",
      role: "Commercial Photographer",
      specialty: "Product & Brand Photography",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
      bio: "James specializes in bringing products to life through creative commercial photography. His work with major brands has helped businesses elevate their visual identity and drive sales.",
      achievements: ["100+ Brand Collaborations", "E-commerce Specialist", "Advertising Campaign Expert"],
      skills: ["Product Photography", "Studio Setup", "Commercial Lighting", "Brand Strategy"],
      social: {
        instagram: "@james_commercial",
        twitter: "@jamesmwangi",
        linkedin: "james-mwangi"
      },
      stats: {
        projects: "600+",
        experience: "8 Years",
        rating: "5.0"
      }
    },
    {
      id: 4,
      name: "Grace Wanjiru",
      role: "Portrait & Fashion Photographer",
      specialty: "Editorial & Lifestyle Photography",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
      bio: "Grace's unique perspective in portrait and fashion photography has made her a favorite among models and fashion brands. Her ability to make subjects feel comfortable results in authentic, stunning imagery.",
      achievements: ["Fashion Week Photographer", "Editorial Features", "Celebrity Portraits"],
      skills: ["Fashion Photography", "Portrait Art", "Natural Light", "Creative Direction"],
      social: {
        instagram: "@grace_portraits",
        twitter: "@gracewanjiru",
        linkedin: "grace-wanjiru"
      },
      stats: {
        projects: "400+",
        experience: "6 Years",
        rating: "4.9"
      }
    },
    {
      id: 5,
      name: "Michael Omondi",
      role: "Post-Production Specialist",
      specialty: "Photo & Video Editing",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
      bio: "The magic behind our final deliverables, Michael's expertise in post-production ensures every project meets our premium quality standards. His technical skills and artistic eye bring visions to life.",
      achievements: ["Master Editor Certified", "Color Grading Expert", "Quick Turnaround Specialist"],
      skills: ["Adobe Suite Expert", "Color Correction", "Retouching", "Motion Graphics"],
      social: {
        instagram: "@michael_edits",
        twitter: "@michaelomondi",
        linkedin: "michael-omondi"
      },
      stats: {
        projects: "1000+",
        experience: "9 Years",
        rating: "5.0"
      }
    },
    {
      id: 6,
      name: "Lucy Akinyi",
      role: "Events Coordinator & Photographer",
      specialty: "Event Management & Coverage",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop",
      bio: "Lucy seamlessly blends event coordination with photography, ensuring every moment is captured while managing the flow of events. Her organizational skills and photographic talent make her invaluable.",
      achievements: ["200+ Corporate Events", "Perfect Event Record", "Client Satisfaction Champion"],
      skills: ["Event Photography", "Project Management", "Client Relations", "Timeline Coordination"],
      social: {
        instagram: "@lucy_events",
        twitter: "@lucyakinyi",
        linkedin: "lucy-akinyi"
      },
      stats: {
        projects: "350+",
        experience: "5 Years",
        rating: "4.9"
      }
    }
  ];

  const values = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Excellence in Craft",
      description: "We pursue perfection in every shot, every frame, every project. Our commitment to quality is unwavering."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Client-First Approach",
      description: "Your vision drives our work. We listen, collaborate, and deliver beyond expectations every time."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Creative Innovation",
      description: "We stay ahead of trends, embrace new techniques, and push creative boundaries to deliver unique results."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Teamwork & Collaboration",
      description: "Our diverse team brings together different perspectives, skills, and talents to create magic."
    }
  ];

  const toggleBio = (id) => {
    setExpandedBio(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderMemberCard = (member) => {
    const isExpanded = expandedBio[member.id];
    const isSelected = selectedMember?.id === member.id;

    return (
      <div
        key={member.id}
        className={`group relative rounded-3xl overflow-hidden transition-all duration-500 ${
          isSelected ? 'ring-4 ring-gold-500 scale-105' : ''
        } bg-gradient-to-br from-stone-800 to-stone-900 hover:from-stone-700 hover:to-stone-800 shadow-xl hover:shadow-2xl cursor-pointer`}
        onClick={() => setSelectedMember(isSelected ? null : member)}
      >
        {/* Image Section */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent"></div>
          
          {/* Floating Stats */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="bg-gold-500 text-stone-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3 fill-stone-900" />
              {member.stats.rating}
            </div>
          </div>

          {/* Name & Role Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white font-serif text-2xl font-bold mb-1">
              {member.name}
            </h3>
            <p className="text-gold-400 font-bold text-sm uppercase tracking-wider">
              {member.role}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Specialty Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-stone-700 text-gold-400">
            <Zap className="w-3 h-3" />
            {member.specialty}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-stone-700/50">
              <div className="text-xl font-bold text-gold-400">
                {member.stats.projects}
              </div>
              <div className="text-xs text-stone-400">
                Projects
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-stone-700/50">
              <div className="text-xl font-bold text-gold-400">
                {member.stats.experience}
              </div>
              <div className="text-xs text-stone-400">
                Experience
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-stone-700/50">
              <div className="text-xl font-bold text-gold-400">
                {member.stats.rating}
              </div>
              <div className="text-xs text-stone-400">
                Rating
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <p className={`text-sm leading-relaxed text-stone-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {member.bio}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBio(member.id);
              }}
              className="mt-2 text-xs font-bold flex items-center gap-1 text-gold-400 hover:text-gold-300"
            >
              {isExpanded ? (
                <>Show Less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Read More <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          </div>

          {/* Achievements */}
          {isExpanded && (
            <div className="space-y-3 animate-[fadeIn_0.5s]">
              <h4 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Key Achievements
              </h4>
              <div className="space-y-2">
                {member.achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-stone-300">
                      {achievement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {member.skills.slice(0, isExpanded ? member.skills.length : 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-medium bg-stone-700 text-stone-300"
              >
                {skill}
              </span>
            ))}
            {!isExpanded && member.skills.length > 3 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gold-500/20 text-gold-400">
                +{member.skills.length - 3} more
              </span>
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-stone-700">
            <a
              href={`https://instagram.com/${member.social.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full transition-all hover:bg-stone-700 text-stone-400 hover:text-gold-400"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={`https://twitter.com/${member.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full transition-all hover:bg-stone-700 text-stone-400 hover:text-gold-400"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={`https://linkedin.com/in/${member.social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full transition-all hover:bg-stone-700 text-stone-400 hover:text-gold-400"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans bg-stone-950">
      {/* Hero Section */}
      <div className="relative min-h-[85vh] w-full overflow-hidden bg-stone-900 text-white flex items-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?q=80&w=2000&auto=format&fit=crop" 
            alt="Team at Work" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block py-1 px-3 border border-gold-500 rounded-full text-gold-400 text-sm font-medium tracking-widest uppercase mb-6 bg-black/30 backdrop-blur-sm">
            Meet the Lenny Media Team
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight max-w-4xl">
            The Creative Minds Behind <br/> <span className="text-gold-500">Your Story</span>
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mb-10 font-light leading-relaxed">
            Our diverse team of passionate professionals brings together decades of experience, creative vision, and technical excellence to capture your most important moments.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <button
              onClick={() => scrollToSection('team')}
              className="px-8 py-4 bg-gold-500 hover:bg-gold-400 text-stone-900 font-bold rounded-full transition-all hover:scale-105 flex items-center justify-center gap-2 text-lg shadow-lg shadow-gold-500/20"
            >
              Meet Our Team
            </button>
            <button
              onClick={() => scrollToSection('values')}
              className="px-8 py-4 bg-white/10 border-2 border-white/50 text-white font-bold rounded-full hover:bg-white hover:text-stone-900 transition-all flex items-center justify-center gap-2 text-lg backdrop-blur-sm"
            >
              Our Values
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 px-4 bg-stone-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "3,000+", label: "Projects Completed" },
              { number: "15+", label: "Years Combined Experience" },
              { number: "500+", label: "Happy Clients" },
              { number: "4.9/5", label: "Average Rating" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-gold-400">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-stone-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div id="team" className="py-24 px-4 scroll-mt-24 bg-stone-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-bold uppercase tracking-widest text-sm mb-2 block">Our Studio</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
              Meet the Artists
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-stone-400">
              Click on any team member to learn more about their expertise and achievements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map(renderMemberCard)}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div id="values" className="py-24 px-4 bg-stone-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
              What Drives Us
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-stone-400">
              The core values that guide our work and relationships
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl text-center group hover:-translate-y-2 transition-all duration-300 bg-stone-800 hover:bg-stone-750 shadow-lg"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-stone-700 text-gold-400 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">
                  {value.title}
                </h3>
                <p className="leading-relaxed text-stone-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500 rounded-full blur-[150px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-stone-300 mb-10 font-light max-w-2xl mx-auto">
            Let our experienced team bring your vision to life. Book a consultation or visit our studio today.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button className="inline-flex items-center gap-3 bg-gold-500 text-stone-900 px-10 py-5 rounded-full font-bold text-lg hover:bg-gold-600 transition-all duration-300 shadow-xl justify-center">
              Book a Consultation <ArrowRight className="w-5 h-5" />
            </button>
            <button className="inline-flex items-center gap-3 px-10 py-5 border-2 border-white/50 text-white font-bold rounded-full hover:bg-white hover:text-stone-900 transition-all text-lg backdrop-blur-sm justify-center">
              Visit Our Studio <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/254705459768?text=Hello%20Lenny%20Media!%20I%27d%20like%20to%20inquire%20about%20your%20services."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 group"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
        <span className="absolute right-full mr-3 bg-stone-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Chat with us
        </span>
      </a>
    </div>
  );
};

export default Team;