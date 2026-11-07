import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 relative z-10 select-none">
      <div className="w-full max-w-md rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#D97706] bg-tideglass-surface/90 backdrop-blur-[6px] p-8 sm:p-10 shadow-[0_4px_16px_rgba(30,45,39,0.06)] text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#E6F4F0] border border-emerald-400/35 flex items-center justify-center text-[#0A7D6E] font-mono text-2xl font-bold shadow-xs">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2D27] mb-2 font-headline">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-[#516861] max-w-xs mx-auto mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="primary" size="md" className="w-full sm:w-auto">
            <Link to="/">Return to Home</Link>
          </Button>
          <Button asChild variant="secondary" size="md" className="w-full sm:w-auto">
            <Link to="/jobs">Explore Campus Drives</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
