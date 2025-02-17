export interface App {
  id: string;
  title: string;
  traits: string;
  link: string;
  imageUrl: string;
  provider: string;
  model: string;
  characterDescription: string;
  creatorWallet: string;
  flames?: number;
  isPublic: boolean;
  tools: string[];
} 