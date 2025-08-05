import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Image, Link, Upload } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'blockquote', 'code-block', 'image', 'link'
  ];

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
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection();
        quill.insertEmbed(range?.index || 0, 'image', imageUrl || previewUrl);
      }
      setImageUrl('');
      setPreviewUrl('');
      setSelectedFile(null);
      setImageDialogOpen(false);
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection();
        quill.insertText(range?.index || 0, linkText, 'link', linkUrl);
      }
      setLinkUrl('');
      setLinkText('');
      setLinkDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar personalizada */}
      <div className="flex gap-2 p-2 border border-border rounded-t-md bg-background">
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Image className="h-4 w-4 mr-1" />
              Imagem
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
                  ref={fileInputRef}
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

        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Link className="h-4 w-4 mr-1" />
              Link
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
      </div>

      {/* Editor Quill */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: 'hsl(var(--background))',
        }}
      />
    </div>
  );
}