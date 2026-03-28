import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Server, Presentation, ExternalLink, Globe, AtSign } from 'lucide-react';

const float = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const team = [
  {
    name: 'Sanyam Nandal',
    role: 'Frontend & Smart Contracts',
    desc: 'Architecting the glassmorphic UI and integrating ethers.js for trustless hiring flows.',
    icon: Code2,
    gradient: 'from-orange-50 to-amber-50',
    border: 'border-orange-100',
    iconBg: 'bg-orange-50 text-[#FF8131]',
    links: { github: '#', linkedin: '#', twitter: '#' },
  },
  {
    name: 'Shubham',
    role: 'Backend & AI Engine',
    desc: 'Building the MCA21 verification pipeline, DigiLocker integration, and Claude-powered consistency scoring.',
    icon: Server,
    gradient: 'from-blue-50 to-indigo-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-50 text-blue-600',
    links: { github: '#', linkedin: '#', twitter: '#' },
  },
  {
    name: 'Aman',
    role: 'Presentation & Strategy',
    desc: 'Crafting the product narrative, investor deck, and go-to-market strategy for the HireChain protocol.',
    icon: Presentation,
    gradient: 'from-green-50 to-emerald-50',
    border: 'border-green-100',
    iconBg: 'bg-green-50 text-green-600',
    links: { github: '#', linkedin: '#', twitter: '#' },
  },
];

const TeamSection = () => {
  return (
    <section id="team" className="relative py-28 px-6 md:px-12 max-w-7xl mx-auto">
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={float}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#030D1E] tracking-tight">Built by</h2>
        <p className="mt-4 text-lg text-[#6A737D] max-w-xl mx-auto leading-relaxed">
          Three builders removing trust friction from hiring.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {team.map((member, i) => {
          const Icon = member.icon;
          return (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={float}
              whileHover={{ y: -8 }}
              className={`relative bg-gradient-to-br ${member.gradient} rounded-3xl p-8 border ${member.border} shadow-sm cursor-default overflow-hidden`}
            >
              {/* Decorative circle */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/30 pointer-events-none" />

              <div className={`w-14 h-14 rounded-2xl ${member.iconBg} flex items-center justify-center mb-5`}>
                <Icon className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-extrabold text-[#030D1E] tracking-tight">{member.name}</h3>
              <p className="text-sm font-bold text-[#FF8131] mt-1 mb-4">{member.role}</p>
              <p className="text-[#6A737D] leading-relaxed text-sm">{member.desc}</p>

              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                <a href={member.links.github} className="p-2 rounded-xl bg-white/70 text-[#6A737D] hover:text-[#030D1E] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a href={member.links.linkedin} className="p-2 rounded-xl bg-white/70 text-[#6A737D] hover:text-[#030D1E] transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
                <a href={member.links.twitter} className="p-2 rounded-xl bg-white/70 text-[#6A737D] hover:text-[#030D1E] transition-colors">
                  <AtSign className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={float}
        className="mt-28 text-center"
      >
        <p className="text-sm text-[#6A737D]">
          © {new Date().getFullYear()} HireChain Protocol · Built on Ethereum · Trustless by design
        </p>
      </motion.div>
    </section>
  );
};

export default TeamSection;
