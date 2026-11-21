import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Sidebar, NavSection } from './components/Sidebar';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { CrisisModal } from './components/CrisisModal';
import { BreathingModal } from './components/BreathingModal';

// Pages
import { HomeDashboard } from './pages/HomeDashboard';
import { ChatAssistant } from './pages/ChatAssistant';
import { VoiceAnalysis } from './pages/VoiceAnalysis';
import { FacialAnalysis } from './pages/FacialAnalysis';
import { ImageUploadAnalysis } from './pages/ImageUploadAnalysis';
import { MultimodalFusion } from './pages/MultimodalFusion';
import { EmotionHistory } from './pages/EmotionHistory';
import { AnalyticsReports } from './pages/AnalyticsReports';
import { UserProfile } from './pages/UserProfile';
import { SettingsPage } from './pages/SettingsPage';

function MainLayout() {
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const getSectionMetadata = (section: NavSection) => {
    switch (section) {
      case 'dashboard':
        return {
          title: 'Home Dashboard',
          subtitle: 'System overview & multimodal analysis launcher'
        };
      case 'chat':
        return {
          title: 'Text Chat',
          subtitle: 'Conversational companion with multimodal context memory (Text, Voice, Camera, Photo)'
        };
      case 'voice_analysis':
        return {
          title: 'Voice Emotion Analysis',
          subtitle: 'Speech transcription & paralinguistic acoustic prosody'
        };
      case 'facial_analysis':
        return {
          title: 'Live Facial Expression Analysis',
          subtitle: 'Real-time webcam Action Unit morphological recognition'
        };
      case 'upload_analysis':
        return {
          title: 'Upload Facial Image Analysis',
          subtitle: 'Photograph Action Unit inspection and contextual narrative synthesis'
        };
      case 'multimodal_fusion':
        return {
          title: 'Multimodal Emotion Fusion Lab',
          subtitle: 'Decision-level synthesis across text, acoustic prosody, and facial cues'
        };
      case 'history':
        return {
          title: 'Emotion Recognition History',
          subtitle: 'Comprehensive audit log of predictions, indicators, and interventions'
        };
      case 'analytics':
        return {
          title: 'Analytics & Downloadable Reports',
          subtitle: 'Affective frequency distributions, trends, and PDF report generator'
        };
      case 'profile':
        return {
          title: 'User Profile & Preferences',
          subtitle: 'Personal goals, completed care records, and GDPR data management'
        };
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Theme, multilingual selection, hardware consent, and security options'
        };
      default:
        return {
          title: 'AI-Powered Mental Wellness Assistant',
          subtitle: 'Multimodal Emotion Recognition'
        };
    }
  };

  const { title, subtitle } = getSectionMetadata(currentSection);

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <HomeDashboard
            onNavigate={(sec) => setCurrentSection(sec)}
            onOpenBreathing={() => setIsBreathingOpen(true)}
          />
        );
      case 'chat':
        return <ChatAssistant />;
      case 'voice_analysis':
        return <VoiceAnalysis onNavigateToChat={() => setCurrentSection('chat')} />;
      case 'facial_analysis':
        return <FacialAnalysis onNavigateToChat={() => setCurrentSection('chat')} />;
      case 'upload_analysis':
        return <ImageUploadAnalysis onNavigateToChat={() => setCurrentSection('chat')} />;
      case 'multimodal_fusion':
        return <MultimodalFusion onNavigateToChat={() => setCurrentSection('chat')} />;
      case 'history':
        return <EmotionHistory />;
      case 'analytics':
        return <AnalyticsReports />;
      case 'profile':
        return <UserProfile />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <HomeDashboard
            onNavigate={(sec) => setCurrentSection(sec)}
            onOpenBreathing={() => setIsBreathingOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        onOpenCrisis={() => setIsCrisisOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Sticky Top Header */}
        <Header
          title={title}
          subtitle={subtitle}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCrisis={() => setIsCrisisOpen(true)}
          onOpenBreathing={() => setIsBreathingOpen(true)}
        />

        {/* Dynamic Page Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>

        {/* Global Ethical Disclaimer & Emergency Hotline Bar */}
        <DisclaimerBanner onOpenCrisis={() => setIsCrisisOpen(true)} />
      </div>

      {/* Modals */}
      <CrisisModal isOpen={isCrisisOpen} onClose={() => setIsCrisisOpen(false)} />
      <BreathingModal isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
