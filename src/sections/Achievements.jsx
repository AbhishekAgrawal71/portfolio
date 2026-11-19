import achievements from '../data/achievements';
import SectionTitle from '../components/SectionTitle';
import AchievementCard from '../components/AchievementCard';
import './Achievements.css';

const Achievements = () => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <section id="achievements" className="achievements-section">
      <div className="achievements-container">
        <SectionTitle title="Achievements & Responsibilities" />

        <div className="achievements-grid animate-on-scroll">
          {achievements.map((achievement, index) => (
            <AchievementCard key={achievement.id || index} achievement={achievement} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
