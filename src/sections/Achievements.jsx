import { usePortfolioData } from '../context/PortfolioContext';
import SectionTitle from '../components/SectionTitle';
import AchievementCard from '../components/AchievementCard';
import './Achievements.css';

const Achievements = () => {
  const { achievements, settings } = usePortfolioData();
  const visibleAch = (achievements || []).filter(a => a.isVisible !== false);

  if (settings?.show_achievements === 'false' || !visibleAch || visibleAch.length === 0) return null;

  return (
    <section id="achievements" className="achievements-section">
      <div className="achievements-container">
        <SectionTitle title="Achievements & Responsibilities" />

        <div className="achievements-grid animate-on-scroll">
          {visibleAch.map((achievement, index) => (
            <AchievementCard key={achievement.id || index} achievement={achievement} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
