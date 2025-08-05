import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder = "Digite sua descrição em markdown..." }: MarkdownEditorProps) {
  const [mdValue, setMdValue] = useState(value);

  const handleChange = (val: string | undefined) => {
    const newValue = val || '';
    setMdValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="w-full border border-border rounded-md overflow-hidden">
      <MDEditor
        value={mdValue}
        onChange={handleChange}
        preview="edit"
        hideToolbar={false}
        visibleDragbar={false}
        textareaProps={{
          placeholder,
          style: {
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))'
          }
        }}
        height={350}
        data-color-mode="light"
      />
    </div>
  );
}