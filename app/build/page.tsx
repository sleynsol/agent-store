'use client';

import { useState } from 'react';
import { Drawer } from '@/components/Drawer';
import { ThemeLogo } from '@/components/ThemeLogo';
import { AvatarSelector } from '@/components/AvatarSelector';
import { BulletPointList } from '@/components/BulletPointList';
import Link from 'next/link';
import { ArrowLeft, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  title: string;
  traits: string[];
  avatarNumber: number;
  description: string;
  tools: string[];
  isPublic: boolean;
}

const getRandomAvatar = () => Math.floor(Math.random() * 8) + 1;
const MIN_DESCRIPTION_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 1000;

const AVAILABLE_TOOLS = [
  { id: 'web', label: 'Web Access', icon: '🌐', description: 'Search and access current information from the web' },
  { id: 'data_pods', label: 'Data Pods', icon: '📦', description: 'Access and analyze user-uploaded data pods' }
];

export default function BuildPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTraitsInfo, setShowTraitsInfo] = useState(false);
  const [showDescriptionInfo, setShowDescriptionInfo] = useState(false);
  const [showToolsInfo, setShowToolsInfo] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    traits: [],
    avatarNumber: getRandomAvatar(),
    description: '',
    tools: [],
    isPublic: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);


    // Check all validations
    if (
      formData.title.length < 3 ||
      formData.description.length < MIN_DESCRIPTION_LENGTH ||
      formData.traits.length === 0
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          traits: formData.traits,
          avatarNumber: formData.avatarNumber,
          description: formData.description,
          creator: user?.id,
          isPublic: formData.isPublic,
          tools: formData.tools
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const data = await response.json();
      
      // Redirect to the new agent's page
      router.push(`/app/${data.id}`);
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTool = (toolId: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter(id => id !== toolId)
        : [...prev.tools, toolId]
    }));
  };


  return (
    <div className="min-h-screen max-w-2xl mx-auto p-4">
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <Drawer />
        </div>
        <ThemeLogo />
      </header>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8">Build Your Own Agent</h1>

      {/* Build Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Selection with Title */}
        <div className="flex justify-center">
          <AvatarSelector
            selectedAvatar={formData.avatarNumber}
            onSelect={(number) => setFormData(prev => ({ ...prev, avatarNumber: number }))}
            title={formData.title}
            onTitleChange={(title) => setFormData(prev => ({ ...prev, title }))}
            showValidation={showValidation}
          />
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Visibility</h3>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.isPublic 
                ? "Your agent will be visible to everyone in the community" 
                : "Your agent will only be visible to you"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.isPublic ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          >
            <span className="sr-only">Toggle visibility</span>
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${
                formData.isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Agent Traits */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowTraitsInfo(!showTraitsInfo)}
            className="flex items-center gap-2 w-full text-left"
          >
            <label className="block text-sm font-medium">
              Agent Traits
            </label>
            <Info className="w-4 h-4 text-muted-foreground" />
            {showTraitsInfo ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
            )}
          </button>
          
          {showTraitsInfo && (
            <div className="text-sm p-3 bg-muted rounded-lg mb-2">
              <p className="font-medium mb-2">What is your agent good at?</p>
              <p className="text-muted-foreground mb-2">Add up to 3 specialties that define your agent's expertise.</p>
              <div className="text-muted-foreground">
                Examples:
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Python programming - helps with coding and debugging</li>
                  <li>• Creative writing - assists in content creation and storytelling</li>
                  <li>• Financial analysis - provides investment and market insights</li>
                </ul>
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg">
            <BulletPointList
              items={formData.traits}
              onChange={(traits) => setFormData(prev => ({ ...prev, traits }))}
              showValidation={showValidation}
            />
          </div>
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowDescriptionInfo(!showDescriptionInfo)}
            className="flex items-center gap-2 w-full text-left"
          >
            <label htmlFor="description" className="block text-sm font-medium">
              Character Description
            </label>
            <Info className="w-4 h-4 text-muted-foreground" />
            {showDescriptionInfo ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
            )}
          </button>

          {showDescriptionInfo && (
            <div className="text-sm p-3 bg-muted rounded-lg mb-2">
              <p className="font-medium mb-2">How should your agent behave?</p>
              <p className="text-muted-foreground mb-2">
                Start with "You are..." and describe your agent's personality and interaction style.
              </p>
              <div className="text-muted-foreground">
                Example:
                <p className="mt-1 text-foreground bg-background p-2 rounded border">
                  "You are a friendly coding mentor who specializes in Python. You help users learn programming through 
                  practical examples and clear explanations. You maintain a supportive and encouraging tone, while ensuring 
                  best practices are followed. When users make mistakes, you provide constructive feedback and guide them 
                  towards the correct solution."
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              minLength={MIN_DESCRIPTION_LENGTH}
              maxLength={MAX_DESCRIPTION_LENGTH}
              className="w-full h-32 px-4 py-2 rounded-lg border bg-background resize-none"
              placeholder="You are..."
              required
            />
            {showValidation && formData.description.length < MIN_DESCRIPTION_LENGTH && (
              <p className="text-xs text-red-500 px-1">
                At least {MIN_DESCRIPTION_LENGTH - formData.description.length} more characters needed
              </p>
            )}
            {formData.description.length > 0 && (
              <p className="text-xs text-muted-foreground px-1">
                {formData.description.length}/{MAX_DESCRIPTION_LENGTH} characters
              </p>
            )}
          </div>
        </div>

        {/* Tools Section */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowToolsInfo(!showToolsInfo)}
            className="flex items-center gap-2 w-full text-left"
          >
            <label className="block text-sm font-medium">
              Agent Tools
            </label>
            <Info className="w-4 h-4 text-muted-foreground" />
            {showToolsInfo ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
            )}
          </button>
          
          {showToolsInfo && (
            <div className="text-sm p-3 bg-muted rounded-lg mb-2">
              <p className="font-medium mb-2">What tools can your agent use?</p>
              <p className="text-muted-foreground mb-2">
                Select the tools and integrations that your agent will have access to.
                This determines what capabilities your agent will have.
              </p>
              <div className="mt-3 space-y-2">
                {AVAILABLE_TOOLS.map(tool => (
                  <div key={tool.id} className="flex items-start gap-2 text-muted-foreground">
                    <span className="mt-0.5">{tool.icon}</span>
                    <div>
                      <span className="font-medium text-foreground">{tool.label}:</span> {tool.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 p-4">
            {/* Available Tools */}
            <div className="space-x-2">
              {AVAILABLE_TOOLS.map(tool => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => toggleTool(tool.id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    formData.tools.includes(tool.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <span>{tool.icon}</span>
                  {tool.label}
                </button>
              ))}
            </div>

            {/* Coming Soon Card */}
            <div className="bg-muted/30 rounded-lg p-3 border border-dashed">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                These powerful tools are currently in development
              </p>
            </div>

            {/* Coming Soon Tools */}
            <div className="space-y-2">
              <button
                disabled
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-secondary/30 text-muted-foreground cursor-not-allowed w-full justify-start hover:bg-secondary/30"
              >
                <span>📅</span>
                Calendar Access
              </button>
              <button
                disabled
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-secondary/30 text-muted-foreground cursor-not-allowed w-full justify-start hover:bg-secondary/30"
              >
                <span>📁</span>
                File Access
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Agent...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
} 