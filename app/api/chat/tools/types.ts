import { z } from 'zod';

export interface Tool {
  description: string;
  parameters: z.ZodObject<any>;
  execute: (params: any) => Promise<string>;
}

export type ToolName = 'web_search' | 'data_pods_access';

export interface Tools {
  [key: string]: Tool;
} 