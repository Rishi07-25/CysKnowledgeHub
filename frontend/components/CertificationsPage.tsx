import React, { useState } from "react";
import { X, Award } from "lucide-react";

import { Certification, certificationsData } from "../certificationsData";

interface CategoryProps {
  title: string;
  certifications: Certification[];
  onSelectCert: (cert: Certification) => void;
}

const Category: React.FC<CategoryProps> = ({ title, certifications, onSelectCert }) => {
  const levelStyles = {
    Beginner: "bg-green-900/30 text-green-400 border-green-500/40",
    Intermediate: "bg-yellow-900/30 text-yellow-400 border-yellow-500/40",
    Advanced: "bg-red-900/30 text-red-400 border-red-500/40",
  };

  const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
  const sortedCerts = [...certifications].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-4">
        {title}
        <div className="h-[2px] flex-1 bg-gradient-to-r from-cyan-500/40 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#3b82f6]"></div>
        </div>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-6 sm:gap-y-8 pt-4 pb-16 relative">
        {sortedCerts.map((cert, i) => (
          <div
            key={i}
            className="group relative flex items-center w-full cursor-pointer h-[70px] sm:h-[80px] transform transition-transform duration-300 hover:-translate-y-1"
            onClick={() => onSelectCert(cert)}
          >
            {/* Left Circle (Badge) */}
            <div className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] flex-shrink-0 rounded-full z-20 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_5px_15px_rgba(6,182,212,0.3)] group-hover:scale-105 group-hover:shadow-[0_8px_25px_rgba(6,182,212,0.5)] transition-all duration-300 relative border border-gray-700">
              {/* Inner glow ring */}
              <div className="absolute inset-0 bg-white/30 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="w-[75%] h-[75%] bg-[#12121e] rounded-full flex items-center justify-center p-1.5 shadow-inner relative z-10 border border-[#2a2a40]">
                {cert.badgeUrl ? (
                  <img
                    src={cert.badgeUrl}
                    alt={`${cert.name} badge`}
                    className="w-full h-full object-contain rounded-full drop-shadow-md"
                  />
                ) : (
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                )}
              </div>
            </div>

            {/* Right Rectangle (Content) */}
            <div className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-md py-1 pr-4 sm:pr-6 pl-[45px] sm:pl-[50px] -ml-[35px] sm:-ml-[40px] flex items-center justify-between h-[70px] sm:h-[80px] shadow-lg relative z-10 rounded-r-3xl border border-l-0 border-gray-700 group-hover:border-cyan-500/50 transition-colors duration-300 overflow-hidden">

              {/* Dynamic Glass reflection top highlight */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              {/* Core glow reveal on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"></div>

              {/* Name and Level */}
              <div className="flex flex-col justify-center gap-0.5 relative z-10 flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-gray-100 truncate group-hover:text-cyan-300 transition-colors tracking-wide leading-tight">
                  {cert.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] sm:text-[9px] uppercase font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-sm border max-w-max tracking-wider leading-none ${levelStyles[cert.level]}`}>
                    {cert.level} <span className="mx-1 opacity-40">|</span> {cert.organization}
                  </span>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="relative z-10 flex-shrink-0 ml-3 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-950/60 border border-gray-700/50 group-hover:bg-cyan-500/10 group-hover:border-cyan-400/50 transition-all duration-300 shadow-inner group-hover:shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                <span className="text-gray-400 group-hover:text-cyan-300 transition-colors duration-300 text-sm font-bold flex items-center justify-center transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CertificationsPage: React.FC = () => {
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);


  // Prevent scrolling when modal is open
  React.useEffect(() => {
    if (selectedCert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedCert]);

  return (
    <div className="space-y-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Award className="w-10 h-10 text-cyan-500" /> Professional Certifications Vault
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explore globally recognized certifications across cybersecurity,
          cloud security, system administration, and governance.
        </p>
      </section>

      <div className="space-y-14">
        {certificationsData.map((category, idx) => (
          <Category
            key={idx}
            title={category.title}
            certifications={category.certifications}
            onSelectCert={setSelectedCert}
          />
        ))}
      </div>

      {/* Popup Modal for Certification Details */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md transition-all duration-300">
          {/* Modal Overlay / Backdrop Click */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedCert(null)}></div>

          <div
            className="bg-gradient-to-b from-gray-900 to-gray-950 border border-cyan-500/30 rounded-3xl p-6 md:p-8 w-full max-w-2xl relative shadow-[0_0_50px_-12px_rgba(6,182,212,0.25)] z-10 ring-1 ring-white/10 overflow-hidden"
            style={{ animation: 'cardFloat 0.4s ease-out forwards' }}
          >
            {/* Subtle glow effect behind the card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 p-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 group z-20"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pr-10 relative z-10">
              {selectedCert.badgeUrl ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-2xl group-hover:bg-cyan-400/30 transition-colors"></div>
                  <img
                    src={selectedCert.badgeUrl}
                    alt={`${selectedCert.name} badge`}
                    className="w-24 h-24 object-contain bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-gray-700/50 shadow-lg relative z-10"
                  />
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-2xl group-hover:bg-cyan-400/30 transition-colors"></div>
                  <div className="w-24 h-24 bg-gray-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-cyan-400 border border-gray-700/50 shadow-lg relative z-10">
                    <Award className="w-12 h-12" />
                  </div>
                </div>
              )}

              <div>
                <span className={`text-[10px] uppercase font-extrabold tracking-wider px-3 py-1.5 rounded-full inline-block mb-3 shadow-inner ${selectedCert.level === 'Beginner' ? 'bg-green-900/40 text-green-400 border border-green-500/30' :
                  selectedCert.level === 'Intermediate' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-900/40 text-red-400 border border-red-500/30'
                  }`}>
                  {selectedCert.level} Level
                </span>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight mb-2">
                  {selectedCert.name}
                </h3>
                <p className="text-cyan-400 text-sm font-semibold tracking-wide flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  {selectedCert.organization}
                </p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-gray-300 relative z-10">
              <div className="bg-gray-800/40 backdrop-blur-md p-5 rounded-2xl border border-gray-700/50 shadow-inner">
                <span className="text-cyan-500/80 flex items-center gap-2 uppercase text-xs font-bold tracking-widest block mb-3">
                  At a Glance
                </span>
                <p className="leading-relaxed text-[15px]">{selectedCert.shortDesc}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-gray-800/40 backdrop-blur-md p-5 rounded-2xl border border-gray-700/50 shadow-inner group hover:bg-gray-800/60 transition-colors">
                  <span className="text-gray-400 uppercase text-[10px] font-bold tracking-widest block mb-2 group-hover:text-cyan-400 transition-colors">
                    Exam Details
                  </span>
                  <span className="text-white font-medium block">{selectedCert.exam}</span>
                </div>
                <div className="bg-gray-800/40 backdrop-blur-md p-5 rounded-2xl border border-gray-700/50 shadow-inner group hover:bg-gray-800/60 transition-colors">
                  <span className="text-gray-400 uppercase text-[10px] font-bold tracking-widest block mb-2 group-hover:text-cyan-400 transition-colors">
                    Recommended Prep
                  </span>
                  <span className="text-white font-medium block">{selectedCert.prep}</span>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-md p-5 rounded-2xl border border-gray-700/50 shadow-inner group hover:bg-gray-800/60 transition-colors">
                <span className="text-gray-400 uppercase text-[10px] font-bold tracking-widest block mb-2 group-hover:text-cyan-400 transition-colors">
                  Target Career Roles
                </span>
                <span className="text-gray-100 font-medium">{selectedCert.roles}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800/80 relative z-10">
              <button
                onClick={() => setSelectedCert(null)}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.7)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Close Details
              </button>
            </div>

            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes cardFloat {
                0% { opacity: 0; transform: scale(0.95) translateY(10px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationsPage;
