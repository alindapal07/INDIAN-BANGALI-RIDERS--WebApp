import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { storiesAPI } from '../api/index.js';

const StoriesBar = ({ stories, onStoryClick, isAdmin, onDeleteStory }) => {
  const handleUpload = async () => {
    const url = prompt('Enter story image URL:');
    if (!url) return;
    await storiesAPI.create({ type: 'image', url, thumbnail: url });
    onDeleteStory && onDeleteStory('__refresh');
  };

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar py-4">
      {isAdmin && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={handleUpload}
          className="flex-shrink-0 w-16 h-16 rounded-full glass border-2 border-dashed border-rose-500/50 flex items-center justify-center cursor-pointer hover:border-rose-500 transition-all"
        >
          <Plus className="w-6 h-6 text-rose-500" />
        </motion.div>
      )}
      {stories.map((story, i) => (
        <motion.div
          key={story._id || story.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex-shrink-0 relative group"
        >
          <div
            onClick={() => onStoryClick(i)}
            className="w-16 h-16 rounded-full overflow-hidden cursor-pointer ring-2 ring-rose-600 ring-offset-2 ring-offset-[#0A0A0F] hover:ring-white transition-all"
          >
            <img src={story.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteStory(story._id || story.id); }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default StoriesBar;
