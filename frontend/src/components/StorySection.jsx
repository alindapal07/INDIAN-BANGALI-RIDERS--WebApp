import React from 'react';
import StoriesBar from './StoriesBar';

const StorySection = ({ stories, onStoryClick }) => {
  return (
    <div className="w-full py-8 border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-6 flex items-center gap-4">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Live Squadron Feeds
        </p>
        {/* Render the core StoriesBar component */}
        <StoriesBar stories={stories} onStoryClick={onStoryClick} />
      </div>
    </div>
  );
};

export default StorySection;
