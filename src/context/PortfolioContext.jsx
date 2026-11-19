import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAllPortfolioData } from '../services/portfolioService';
import staticPersonal from '../data/personal';
import staticProjects from '../data/projects';
import staticExperience from '../data/experience';
import staticEducation from '../data/education';
import staticSkills from '../data/skills';
import staticCertificates from '../data/certificates';
import staticAchievements from '../data/achievements';
import staticPublications from '../data/publications';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [data, setData] = useState({
    isFromDb: false,
    personal: staticPersonal,
    projects: staticProjects,
    experience: staticExperience,
    education: staticEducation,
    skills: staticSkills,
    certificates: staticCertificates,
    achievements: staticAchievements,
    publications: staticPublications,
    socialLinks: [],
    settings: {
      show_projects: 'true',
      show_experience: 'true',
      show_education: 'true',
      show_skills: 'true',
      show_certificates: 'true',
      show_achievements: 'true',
      show_publications: 'true',
    },
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const fetched = await fetchAllPortfolioData();
      if (fetched) {
        setData(fetched);
      }
    } catch (err) {
      console.warn('PortfolioContext: Failed to fetch live data, using current data.', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <PortfolioContext.Provider
      value={{
        ...data,
        loading,
        refreshData: loadData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolioData = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolioData must be used within a PortfolioProvider');
  }
  return context;
};
