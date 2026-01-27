import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 font-serif">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5EBDD] to-[#FAF9F6]">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-[#2E4A3D]">
              <path d="M50 0 Q75 25 100 50 Q75 75 50 100 Q25 75 0 50 Q25 25 50 0 Z" />
            </svg>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 relative">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="h-1 w-12 bg-[#B85C38] mr-4"></div>
              <span className="text-[#B85C38] font-bold tracking-widest uppercase text-sm">
                About Us
              </span>
              <div className="h-1 w-12 bg-[#B85C38] ml-4"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#2E4A3D] mb-6">
              Our Divine Mission
            </h1>
            <p className="text-lg text-[#666666] max-w-2xl mx-auto">
              Spreading the light of knowledge through the sacred words of the Quran
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#F5EBDD]">
            {/* Decorative Header */}
            <div className="bg-gradient-to-r from-[#2E4A3D] to-[#1a3328] p-6">
              <div className="flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-[#D4A373]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</h2>
                  <p className="text-[#D4A373] font-arabic text-lg">"Read in the name of your Lord who created"</p>
                  <p className="text-gray-300 text-sm mt-2">- Surah Al-Alaq (96:1)</p>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8 md:p-12">
              <div className="max-w-4xl mx-auto">
                {/* Introduction */}
                <div className="mb-10">
                  <div className="flex items-center mb-6">
                    <div className="h-0.5 w-8 bg-[#B85C38] mr-4"></div>
                    <h3 className="text-2xl font-bold text-[#2E4A3D]">The First Command</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    The very first revelation to Prophet Muhammad ﷺ was the command to <span className="font-bold text-[#2E4A3D]">READ</span>. 
                    This divine instruction marked the beginning of a revolution in knowledge, education, and spiritual enlightenment.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Inspired by this sacred command, <span className="font-bold text-[#B85C38]">Iqra4All</span> was established with a singular purpose: 
                    to facilitate access to Islamic knowledge for those who need it most.
                  </p>
                </div>

                {/* Our Purpose */}
                <div className="mb-10 bg-[#F5EBDD]/30 p-8 rounded-xl border-l-4 border-[#D4A373]">
                  <h3 className="text-2xl font-bold text-[#2E4A3D] mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-[#B85C38]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z"/>
                      <path d="M11 16h2v2h-2zM11 10h2v4h-2z"/>
                    </svg>
                    Our Divine Purpose
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="text-[#B85C38] text-2xl mr-3 mt-1">•</span>
                        <div>
                          <h4 className="font-bold text-[#2E4A3D] mb-2">Distribution of Quran</h4>
                          <p className="text-gray-700">
                            Providing Masahif (Quran copies) to communities with limited access to Islamic literature
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-[#B85C38] text-2xl mr-3 mt-1">•</span>
                        <div>
                          <h4 className="font-bold text-[#2E4A3D] mb-2">Islamic Education</h4>
                          <p className="text-gray-700">
                            Supplying educational books to Quran Madaris and Islamic schools across East Africa
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="text-[#B85C38] text-2xl mr-3 mt-1">•</span>
                        <div>
                          <h4 className="font-bold text-[#2E4A3D] mb-2">Global Connection</h4>
                          <p className="text-gray-700">
                            Connecting generous donors worldwide with deserving recipients in need of Islamic knowledge
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="text-[#B85C38] text-2xl mr-3 mt-1">•</span>
                        <div>
                          <h4 className="font-bold text-[#2E4A3D] mb-2">Mosque Support</h4>
                          <p className="text-gray-700">
                            Supporting mosques with essential Islamic literature for their communities
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Information */}
                <div className="mb-10">
                  <div className="flex items-center mb-6">
                    <div className="h-0.5 w-8 bg-[#B85C38] mr-4"></div>
                    <h3 className="text-2xl font-bold text-[#2E4A3D]">Our Platform</h3>
                  </div>
                  <div className="bg-white border border-[#F5EBDD] rounded-xl p-8 shadow-sm">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      Our platform serves as a bridge between compassionate donors and communities in need. 
                      Through our website, individuals can purchase Quran copies and Islamic books that are 
                      then delivered directly to Quran Madaris and mosques in Tanzania and across East Africa.
                    </p>
                    <div className="flex flex-wrap gap-4 mb-6">
                      <span className="px-4 py-2 bg-[#2E4A3D] text-white text-sm font-bold rounded-full">
                        Quran Distribution
                      </span>
                      <span className="px-4 py-2 bg-[#B85C38] text-white text-sm font-bold rounded-full">
                        Islamic Books
                      </span>
                      <span className="px-4 py-2 bg-[#D4A373] text-white text-sm font-bold rounded-full">
                        Educational Support
                      </span>
                      <span className="px-4 py-2 bg-[#A3B18A] text-white text-sm font-bold rounded-full">
                        Mosque Aid
                      </span>
                    </div>
                  </div>
                </div>

                {/* Supported By Section */}
                <div className="bg-gradient-to-r from-[#F5EBDD] to-[#e8dfcd] p-8 rounded-xl">
                  <div className="flex items-center mb-6">
                    <svg className="w-8 h-8 text-[#B85C38] mr-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z"/>
                    </svg>
                    <h3 className="text-2xl font-bold text-[#2E4A3D]">Supported By</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      This noble initiative is supported by <span className="font-bold text-[#B85C38]">Istiqama International Muslim Charitable Organization</span>, 
                      a respected organization dedicated to serving Muslim communities worldwide.
                    </p>
                    <div className="mt-6">
                      <a 
                        href="https://istiqama.om/#" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-[#2E4A3D] text-white font-bold rounded-lg hover:bg-[#1e3529] transition-colors duration-300 shadow-md"
                      >
                        <span>Visit Istiqama Organization</span>
                        <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Final Note */}
                <div className="mt-12 text-center">
                  <div className="text-[#B85C38] font-bold text-sm tracking-widest uppercase mb-4">
                    Join Our Journey
                  </div>
                  <p className="text-gray-700 max-w-2xl mx-auto text-lg">
                    Together, we can spread the light of Quranic knowledge and support Islamic education 
                    for generations to come. Every book you donate brings someone closer to their Creator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default AboutPage;