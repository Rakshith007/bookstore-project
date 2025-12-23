import React from "react";
import { BookOpen, Eye, Heart } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const teamMembers = [
  {
    name: "Sophia Carter",
    role: "CEO & Founder",
    image: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Ethan Blake",
    role: "Head of Curation",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Olivia Reed",
    role: "Marketing Director",
    image: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Liam Hayes",
    role: "Customer Relations Manager",
    image: "https://i.pravatar.cc/150?img=15",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-serif">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="relative rounded-xl overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80"
            className="w-full h-[350px] object-cover"
            alt="Bookshelf"
          />

          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Story
            </h1>

            <p className="text-white max-w-2xl text-sm md:text-base leading-relaxed mb-6">
              At Novel Nook, we believe in the power of stories to connect,
              inspire, and transform. Our mission is to create a space where
              readers can explore diverse perspectives, discover new worlds,
              and find their next favorite book.
            </p>

            <button className="px-6 py-3 bg-green-700 hover:bg-green-800 transition text-white rounded-lg shadow">
              Explore Our Collection
            </button>
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <h2 className="text-lg font-semibold mb-2 tracking-wide">
          Our Mission
        </h2>

        <h3 className="text-3xl font-bold mb-4">
          Our Mission, Vision, and Values
        </h3>

        <p className="text-gray-700 text-sm md:text-base leading-relaxed max-w-4xl mb-10">
          At Novel Nook, our mission is to curate a diverse collection of books
          that cater to every reader’s taste, fostering a love for reading and
          lifelong learning. Our vision is to be the leading online bookstore,
          known for our exceptional customer service, commitment to quality,
          and dedication to promoting literacy worldwide.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <BookOpen className="w-6 h-6 mb-3 text-gray-800" />
            <h4 className="font-bold text-lg mb-2">Mission</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              To curate a diverse collection of books that foster a love for
              reading and lifelong learning.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <Eye className="w-6 h-6 mb-3 text-gray-800" />
            <h4 className="font-bold text-lg mb-2">Vision</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              To be the leading online bookstore known for quality and service.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <Heart className="w-6 h-6 mb-3 text-gray-800" />
            <h4 className="font-bold text-lg mb-2">Values</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Integrity, inclusivity, and passion for meaningful stories.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="max-w-6xl mx-auto px-4 mb-24">
        <h2 className="text-2xl font-bold mb-6">
          Meet Our Team
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-center">
          {teamMembers.map((member, index) => (
            <div key={index}>
              <img
                src={member.image}
                className="w-28 h-28 rounded-full mx-auto object-cover mb-4"
                alt={member.name}
              />
              <h4 className="font-bold text-lg">
                {member.name}
              </h4>
              <p className="text-sm text-gray-600">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default AboutPage;
