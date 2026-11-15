import React from 'react';

export const Footer: React.FC = () => (
  <footer className="mt-10 border-t border-slate-800 bg-[#050810] py-6 px-4 sm:px-6">
    <div className="mx-auto max-w-7xl text-center">
      <p className="font-mono text-xs text-slate-300 leading-relaxed">
        Built for the NASA Space Apps Challenge using open NASA microgravity combustion data. Built
        with AI assistance via Google AI Studio. Not an official NASA product.
      </p>
    </div>
  </footer>
);
