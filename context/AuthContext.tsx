

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { Transaction, SocialPlatform } from '../types';
import { USERS_DATA } from '../data/users';
import type { User as AdminUser } from '../data/users';

export type RedeemedCode = {
  name: string;
  code: string;
  date: string;
};

interface AuthContextType {
  isAuthenticated: boolean;
  userIdentifier: string | null;
  isAdmin: boolean;
  karmaCoins: number;
  contributionValue: number;
  impactScore: number;
  transactions: Transaction[];
  socialIds: Partial<Record<SocialPlatform, string>>;
  redeemedCodes: RedeemedCode[];
  login: (identifier: string) => void;
  logout: () => void;
  recordTaskCompletion: (description: string, impactPoints: number, karmaCoins: number) => void;
  addContribution: (campaignTarget: number, taskImpactPoints: number) => void;
  addDirectContribution: (amount: number) => void;
  withdrawContribution: (amount: number) => boolean;
  spendKarmaCoins: (amount: number, description: string, rewardInfo?: { name: string; code?: string }) => boolean;
  updateSocialIds: (newIds: Partial<Record<SocialPlatform, string>>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_IDENTIFIER = 'admin@karma.com';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [karmaCoins, setKarmaCoins] = useState<number>(0);
  const [contributionValue, setContributionValue] = useState<number>(0);
  const [impactScore, setImpactScore] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [socialIds, setSocialIds] = useState<Partial<Record<SocialPlatform, string>>>({});
  const [redeemedCodes, setRedeemedCodes] = useState<RedeemedCode[]>([]);

  useEffect(() => {
    // Check for persisted login state on initial load
    const storedIdentifier = localStorage.getItem('userIdentifier');
    if (storedIdentifier) {
      // Re-run the login logic to ensure consistency and user list update if needed
      login(storedIdentifier);
    }
  }, []);

  const updateUserInMasterList = (identifier: string, updates: Partial<AdminUser>) => {
    try {
        const allUsersJSON = localStorage.getItem('karma_users');
        if (allUsersJSON) {
            let allUsers: AdminUser[] = JSON.parse(allUsersJSON);
            const userIndex = allUsers.findIndex(u => u.identifier === identifier);
            if (userIndex !== -1) {
                // Merge new updates with existing user data
                allUsers[userIndex] = { ...allUsers[userIndex], ...updates };
                localStorage.setItem('karma_users', JSON.stringify(allUsers));
            }
        }
    } catch (error) {
        console.error("Failed to update master user list:", error);
    }
  };

  const login = (identifier: string) => {
    // --- Auto-register new user in admin panel ---
    try {
      const allUsersJSON = localStorage.getItem('karma_users');
      let allUsers: AdminUser[] = allUsersJSON ? JSON.parse(allUsersJSON) : USERS_DATA;
      
      const userExists = allUsers.some(u => u.identifier === identifier);
      
      if (!userExists) {
        const newUser: AdminUser = {
          id: `user-${Date.now()}`,
          identifier,
          karmaCoins: 0,
          impactScore: 0,
          status: 'active',
          role: 'user',
          socialIds: {},
        };
        allUsers.push(newUser);
        localStorage.setItem('karma_users', JSON.stringify(allUsers));
      }

    } catch (error) {
      console.error("Failed to check/add new user to master list:", error);
    }
    // --- End of auto-register logic ---

    localStorage.setItem('userIdentifier', identifier);
    setIsAuthenticated(true);
    setUserIdentifier(identifier);
    setIsAdmin(identifier === ADMIN_IDENTIFIER);
    
    const storedCoins = localStorage.getItem(`karma_coins_${identifier}`);
    setKarmaCoins(storedCoins ? parseInt(storedCoins, 10) : 0);

    const storedValue = localStorage.getItem(`contribution_value_${identifier}`);
    setContributionValue(storedValue ? parseFloat(storedValue) : 0);

    const storedScore = localStorage.getItem(`impact_score_${identifier}`);
    setImpactScore(storedScore ? parseInt(storedScore, 10) : 0);

    const storedTransactions = localStorage.getItem(`transactions_${identifier}`);
    try {
        setTransactions(storedTransactions ? JSON.parse(storedTransactions) : []);
    } catch {
        setTransactions([]);
    }

    const storedSocialIds = localStorage.getItem(`social_ids_${identifier}`);
    try {
        setSocialIds(storedSocialIds ? JSON.parse(storedSocialIds) : {});
    } catch {
        setSocialIds({});
    }
    
    const storedRedeemedCodes = localStorage.getItem(`redeemed_codes_${identifier}`);
    try {
        setRedeemedCodes(storedRedeemedCodes ? JSON.parse(storedRedeemedCodes) : []);
    } catch {
        setRedeemedCodes([]);
    }
  };

  const logout = () => {
    localStorage.removeItem('userIdentifier');
    setIsAuthenticated(false);
    setUserIdentifier(null);
    setIsAdmin(false);
    setKarmaCoins(0);
    setContributionValue(0);
    setImpactScore(0);
    setTransactions([]);
    setSocialIds({});
    setRedeemedCodes([]);
  };

  const recordTaskCompletion = (description: string, impactPoints: number, karmaCoins: number) => {
    if (userIdentifier) {
        const newTransaction: Transaction = {
          id: `${new Date().toISOString()}-${Math.random()}`,
          description,
          amount: karmaCoins,
          date: new Date().toISOString(),
          type: 'earn',
        };

        setTransactions(prev => {
            const newTransactions = [newTransaction, ...prev];
            localStorage.setItem(`transactions_${userIdentifier}`, JSON.stringify(newTransactions));
            return newTransactions;
        });

        let newTotalCoins = 0;
        let newTotalScore = 0;

        setKarmaCoins(prevCoins => {
            newTotalCoins = prevCoins + karmaCoins;
            localStorage.setItem(`karma_coins_${userIdentifier}`, newTotalCoins.toString());
            return newTotalCoins;
        });

        setImpactScore(prevScore => {
            newTotalScore = prevScore + impactPoints;
            localStorage.setItem(`impact_score_${userIdentifier}`, newTotalScore.toString());
            // Since both are calculated now, update master list here
            updateUserInMasterList(userIdentifier, { karmaCoins: newTotalCoins, impactScore: newTotalScore });
            return newTotalScore;
        });
    }
  };

  const addContribution = (campaignTarget: number, taskImpactPoints: number) => {
    if (userIdentifier) {
        const valueToAdd = (taskImpactPoints / 100) * campaignTarget;
        setContributionValue(prevValue => {
            const newValue = prevValue + valueToAdd;
            localStorage.setItem(`contribution_value_${userIdentifier}`, newValue.toString());
            return newValue;
        });
    }
  };
  
  const addDirectContribution = (amount: number) => {
      if (userIdentifier && amount > 0) {
          setContributionValue(prevValue => {
              const newValue = prevValue + amount;
              localStorage.setItem(`contribution_value_${userIdentifier}`, newValue.toString());
              return newValue;
          });
      }
  };

  const withdrawContribution = (amount: number): boolean => {
      if (userIdentifier && contributionValue >= amount) {
          setContributionValue(prevValue => {
              const newValue = prevValue - amount;
              localStorage.setItem(`contribution_value_${userIdentifier}`, newValue.toString());
              return newValue;
          });
          return true;
      }
      return false;
  };

  const spendKarmaCoins = (amount: number, description: string, rewardInfo?: { name: string; code?: string }): boolean => {
      if (userIdentifier && karmaCoins >= amount) {
          const newTransaction: Transaction = {
            id: `${new Date().toISOString()}-${Math.random()}`,
            description,
            amount: -amount,
            date: new Date().toISOString(),
            type: 'spend',
          };

          setTransactions(prev => {
            const newTransactions = [newTransaction, ...prev];
            localStorage.setItem(`transactions_${userIdentifier}`, JSON.stringify(newTransactions));
            return newTransactions;
          });

          if (rewardInfo && rewardInfo.code) {
            const newRedeemedCode: RedeemedCode = {
              name: rewardInfo.name,
              code: rewardInfo.code,
              date: new Date().toISOString(),
            };
            setRedeemedCodes(prev => {
              const newCodes = [newRedeemedCode, ...prev];
              localStorage.setItem(`redeemed_codes_${userIdentifier}`, JSON.stringify(newCodes));
              return newCodes;
            });
          } else if (rewardInfo) { // Handle rewards without codes
            const newRedeemedInfo: RedeemedCode = {
              name: rewardInfo.name,
              code: 'دریافت شد',
              date: new Date().toISOString(),
            };
             setRedeemedCodes(prev => {
              const newCodes = [newRedeemedInfo, ...prev];
              localStorage.setItem(`redeemed_codes_${userIdentifier}`, JSON.stringify(newCodes));
              return newCodes;
            });
          }

          setKarmaCoins(prevCoins => {
              const newCoins = prevCoins - amount;
              localStorage.setItem(`karma_coins_${userIdentifier}`, newCoins.toString());
              updateUserInMasterList(userIdentifier, { karmaCoins: newCoins });
              return newCoins;
          });
          return true;
      }
      return false;
  }

  const updateSocialIds = (newIds: Partial<Record<SocialPlatform, string>>) => {
    if (userIdentifier) {
        setSocialIds(prevIds => {
            const updatedIds = { ...prevIds, ...newIds };
            // Update local storage for the current user
            localStorage.setItem(`social_ids_${userIdentifier}`, JSON.stringify(updatedIds));
            // Update the master user list used by the admin panel
            updateUserInMasterList(userIdentifier, { socialIds: updatedIds });
            return updatedIds;
        });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userIdentifier, 
      isAdmin, 
      karmaCoins, 
      contributionValue,
      impactScore, 
      login, 
      logout, 
      recordTaskCompletion, 
      addContribution,
      addDirectContribution,
      withdrawContribution,
      spendKarmaCoins, 
      transactions, 
      socialIds,
      redeemedCodes,
      updateSocialIds 
    }}>
      {children}
    </AuthContext.Provider>
  );
};