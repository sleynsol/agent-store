export const formatText = (text: string) => {
  return text
    // Handle tool references (@tool)
    .replace(/@(web|data_pods)\b/g, (match, tool) => {
      const icon = tool === 'web' ? '🌐' : tool === 'data_pods' ? '📦' : '🔧';
      const description = tool === 'web' ? 'Web Search' : tool === 'data_pods' ? 'Data Pods' : 'Tool';
      return `<span class="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md [.bg-secondary_&]:bg-background/50 [.bg-primary_&]:bg-secondary border border-border/40 text-xs font-medium">
        <span>${icon}</span>
        <span>${description}</span>
      </span>`;
    })
    // Handle bold text (*text*)
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    // Handle italic text (_text_)
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Handle bullet points with minimal spacing
    .replace(/^[•\s]+(.+)$/gm, '<div class="flex items-start gap-2 leading-5"><span class="text-muted-foreground">•</span><span>$1</span></div>')
    .replace(/(?:\n|^)(\s*•\s*[^\n]+)/g, '<div class="flex items-start gap-2 leading-5"><span class="text-muted-foreground">•</span><span>$1</span></div>')
    // Handle line breaks
    .replace(/\\n/g, '')
    .replace(/\n/g, '');
};

export const formatChatMessage = (text: string) => {
  return text
    // Handle tool references (@tool)
    .replace(/@(web|data_pods)\b/g, (match, tool) => {
      const icon = tool === 'web' ? '🌐' : tool === 'data_pods' ? '📦' : '🔧';
      const description = tool === 'web' ? 'Web Search' : tool === 'data_pods' ? 'Data Pods' : 'Tool';
      return `<span class="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md [.bg-secondary_&]:bg-background/50 [.bg-primary_&]:bg-secondary border border-border/40 text-xs font-medium">
        <span>${icon}</span>
        <span>${description}</span>
      </span>`;
    })
    // Handle bold text (*text*)
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    // Handle italic text (_text_)
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Handle line breaks
    .replace(/\\n/g, '<br>')
    .replace(/\n/g, '<br>');
}; 