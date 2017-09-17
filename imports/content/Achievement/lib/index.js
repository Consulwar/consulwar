import generalAchievements from '../General/lib';
import spaceAchievement from '../Space/lib';
import communicationAchievement from '../Communication/lib';

export default {
  ...generalAchievements,
  ...spaceAchievement,
  ...communicationAchievement,
};
