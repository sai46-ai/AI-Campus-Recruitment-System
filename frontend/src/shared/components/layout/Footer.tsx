import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-[#D4DED3] bg-tideglass-surface backdrop-blur-[6px] py-8 text-[#1E2D27]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="flex items-center space-x-2.5 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EAF5EF] border border-[#BDE0D3] flex items-center justify-center shadow-xs" aria-hidden="true">
                <GraduationCap className="w-3.5 h-3.5 text-[#0A7D6E]" />
              </div>
              <span className="text-base font-bold text-[#1E2D27] font-headline">AI Campus Recruitment</span>
            </div>
            <p className="text-xs text-[#516861] leading-relaxed max-w-sm">
              Campus placement operations platform connecting students, placement cells, and corporate recruiters with ATS intelligence.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#0A7D6E] mb-2.5 font-mono">Workflows</h4>
            <ul className="space-y-1.5 text-xs text-[#516861] font-medium">
              <li><Link to="/jobs" className="hover:text-[#0A7D6E] transition-colors">Browse active drives</Link></li>
              <li><Link to="/resume-builder" className="hover:text-[#0A7D6E] transition-colors">Resume builder &amp; ATS studio</Link></li>
              <li><Link to="/student-dashboard" className="hover:text-[#0A7D6E] transition-colors">Student career hub</Link></li>
              <li><Link to="/placement-dashboard" className="hover:text-[#0A7D6E] transition-colors">Placement operations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#1E6778] mb-2.5 font-mono">Governance</h4>
            <ul className="space-y-1.5 text-xs text-[#516861] font-medium">
              <li><Link to="/privacy" className="hover:text-[#0A7D6E] transition-colors">Privacy &amp; data protection</Link></li>
              <li><Link to="/terms" className="hover:text-[#0A7D6E] transition-colors">Terms of service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-[#D4DED3] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#516861]">
          <p>&copy; {currentYear} AI Campus Recruitment System. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <Link to="/privacy" className="hover:text-[#0A7D6E] transition-colors">Privacy policy</Link>
            <Link to="/terms" className="hover:text-[#0A7D6E] transition-colors">Terms of service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
