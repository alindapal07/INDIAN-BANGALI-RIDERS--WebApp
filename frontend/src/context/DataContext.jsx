import React, { createContext, useContext, useState, useCallback } from 'react';
import { storiesAPI, highlightsAPI, postsAPI, ridersAPI, journeysAPI } from '../api/index.js';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [journeys, setJourneys] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [s, h, p, m, j] = await Promise.all([
        storiesAPI.getAll(),
        highlightsAPI.getAll(),
        postsAPI.getAll(),
        ridersAPI.getAll(),
        journeysAPI.getAll(),
      ]);
      setStories(s.data || []);
      setHighlights(h.data || []);
      setPosts(p.data || []);
      setMembers(m.data || []);
      setJourneys(j.data || []);
    } catch (err) {
      console.error('Data load error:', err);
    }
  }, []);

  return (
    <DataContext.Provider value={{ stories, highlights, posts, members, journeys, loadData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
