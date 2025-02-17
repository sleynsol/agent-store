import { webSearchTool } from './web-search';
import { dataPodsTool } from './data-pods';
import { Tools } from './types';

export const tools: Tools = {
  web_search: webSearchTool,
  data_pods_access: dataPodsTool,
} as const; 