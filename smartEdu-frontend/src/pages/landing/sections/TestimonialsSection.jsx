import React from "react";
import { Quote, Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Leslie Boatwright",
      position: "CEO",
      company: "HillStreet Industries",
      avatar: "LB",
      content:
        "Their creativity, attention to detail, and ability to bring our vision to life made us feel like we finally had a partner who got it.",
      rating: 5,
    },
    {
      name: "Carly Ferris",
      position: "Founder",
      company: "Vivarily",
      avatar: "CF",
      content:
        "The team at Creative Studio + Lab took our scattered ideas and turned them into a polished, cohesive brand identity.",
      rating: 5,
    },
    {
      name: "Gabriel Shelby",
      position: "Owner",
      company: "Stipple Unlimited",
      avatar: "GS",
      content:
        "I've worked with other agencies before, but Creative Studio + Lab delivered fresh, creative concepts that blew us away.",
      rating: 5,
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Apa Kata Mereka
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dipercaya oleh ribuan sekolah di seluruh Indonesia
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card card-hover relative">
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.position}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              1000+
            </div>
            <div className="text-gray-600">Sekolah</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
            <div className="text-gray-600">Siswa</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">5K+</div>
            <div className="text-gray-600">Guru</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">99%</div>
            <div className="text-gray-600">Kepuasan</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
