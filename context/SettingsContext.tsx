import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { INITIAL_CATEGORIES, PREDEFINED_TASKS, MISSION_DETAILS, INITIAL_KARMA_CLUB_REWARDS, INITIAL_LEAGUES } from '../constants';
import type { KarmaReward, CategorySetting, PartnerBrand, PartnerCharity } from '../types';
import type { League } from '../constants';

// Type definitions matching the constants
type PredefinedTasks = typeof PREDEFINED_TASKS;
type MissionDetails = typeof MISSION_DETAILS;
type KarmaClubRewards = Record<string, KarmaReward[]>;


interface SettingsContextType {
  categories: CategorySetting[];
  setCategories: React.Dispatch<React.SetStateAction<CategorySetting[]>>;
  predefinedTasks: PredefinedTasks;
  setPredefinedTasks: React.Dispatch<React.SetStateAction<PredefinedTasks>>;
  missionDetails: MissionDetails;
  setMissionDetails: React.Dispatch<React.SetStateAction<MissionDetails>>;
  karmaClubRewards: KarmaClubRewards;
  setKarmaClubRewards: React.Dispatch<React.SetStateAction<KarmaClubRewards>>;
  leagues: League[];
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>;
  brands: PartnerBrand[];
  setBrands: React.Dispatch<React.SetStateAction<PartnerBrand[]>>;
  charities: PartnerCharity[];
  setCharities: React.Dispatch<React.SetStateAction<PartnerCharity[]>>;
  isCampaignBuilderEnabled: boolean;
  setIsCampaignBuilderEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isLeaguesEnabled: boolean;
  setIsLeaguesEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  redeemKarmaReward: (rewardId: number) => { success: boolean; code?: string; };
  saveAllSettings: () => void;
  isDirty: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const INITIAL_BRANDS: PartnerBrand[] = [
    { id: '1', name: 'Digikala', logoUrl: 'https://logo.clearbit.com/digikala.com' },
    { id: '2', name: 'Snapp', logoUrl: 'https://logo.clearbit.com/snapp.ir' },
    { id: '3', name: 'Tapsi', logoUrl: 'https://logo.clearbit.com/tapsi.ir' },
    { id: '4', name: 'Alibaba', logoUrl: 'https://logo.clearbit.com/alibaba.ir' },
];

const INITIAL_CHARITIES: PartnerCharity[] = [
    { id: 'c1', name: 'موسسه خیریه محک', logoUrl: 'https://logo.clearbit.com/mahak-charity.org', website: 'https://mahak-charity.org' },
    { id: 'c2', name: 'جمعیت امام علی', logoUrl: 'https://logo.clearbit.com/sosapoverty.org', website: 'https://sosapoverty.org' },
];

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategoriesState] = useState<CategorySetting[]>(INITIAL_CATEGORIES);
  const [predefinedTasks, setPredefinedTasksState] = useState<PredefinedTasks>(PREDEFINED_TASKS);
  const [missionDetails, setMissionDetailsState] = useState<MissionDetails>(MISSION_DETAILS);
  const [karmaClubRewards, setKarmaClubRewardsState] = useState<KarmaClubRewards>(INITIAL_KARMA_CLUB_REWARDS);
  const [leagues, setLeaguesState] = useState<League[]>(INITIAL_LEAGUES);
  const [brands, setBrandsState] = useState<PartnerBrand[]>(INITIAL_BRANDS);
  const [charities, setCharitiesState] = useState<PartnerCharity[]>(INITIAL_CHARITIES);
  const [isCampaignBuilderEnabled, setIsCampaignBuilderEnabledState] = useState<boolean>(false);
  const [isLeaguesEnabled, setIsLeaguesEnabledState] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState(false);

  // --- Wrapper setters to handle dirty state ---
  const setCategories: typeof setCategoriesState = (value) => {
    setCategoriesState(value);
    setIsDirty(true);
  };
  const setPredefinedTasks: typeof setPredefinedTasksState = (value) => {
    setPredefinedTasksState(value);
    setIsDirty(true);
  };
  const setMissionDetails: typeof setMissionDetailsState = (value) => {
    setMissionDetailsState(value);
    setIsDirty(true);
  };
  const setKarmaClubRewards: typeof setKarmaClubRewardsState = (value) => {
    setKarmaClubRewardsState(value);
    setIsDirty(true);
  };
   const setLeagues: typeof setLeaguesState = (value) => {
    setLeaguesState(value);
    setIsDirty(true);
  };
  const setBrands: typeof setBrandsState = (value) => {
    setBrandsState(value);
    setIsDirty(true);
  };
  const setCharities: typeof setCharitiesState = (value) => {
    setCharitiesState(value);
    setIsDirty(true);
  };
   const setIsCampaignBuilderEnabled: typeof setIsCampaignBuilderEnabledState = (value) => {
    setIsCampaignBuilderEnabledState(value);
    setIsDirty(true);
  };
   const setIsLeaguesEnabled: typeof setIsLeaguesEnabledState = (value) => {
    setIsLeaguesEnabledState(value);
    setIsDirty(true);
  };
  // --- End of wrappers ---

  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('karma_categories');
      if (savedCategories) {
        setCategoriesState(JSON.parse(savedCategories) as CategorySetting[]);
      }

      const savedTasks = localStorage.getItem('karma_predefined_tasks');
      if (savedTasks) {
        setPredefinedTasksState(JSON.parse(savedTasks) as PredefinedTasks);
      }

      const savedMissions = localStorage.getItem('karma_mission_details');
      if (savedMissions) {
        setMissionDetailsState(JSON.parse(savedMissions) as MissionDetails);
      }

      const savedRewards = localStorage.getItem('karma_club_rewards');
      if (savedRewards) {
        setKarmaClubRewardsState(JSON.parse(savedRewards) as KarmaClubRewards);
      }
      
      const savedLeagues = localStorage.getItem('karma_leagues');
      if (savedLeagues) {
        setLeaguesState(JSON.parse(savedLeagues) as League[]);
      }

      const savedBrands = localStorage.getItem('karma_brands');
      if (savedBrands) {
        setBrandsState(JSON.parse(savedBrands) as PartnerBrand[]);
      }

      const savedCharities = localStorage.getItem('karma_charities');
      if (savedCharities) {
        setCharitiesState(JSON.parse(savedCharities) as PartnerCharity[]);
      }

      const savedBuilderEnabled = localStorage.getItem('karma_is_builder_enabled');
      if (savedBuilderEnabled) {
        setIsCampaignBuilderEnabledState(JSON.parse(savedBuilderEnabled));
      }

      const savedLeaguesEnabled = localStorage.getItem('karma_is_leagues_enabled');
      if (savedLeaguesEnabled) {
        setIsLeaguesEnabledState(JSON.parse(savedLeaguesEnabled));
      }


    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
  }, []);
  
  const saveAllSettings = () => {
    try {
      localStorage.setItem('karma_categories', JSON.stringify(categories));
      localStorage.setItem('karma_predefined_tasks', JSON.stringify(predefinedTasks));
      localStorage.setItem('karma_mission_details', JSON.stringify(missionDetails));
      localStorage.setItem('karma_club_rewards', JSON.stringify(karmaClubRewards));
      localStorage.setItem('karma_leagues', JSON.stringify(leagues));
      localStorage.setItem('karma_brands', JSON.stringify(brands));
      localStorage.setItem('karma_charities', JSON.stringify(charities));
      localStorage.setItem('karma_is_builder_enabled', JSON.stringify(isCampaignBuilderEnabled));
      localStorage.setItem('karma_is_leagues_enabled', JSON.stringify(isLeaguesEnabled));
      setIsDirty(false); // Reset dirty state after saving
    } catch (error) {
      console.error("Failed to save all settings to localStorage:", error);
    }
  };

    const redeemKarmaReward = (rewardId: number): { success: boolean, code?: string } => {
        let foundReward: KarmaReward | null = null;
        let categoryKey: string | null = null;

        for (const category in karmaClubRewards) {
            const reward = karmaClubRewards[category].find(r => r.id === rewardId);
            if (reward) {
                foundReward = reward;
                categoryKey = category;
                break;
            }
        }
        
        if (!foundReward || !categoryKey) {
            return { success: false };
        }

        // Handle code-based rewards
        if (foundReward.codes && foundReward.codes.length > 0) {
            const updatedRewards = JSON.parse(JSON.stringify(karmaClubRewards));
            const rewardToUpdate = updatedRewards[categoryKey].find((r: KarmaReward) => r.id === rewardId)!;
            const code = rewardToUpdate.codes!.shift(); // Take the first code
            rewardToUpdate.quantity = rewardToUpdate.codes!.length; // Update quantity to match remaining codes
            
            setKarmaClubRewards(updatedRewards);

            return { success: true, code: code };
        } 
        // Handle generic, quantity-based rewards
        else if (foundReward.quantity > 0) {
            const updatedRewards = JSON.parse(JSON.stringify(karmaClubRewards));
            const rewardToUpdate = updatedRewards[categoryKey].find((r: KarmaReward) => r.id === rewardId)!;
            rewardToUpdate.quantity -= 1;
            
            setKarmaClubRewards(updatedRewards);

            return { success: true };
        }
        
        // If no codes and no quantity, it's out of stock
        return { success: false };
    };

  return (
    <SettingsContext.Provider value={{
      categories,
      setCategories,
      predefinedTasks,
      setPredefinedTasks,
      missionDetails,
      setMissionDetails,
      karmaClubRewards,
      setKarmaClubRewards,
      leagues,
      setLeagues,
      brands,
      setBrands,
      charities,
      setCharities,
      isCampaignBuilderEnabled,
      setIsCampaignBuilderEnabled,
      isLeaguesEnabled,
      setIsLeaguesEnabled,
      redeemKarmaReward,
      saveAllSettings,
      isDirty,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
      throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};