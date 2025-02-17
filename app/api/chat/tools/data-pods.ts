import { z } from 'zod';

export const dataPodsTool = {
  name: 'data_pods_access',
  description: 'Search through user data pods to retrieve stored information',
  parameters: z.object({
    query: z.string().describe('What information you want to find in the data pods'),
  }),
  execute: async (params: { query: string; dataPodsContent?: string }) => {
    const { query, dataPodsContent } = params;
    console.log("DP2", dataPodsContent);

    if (!dataPodsContent) {
      return "No accessible data pods found. Please grant access to data pods in the Data Pods section.";
    }
    return dataPodsContent;
  },
}; 