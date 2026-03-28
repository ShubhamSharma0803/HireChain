import React, { useState } from 'react';

import Unveil from './components/Unveil';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CompanySection from './components/CompanySection';
import CandidateSection from './components/CandidateSection';
import RegistrySection from './components/RegistrySection';
import TeamSection from './components/TeamSection';

function App() {
  const [unveiled, setUnveiled] = useState(false);

  return (
    <>
      {!unveiled && <Unveil onComplete={() => setUnveiled(true)} />}

      <div className="min-h-screen bg-[#F2F4F6]" style={{ scrollBehavior: 'smooth' }}>
        <Navbar />
        <Hero />
        <CompanySection />
        <CandidateSection />
        <RegistrySection />
        <TeamSection />
      </div>
    </>
  );
}

export default App;