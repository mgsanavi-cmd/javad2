

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { Campaign, Task, SocialPlatform, TaskCompletion, Comment } from '../types';
import { useAuth } from '../hooks/useAuth';
import { taskTranslations } from '../constants';
import { useLanguage } from '../hooks/useLanguage';

export type TaskStatus = 'pending' | 'completed';

export interface TaskState {
    status: TaskStatus;
    data?: any;
}


interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'progress' | 'status' | 'creatorEmail'>) => void;
  updateCampaign: (updatedCampaign: Campaign) => void;
  deleteCampaign: (id: number) => void;
  setCampaignStatus: (id: number, status: 'active' | 'rejected') => void;
  submitSocialMediaTask: (campaignId: number, taskId: number, socialId: string, task: Task, userId: string) => void;
  completeGenericTask: (campaignId: number, taskId: number, task: Task, userId: string, submittedData?: string) => void;
  approveTaskCompletion: (completionId: string) => void;
  rejectTaskCompletion: (completionId: string) => void;
  taskCompletions: TaskCompletion[];
  comments: Comment[];
  addComment: (campaignId: number, userId: string, text: string) => void;
  deleteComment: (commentId: number) => void;
}

export const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

const defaultSponsorMessage = `به نام خدا
اول از مجموعه کارما کمال تشکر رو دارم که یک بستری فراه اوردن تا ما و مجموعه بتوانیم یک قدم با ثبات تری در عرصه کمک رسانی به مردم نیازمند بر داریم
و تشکر می کنم از شما که در این مسیر خیرخواهانه ماموریت ما رو انتخاب کردید و سپاس گذاری میکنم با تکمیل چرخه های پایین به ما کمک کنید تا بتوانیم وظیفه خودمون انجام بدهیم`;

const initialCampaigns: Campaign[] = [
  {
    id: 1,
    mission: 'تهیه 100 پرس غذای گرم برای کودکان کار',
    brandName: 'رستوران برادران',
    brandLogoUrl: 'https://logo.clearbit.com/boraderan.com',
    location: 'تهران',
    category: 'food',
    tasks: [
      { id: 1, description: 'استوری کردن پوستر کمپین در اینستاگرام', type: 'social_media', platform: 'instagram', impactPoints: 10, karmaCoins: 8, targetUrl: 'https://www.instagram.com/p/C273y2fI8a4/' },
      { id: 2, description: 'لایک کردن پست آخر پیج ما', type: 'social_media', platform: 'instagram', impactPoints: 5, karmaCoins: 3 },
      { id: 3, description: 'ارسال پست کمپین برای ۵ نفر از دوستان', type: 'generic', impactPoints: 5, karmaCoins: 4 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1599028422870-6582ff447868?q=80&w=600&auto=format&fit=crop',
    progress: 75,
    targetAmount: 10000000,
    daysLeft: 12,
    sponsorMessage: defaultSponsorMessage,
    status: 'active',
    creatorEmail: 'creator@boraderan.com',
  },
  {
    id: 2,
    mission: 'جمع‌آوری کتاب برای کتابخانه یک روستای محروم',
    brandName: 'انتشارات دانش',
    brandLogoUrl: 'https://logo.clearbit.com/daneshpub.com',
    location: 'سیستان و بلوچستان',
    category: 'education',
    tasks: [
        { id: 1, description: 'معرفی کمپین در یک توییت', type: 'social_media', platform: 'x', impactPoints: 8, karmaCoins: 6 },
        { id: 2, description: 'دنبال کردن صفحه ما در لینکدین', type: 'social_media', platform: 'linkedin', impactPoints: 5, karmaCoins: 3, targetUrl: 'https://www.linkedin.com' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1531988042231-f39a6cc12a9a?q=80&w=600&auto=format&fit=crop',
    progress: 40,
    targetAmount: 5000000,
    daysLeft: 30,
    sponsorMessage: defaultSponsorMessage,
    status: 'active',
    creatorEmail: 'creator@daneshpub.com',
  },
  {
    id: 3,
    mission: 'هزینه درمان یک کودک مبتلا به بیماری خاص',
    brandName: 'خیریه مردم نهاد امید',
    brandLogoUrl: 'https://logo.clearbit.com/omid-charity.org',
    location: 'سراسر ایران',
    category: 'health',
    tasks: [
        { id: 1, description: 'بازنشر ویدیوی کمپین در شبکه های اجتماعی', type: 'social_media', platform: 'instagram', impactPoints: 8, karmaCoins: 5 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1584982242339-383282f6f55a?q=80&w=600&auto=format&fit=crop',
    progress: 95,
    targetAmount: 25000000,
    daysLeft: 5,
    sponsorMessage: defaultSponsorMessage,
    status: 'pending',
    creatorEmail: 'admin@karma.com',
  },
];

const initialComments: Comment[] = [
    { id: 1, campaignId: 1, userId: 'bahram@example.com', userName: "بهرام رادان", userAvatar: "https://i.pravatar.cc/150?u=bahram", text: "من خیلی خوشحالم من یک محتوای خیلی جذاب تو یوتیوب دیدم که خیلی بهم اعتماد به نفس داد و تونستم به کودکان سرطانی هم کمک کنم مرسی کارما", createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    { id: 2, campaignId: 1, userId: 'mehdi@example.com', userName: "مهدی دارابی", userAvatar: "https://i.pravatar.cc/150?u=mehdi", text: "ممنون که با یک موسیقی جذاب حالم رو خوب کردید و ازتون ممنون که باعث شدید با گوش کردن به یک موزیک بتونم کمک کنم", createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
];


export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const { recordTaskCompletion, userIdentifier, addContribution } = useAuth();

  useEffect(() => {
    try {
      const savedCampaignsJSON = localStorage.getItem('karma_campaigns');
      if (savedCampaignsJSON) {
        setCampaigns(JSON.parse(savedCampaignsJSON) as Campaign[]);
      } else {
        setCampaigns(initialCampaigns);
        localStorage.setItem('karma_campaigns', JSON.stringify(initialCampaigns));
      }
      
      const savedCompletionsJSON = localStorage.getItem('karma_task_completions');
      if (savedCompletionsJSON) {
        setTaskCompletions(JSON.parse(savedCompletionsJSON) as TaskCompletion[]);
      }

      const savedCommentsJSON = localStorage.getItem('karma_comments');
      if (savedCommentsJSON) {
        setComments(JSON.parse(savedCommentsJSON) as Comment[]);
      } else {
        setComments(initialComments);
        localStorage.setItem('karma_comments', JSON.stringify(initialComments));
      }

    } catch {
      setCampaigns(initialCampaigns);
      setTaskCompletions([]);
      setComments(initialComments);
    }
  }, []);
  
  const logTaskCompletion = (
    userId: string,
    campaignId: number,
    task: Task,
    status: TaskCompletion['status'],
    submittedData?: string
  ) => {
    const newCompletion: TaskCompletion = {
      id: `${userId}-${campaignId}-${task.id}-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      userId,
      campaignId,
      taskId: task.id,
      taskDescription: task.description,
      submittedData,
      completedAt: new Date().toISOString(),
      impactPoints: task.impactPoints,
      karmaCoins: task.karmaCoins || 0,
      status,
    };
    setTaskCompletions(prevCompletions => {
      const updatedCompletions = [newCompletion, ...prevCompletions];
      localStorage.setItem('karma_task_completions', JSON.stringify(updatedCompletions));
      return updatedCompletions;
    });
  };

  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'progress' | 'status' | 'creatorEmail'>) => {
    setCampaigns(prevCampaigns => {
      const newCampaign: Campaign = {
        ...campaignData,
        id: prevCampaigns.length > 0 ? Math.max(...prevCampaigns.map(c => c.id)) + 1 : 1,
        progress: 0,
        status: 'pending',
        creatorEmail: userIdentifier || 'anonymous@example.com',
      };
      const updatedCampaigns = [newCampaign, ...prevCampaigns];
      localStorage.setItem('karma_campaigns', JSON.stringify(updatedCampaigns));
      return updatedCampaigns;
    });
  };

  const updateCampaign = (updatedCampaign: Campaign) => {
    setCampaigns(prevCampaigns => {
        const updatedCampaigns = prevCampaigns.map(campaign =>
            campaign.id === updatedCampaign.id ? updatedCampaign : campaign
        );
        localStorage.setItem('karma_campaigns', JSON.stringify(updatedCampaigns));
        return updatedCampaigns;
    });
  };

  const deleteCampaign = (id: number) => {
    setCampaigns(prevCampaigns => {
        const updatedCampaigns = prevCampaigns.filter(c => c.id !== id);
        localStorage.setItem('karma_campaigns', JSON.stringify(updatedCampaigns));
        return updatedCampaigns;
    });
  };

  const setCampaignStatus = (id: number, status: 'active' | 'rejected') => {
    setCampaigns(prevCampaigns => {
        const updatedCampaigns = prevCampaigns.map(campaign =>
            campaign.id === id ? { ...campaign, status } : campaign
        );
        localStorage.setItem('karma_campaigns', JSON.stringify(updatedCampaigns));
        return updatedCampaigns;
    });
  };

  const updateCampaignProgress = (campaignId: number, pointsToAdd: number) => {
    setCampaigns(prevCampaigns => {
      let completedCampaign: Campaign | null = null;

      const updatedCampaigns = prevCampaigns.map(c => {
        if (c.id === campaignId) {
          const newProgress = Math.min(100, c.progress + pointsToAdd);
          if (newProgress >= 100 && c.status === 'active') {
             const updatedCampaign = { ...c, progress: 100, status: 'completed' as const };
             completedCampaign = updatedCampaign;
             return updatedCampaign;
          }
          return { ...c, progress: newProgress };
        }
        return c;
      });

      localStorage.setItem('karma_campaigns', JSON.stringify(updatedCampaigns));
      return updatedCampaigns;
    });
  };

  const submitSocialMediaTask = (campaignId: number, taskId: number, socialId: string, task: Task, userId: string) => {
    logTaskCompletion(userId, campaignId, task, 'pending', socialId);
  }

  const completeGenericTask = (campaignId: number, taskId: number, task: Task, userId: string, submittedData?: string) => {
      logTaskCompletion(userId, campaignId, task, 'approved', submittedData);
      recordTaskCompletion(task.description, task.impactPoints, task.karmaCoins || 0);
      updateCampaignProgress(campaignId, task.impactPoints);
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        addContribution(campaign.targetAmount, task.impactPoints);
      }
  }
  
  const approveTaskCompletion = (completionId: string) => {
    const completion = taskCompletions.find(tc => tc.id === completionId);
    if (!completion || completion.status !== 'pending') return;

    // Award points and update progress
    recordTaskCompletion(completion.taskDescription, completion.impactPoints, completion.karmaCoins);
    updateCampaignProgress(completion.campaignId, completion.impactPoints);
    const campaign = campaigns.find(c => c.id === completion.campaignId);
    if (campaign) {
      addContribution(campaign.targetAmount, completion.impactPoints);
    }

    // Update completion status
    setTaskCompletions(prevCompletions => {
      const updatedCompletions = prevCompletions.map(tc => 
        tc.id === completionId ? { ...tc, status: 'approved' as const } : tc
      );
      localStorage.setItem('karma_task_completions', JSON.stringify(updatedCompletions));
      return updatedCompletions;
    });
  };

  const rejectTaskCompletion = (completionId: string) => {
    const completion = taskCompletions.find(tc => tc.id === completionId);
    if (!completion || completion.status !== 'pending') return;
    
    // Update completion status
    setTaskCompletions(prevCompletions => {
        const updatedCompletions = prevCompletions.map(tc => 
          tc.id === completionId ? { ...tc, status: 'rejected' as const } : tc
        );
        localStorage.setItem('karma_task_completions', JSON.stringify(updatedCompletions));
        return updatedCompletions;
    });
  };

  const addComment = (campaignId: number, userId: string, text: string) => {
    setComments(prevComments => {
      const newComment: Comment = {
        id: (prevComments.length > 0 ? Math.max(...prevComments.map(c => c.id)) + 1 : 1),
        campaignId,
        userId,
        userName: userIdentifier ? userIdentifier.split('@')[0] : "کاربر",
        userAvatar: `https://i.pravatar.cc/150?u=${userId}`,
        text,
        createdAt: new Date().toISOString(),
      };
      const updatedComments = [newComment, ...prevComments];
      localStorage.setItem('karma_comments', JSON.stringify(updatedComments));
      return updatedComments;
    });
  };

  const deleteComment = (commentId: number) => {
    setComments(prevComments => {
        const updatedComments = prevComments.filter(comment => comment.id !== commentId);
        localStorage.setItem('karma_comments', JSON.stringify(updatedComments));
        return updatedComments;
    });
  };

  return (
    <CampaignContext.Provider value={{ 
      campaigns, 
      addCampaign,
      updateCampaign,
      deleteCampaign,
      setCampaignStatus,
      submitSocialMediaTask,
      completeGenericTask,
      approveTaskCompletion,
      rejectTaskCompletion,
      taskCompletions,
      comments,
      addComment,
      deleteComment,
    }}>
      {children}
    </CampaignContext.Provider>
  );
};