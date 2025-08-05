import MDEditor from '@uiw/react-md-editor';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ 
  content, 
  className = "" 
}: MarkdownRendererProps) {
  if (!content) {
    return null;
  }

  return (
    <div className={`markdown-content ${className}`}>
      <MDEditor.Markdown 
        source={content} 
        style={{ 
          backgroundColor: 'transparent',
          color: 'inherit',
          padding: 0
        }}
      />
    </div>
  );
}