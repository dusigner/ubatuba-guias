import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Underline, List, ListOrdered, Link, Image, Type, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Palette, Table, Quote, Code, Undo, Redo } from 'lucide-react';

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
  const [showColorPicker, setShowColorPicker] = useState(false);
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
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  const isCommandActive = (command: string): boolean => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  const insertHTML = (html: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Criar elemento temporário para inserir HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Inserir cada elemento
        while (tempDiv.firstChild) {
          range.insertNode(tempDiv.firstChild);
          range.collapse(false);
        }
        
        // Reposicionar cursor
        const newRange = document.createRange();
        newRange.setStartAfter(range.commonAncestorContainer);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Se não há seleção, adiciona no final
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        while (tempDiv.firstChild) {
          editorRef.current.appendChild(tempDiv.firstChild);
        }
      }
      
      // Triggerar input event manualmente para detectar mudanças
      const inputEvent = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(inputEvent);
    }
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
    const srcUrl = imageUrl || previewUrl;
    if (srcUrl && editorRef.current) {
      console.log('Inserindo imagem:', srcUrl);
      
      editorRef.current.focus();
      
      // Usar execCommand para inserir imagem
      if (document.queryCommandSupported('insertImage')) {
        document.execCommand('insertImage', false, srcUrl);
      } else {
        // Fallback: inserir via HTML
        const imgHtml = `<p><img src="${srcUrl}" alt="Imagem inserida" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; display: block;" /></p>`;
        document.execCommand('insertHTML', false, imgHtml);
      }
      
      handleInput();
      
      setImageUrl('');
      setPreviewUrl('');
      setSelectedFile(null);
      setImageDialogOpen(false);
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText && editorRef.current) {
      console.log('Inserindo link:', linkText, linkUrl);
      
      editorRef.current.focus();
      
      // Usar createLink command
      if (document.queryCommandSupported('createLink')) {
        // Primeiro inserir o texto
        document.execCommand('insertText', false, linkText);
        // Selecionar o texto inserido
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.setStart(range.endContainer, range.endOffset - linkText.length);
          selection.removeAllRanges();
          selection.addRange(range);
          // Criar o link
          document.execCommand('createLink', false, linkUrl);
        }
      } else {
        // Fallback: inserir via HTML
        const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: hsl(var(--primary)); text-decoration: underline;">${linkText}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      }
      
      handleInput();
      
      setLinkUrl('');
      setLinkText('');
      setLinkDialogOpen(false);
    }
  };

  const formatBlock = (tag: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('formatBlock', false, tag);
      handleInput();
    }
  };

  const insertTable = () => {
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid hsl(var(--border));">
        <thead>
          <tr style="background-color: hsl(var(--muted));">
            <th style="border: 1px solid hsl(var(--border)); padding: 8px; text-align: left;">Cabeçalho 1</th>
            <th style="border: 1px solid hsl(var(--border)); padding: 8px; text-align: left;">Cabeçalho 2</th>
            <th style="border: 1px solid hsl(var(--border)); padding: 8px; text-align: left;">Cabeçalho 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid hsl(var(--border)); padding: 8px;">Célula 1</td>
            <td style="border: 1px solid hsl(var(--border)); padding: 8px;">Célula 2</td>
            <td style="border: 1px solid hsl(var(--border)); padding: 8px;">Célula 3</td>
          </tr>
          <tr>
            <td style="border: 1px solid hsl(var(--border)); padding: 8px;">Célula 4</td>
            <td style="border: 1px solid hsl(var(--border)); padding: 8px;">Célula 5</td>
            <td style="border: 1px solid hsl(var(--border)); padding: 8px;">Célula 6</td>
          </tr>
        </tbody>
      </table>
    `;
    insertHTML(tableHTML);
  };

  const insertQuote = () => {
    const quoteHTML = `<blockquote style="border-left: 4px solid hsl(var(--primary)); padding-left: 16px; margin: 16px 0; font-style: italic; color: hsl(var(--muted-foreground));">Digite sua citação aqui...</blockquote>`;
    insertHTML(quoteHTML);
  };

  const changeTextColor = (color: string) => {
    executeCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const changeBackgroundColor = (color: string) => {
    executeCommand('hiliteColor', color);
    setShowColorPicker(false);
  };

  const colors = [
    '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
    '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
    '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b266', '#66a3e0', '#c285ff',
    '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
    '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'
  ];

  return (
    <div className="relative space-y-0">
      {/* Advanced Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 border border-border rounded-t-md bg-background">
        <div className="flex gap-1">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => formatBlock('h1')}
            title="Título 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => formatBlock('h2')}
            title="Título 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => formatBlock('h3')}
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
        
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => executeCommand('undo')}
            title="Desfazer"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => executeCommand('redo')}
            title="Refazer"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="w-px h-6 bg-border" />
        
        <div className="flex gap-1">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Cores"
            >
              <Palette className="h-4 w-4" />
            </Button>
            {showColorPicker && (
              <div className="absolute top-10 left-0 bg-background border border-border rounded-md p-3 shadow-lg z-50 min-w-[200px]">
                <div className="mb-2 text-sm font-medium">Cor do Texto</div>
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => changeTextColor(color)}
                      title={color}
                    />
                  ))}
                </div>
                <div className="mb-2 text-sm font-medium">Cor de Fundo</div>
                <div className="grid grid-cols-7 gap-1">
                  {colors.map((color) => (
                    <button
                      key={`bg-${color}`}
                      className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => changeBackgroundColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={insertTable}
            title="Inserir tabela"
          >
            <Table className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={insertQuote}
            title="Citação"
          >
            <Quote className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => executeCommand('formatBlock', 'pre')}
            title="Código"
          >
            <Code className="h-4 w-4" />
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
                  placeholder="https://images.unsplash.com/photo-1234567890/exemplo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cole uma URL de imagem ou use o upload abaixo
                </p>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos suportados: JPG, PNG, GIF (máx. 5MB)
                </p>
              </div>
              
              {(previewUrl || imageUrl) && (
                <div className="mt-4">
                  <Label>Preview:</Label>
                  <div className="mt-2 p-4 border border-border rounded-md bg-muted/20">
                    <img 
                      src={previewUrl || imageUrl} 
                      alt="Preview" 
                      className="max-w-full h-48 object-contain rounded-md mx-auto block"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.textContent = 'Erro ao carregar imagem. Verifique a URL.';
                      }}
                    />
                    <div className="text-red-500 text-sm mt-2 hidden"></div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={insertImage} 
                  disabled={!imageUrl && !previewUrl}
                  className="bg-primary hover:bg-primary/90"
                >
                  Inserir Imagem no Editor
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
          className="min-h-[200px] p-4 prose prose-sm max-w-none dark:prose-invert focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset"
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