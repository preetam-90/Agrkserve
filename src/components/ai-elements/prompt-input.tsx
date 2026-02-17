'use client';

import { Paperclip, Plus, Send } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export type PromptInputAttachment = { id: string; name: string; type: string; url: string };
export type PromptInputMessage = { text?: string; files?: PromptInputAttachment[] };

const PromptInputContext = createContext<{
  files: PromptInputAttachment[];
  addFiles: (files: FileList | null) => void;
  remove: (id: string) => void;
  clear: () => void;
} | null>(null);

export function PromptInput({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: (message: PromptInputMessage) => void;
  globalDrop?: boolean;
  multiple?: boolean;
}) {
  const [files, setFiles] = useState<PromptInputAttachment[]>([]);

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return;

    const next = Array.from(list).map((file) => ({
      id: nanoid(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...next]);
  }, []);

  const remove = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((file) => file.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((file) => file.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((file) => URL.revokeObjectURL(file.url));
      return [];
    });
  }, []);

  const value = useMemo(() => ({ files, addFiles, remove, clear }), [files, addFiles, remove, clear]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const text = String(formData.get('prompt') ?? '').trim();
    onSubmit({ text, files });
    clear();
  };

  return (
    <PromptInputContext.Provider value={value}>
      <form
        className="relative overflow-visible rounded-2xl border border-white/15 bg-gradient-to-br from-[#111c18] to-[#0a120f] shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
        onSubmit={handleSubmit}
      >
        {children}
      </form>
    </PromptInputContext.Provider>
  );
}

export function usePromptInputAttachments() {
  const ctx = useContext(PromptInputContext);
  if (!ctx) {
    return { files: [], remove: () => undefined };
  }

  return { files: ctx.files, remove: ctx.remove };
}

export function PromptInputHeader({ children }: { children: ReactNode }) {
  return <div className="border-b border-white/10 px-3 py-2">{children}</div>;
}

export function PromptInputBody({ children }: { children: ReactNode }) {
  return <div className="px-3 pb-2 pt-3">{children}</div>;
}

export function PromptInputFooter({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2">{children}</div>;
}

export function PromptInputTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.form;
      if (form) form.requestSubmit();
    }

    props.onKeyDown?.(event);
  };

  return (
    <Textarea
      {...props}
      className="min-h-[96px] resize-none border-white/10 bg-black/20 text-sm text-white placeholder:text-white/40 hover:border-white/20 focus-visible:ring-emerald-400"
      name="prompt"
      onKeyDown={handleKeyDown}
      placeholder={props.placeholder || 'Ask AgriServe AI anything...'}
    />
  );
}

export function PromptInputTools({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-1.5">{children}</div>;
}

export function PromptInputButton({ children, className, variant, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={`h-9 rounded-lg border border-transparent px-3 text-xs text-white/90 transition hover:border-white/20 hover:bg-white/10 ${className || ''}`}
      size="sm"
      variant={variant || 'ghost'}
      {...props}
    >
      {children}
    </Button>
  );
}

export function PromptInputSubmit({
  disabled,
  status,
}: {
  disabled?: boolean;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
}) {
  const label = status === 'streaming' ? 'Streaming' : 'Send';

  return (
    <Button
      className="h-9 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-3 text-xs text-black shadow-none hover:from-emerald-400 hover:to-green-400"
      disabled={disabled}
      size="sm"
      type="submit"
      variant="default"
    >
      <Send className="size-3.5" />
      {label}
    </Button>
  );
}

export function PromptInputActionMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </MenuContext.Provider>
  );
}

const MenuContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function PromptInputActionMenuTrigger() {
  const ctx = useContext(MenuContext);
  if (!ctx) return null;

  return (
    <Button
      className="h-9 rounded-lg border border-transparent text-white/90 hover:border-white/20 hover:bg-white/10"
      onClick={() => ctx.setOpen(!ctx.open)}
      size="sm"
      type="button"
      variant="ghost"
    >
      <Plus className="size-3.5" />
    </Button>
  );
}

export function PromptInputActionMenuContent({ children }: { children: ReactNode }) {
  const ctx = useContext(MenuContext);
  if (!ctx?.open) return null;

  return (
    <div className="absolute bottom-11 left-0 z-30 min-w-44 rounded-xl border border-white/15 bg-[#0d1713] p-1.5 shadow-xl">
      {children}
    </div>
  );
}

export function PromptInputActionAddAttachments() {
  const ctx = useContext(PromptInputContext);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        className="w-full justify-start rounded-lg text-xs text-white/90 hover:bg-white/10"
        onClick={() => inputRef.current?.click()}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Paperclip className="size-3.5" />
        Attach files
      </Button>
      <input
        className="hidden"
        multiple
        onChange={(event) => ctx?.addFiles(event.target.files)}
        ref={inputRef}
        type="file"
      />
    </>
  );
}
