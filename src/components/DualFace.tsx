import React from 'react';
import { ClockSettings } from '../types';
import { AnalogFace } from './AnalogFace';
import { DigitalFace } from './DigitalFace';

interface DualFaceProps {
  now: Date;
  settings: ClockSettings;
  weatherSlot?: React.ReactNode;
}

export const DualFace: React.FC<DualFaceProps> = ({ now, settings, weatherSlot }) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 w-full max-w-7xl mx-auto px-4 my-auto">
      <div className="w-full lg:w-1/2 flex justify-center">
        {/* We pass showDate: false to analog so date is not duplicated */}
        <AnalogFace now={now} settings={{ ...settings, showDate: false }} />
      </div>
      <div className="w-full lg:w-1/2 flex justify-center">
        <DigitalFace now={now} settings={settings} weatherSlot={weatherSlot} />
      </div>
    </div>
  );
};
