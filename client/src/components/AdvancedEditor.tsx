import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Underline, List, ListOrdered, Link, Image, Type, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface AdvancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AdvancedEditor({ value, onChange, placeholder }: AdvancedEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertImage = () => {
    if (imageUrl || previewUrl) {
      const imgTag = `<img src="${imageUrl || previewUrl}" alt="Imagem inserida" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />`;
      executeCommand('insertHTML', imgTag);
      setImageUrl('');
      setPreviewUrl('');
      setSelectedFile(null);
      setImageDialogOpen(false);
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkTag = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: hsl(var(--primary)); text-decoration: underline;">${linkText}</a>`;
      executeCommand('insertHTML', linkTag);
      setLinkUrl('');
      setLinkText('');
      setLinkDialogOpen(false);
    }
  };

  return (
    <div className="relative space-y-0">
      {/* Advanced Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 border border-border rounded-t-md bg-background">
        <div className="flex gap-1">
          <Button 
            variant={isCommandActive('formatBlock') ? "default" : "outline"} 
            size="sm"
            onClick={() => executeCommand('formatBlock', 'h1')}
            title="Título 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => executeCommand('formatBlock', 'h2')}
            title="Título 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => executeCommand('formatBlock', 'h3')}
            title="Título 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="w-px h-6 bg-border" />
        
        <div className="flex gap-1">
          <Button 
            variant={isCommandActive('bold') ? "default" : "outline"} 
            size="sm"
            onClick={() => executeCommand('bold')}
            title="Negrito"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            variant={isCommandActive('italic') ? "default" : "outline"} 
            size="sm"
            onClick={() => executeCommand('italic')}
            title="Itálico"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            variant={isCommandActive('underline') ? "default" : "outline"} 
            size="sm"
            onClick={() => executeCommand('underline')}
            title="Sublinhado"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="w-px h-6 bg-border" />
        
        <div className="flex gap-1">
          <Button 
            variant={isCommandActive('insertUnorderedList') ? "default" : "outline"} 
            size="sm"
            onClick={() => executeCommand('insertUnorderedList')}
            title="Lista com marcadores"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant={isCommandActive('insertOrderedList') ? "default" : "outline"} 
            size="sm"
            onClick={() => executeCommand('insertOrderedList')}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="w-px h-6 bg-border" />
        
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => executeCommand('justifyLeft')}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => executeCommand('justifyCenter')}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => executeCommand('justifyRight')}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="w-px h-6 bg-border" />
        
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Link className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="link-text">Texto do Link</Label>
                <Input
                  id="link-text"
                  placeholder="Clique aqui"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://exemplo.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={insertLink} disabled={!linkUrl || !linkText}>
                  Inserir Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Image className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Imagem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">URL da Imagem</Label>
                <Input
                  id="image-url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              
              <div className="text-center text-muted-foreground">ou</div>
              
              <div>
                <Label htmlFor="image-file">Upload de Arquivo</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
              
              {previewUrl && (
                <div className="mt-4">
                  <Label>Preview:</Label>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full h-32 object-cover rounded-md border"
                  />
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={insertImage} disabled={!imageUrl && !previewUrl}>
                  Inserir Imagem
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rich Text Editor */}
      <div className="border border-border rounded-b-md">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-[200px] p-4 prose prose-sm max-w-none dark:prose-invert focus:outline-none"
          style={{
            color: 'hsl(var(--foreground))',
            backgroundColor: 'hsl(var(--background))',
          }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />
        {!value && placeholder && (
          <div 
            className="absolute inset-0 p-4 text-muted-foreground italic pointer-events-none"
            style={{ top: '60px' }}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}