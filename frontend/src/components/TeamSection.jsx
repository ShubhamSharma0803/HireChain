import React from 'react';
import { motion } from 'framer-motion';

const teamMembers = [
  {
    name: 'Sanyam',
    role: 'Full Stack & AI Engineer',
    links: { github: '#', linkedin: '#', twitter: '#' },
  },
  {
    name: 'Shubham',
    role: 'Blockchain & Backend Engineer',
    links: { github: '#', linkedin: '#', twitter: '#' },
  },
  {
    name: 'Aman',
    role: 'Frontend & UI Developer',
    links: { github: '#', linkedin: '#', twitter: '#' },
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const TeamSection = () => {
  return (
    <section id="team" className="relative pt-32 pb-24 w-full flex flex-col items-center">
      
      {/* Team Grid */}
      <div className="w-full max-w-[1200px] px-6 md:px-12 mb-32 z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <span className="editorial-label mb-4 block">The Builders</span>
          <h2 className="editorial-heading">Team HireChain</h2>
        </motion.div>

        <motion.div
           variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
           className="grid md:grid-cols-3 gap-6"
        >
          {teamMembers.map((member, i) => (
            <motion.div
              variants={item}
              key={i}
              className="editorial-card-interactive editorial-card p-10 flex flex-col items-start justify-center text-left"
            >
              <img 
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${member.name}&backgroundColor=FAFAFA`} 
                alt={member.name} 
                className="w-16 h-16 rounded-full bg-[var(--bg-color)] border border-[var(--border-subtle)] mb-8 object-cover" 
              />
              <h3 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] mb-1">{member.name}</h3>
              <p className="text-[19px] text-[var(--text-secondary)] mb-8">{member.role}</p>

              <div className="flex items-center gap-4 mt-auto">
                <a href={member.links.github} className="editorial-label text-[19px] hover:text-[var(--text-primary)] transition-colors">GH</a>
                <a href={member.links.linkedin} className="editorial-label text-[19px] hover:text-[var(--text-primary)] transition-colors">IN</a>
                <a href={member.links.twitter} className="editorial-label text-[19px] hover:text-[var(--text-primary)] transition-colors">TW</a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ABOUT / FOOTER SECTION (Editorial constraint) */}
      <motion.footer
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="w-full max-w-[600px] px-6 text-left mx-auto pt-24 border-t border-[var(--border-card)]"
      >
        <span className="editorial-label block mb-6">About the project</span>
        <h2 className="text-[38px] font-semibold tracking-tight leading-[1.1] text-[var(--text-primary)] mb-6">
          Bringing true cryptographic accountability to the recruitment industry, one block at a time.
        </h2>
        <p className="editorial-body text-[19px] mb-16">
          HireChain represents a fundamental shift in how trust is brokered. By enforcing escrow validations directly on-chain and mapping them to real-world government registries, we eliminate the economic incentive to defraud or ghost.
        </p>

        <div className="flex items-center justify-between border-t border-[rgba(0,0,0,0.04)] pt-8">
          <span className="editorial-label" style={{ color: 'var(--text-secondary)' }}>HireChain © 2026</span>
          <div className="flex items-center gap-6">
            <button className="editorial-label hover:text-[var(--text-primary)] transition-colors bg-transparent border-none cursor-pointer" style={{ color: 'var(--text-secondary)' }}>Protocol Docs</button>
            <button className="editorial-label hover:text-[var(--text-primary)] transition-colors bg-transparent border-none cursor-pointer" style={{ color: 'var(--text-secondary)' }}>Smart Contract</button>
          </div>
        </div>
      </motion.footer>

    </section>
  );
};

export default TeamSection;
