import React from 'react';
import { DriveBoard } from './DriveBoard';
import { PlatformIntelligence } from './PlatformIntelligence';

export interface RecruitmentCockpitProps {
  leftColumn?: React.ReactNode;
  rightColumn?: React.ReactNode;
}

export const RecruitmentCockpit: React.FC<RecruitmentCockpitProps> = ({
  leftColumn,
  rightColumn,
}) => {
  return (
    <section
      id="recruitment-cockpit"
      className="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full scroll-mt-20"
      aria-labelledby="cockpit-heading"
    >
      <div className="mb-6">
        <h2 id="cockpit-heading" className="sr-only">
          Interactive Recruitment Cockpit
        </h2>
      </div>

      {/* 8:4 Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 8-Column Left Slot: Drive Board */}
        <div className="lg:col-span-8">
          {leftColumn ?? <DriveBoard />}
        </div>

        {/* 4-Column Right Slot: Platform Intelligence */}
        <div className="lg:col-span-4">
          {rightColumn ?? <PlatformIntelligence />}
        </div>
      </div>
    </section>
  );
};
