'use client';

import { ChevronDown } from 'lucide-react';
import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ConversationCtx = {
  atBottom: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  setViewport: (node: HTMLDivElement | null) => void;
};

const ConversationContext = createContext<ConversationCtx | null>(null);

export function Conversation({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportNode, setViewportNode] = useState<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);

  const setViewport = useCallback((node: HTMLDivElement | null) => {
    viewportRef.current = node;
    setViewportNode(node);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const node = viewportRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    if (!viewportNode) return;

    const onScroll = () => {
      const delta = viewportNode.scrollHeight - viewportNode.scrollTop - viewportNode.clientHeight;
      setAtBottom(delta < 24);
    };

    onScroll();
    viewportNode.addEventListener('scroll', onScroll);

    return () => viewportNode.removeEventListener('scroll', onScroll);
  }, [viewportNode]);

  const value = useMemo(
    () => ({ atBottom, scrollToBottom, setViewport }),
    [atBottom, scrollToBottom, setViewport]
  );

  const handleWheelCapture = (event: React.WheelEvent<HTMLElement>) => {
    const node = viewportRef.current;
    if (!node) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Preserve native wheel behavior for controls/dropdowns that manage their own scroll.
    if (target.closest('textarea, input, select, [data-allow-native-scroll="true"]')) {
      return;
    }

    if (node.scrollHeight <= node.clientHeight) {
      return;
    }

    node.scrollTop += event.deltaY;
    event.preventDefault();
  };

  return (
    <ConversationContext.Provider value={value}>
      <section
        className="relative flex min-h-0 flex-1 flex-col"
        onWheelCapture={handleWheelCapture}
      >
        {children}
      </section>
    </ConversationContext.Provider>
  );
}

export function ConversationContent({
  children,
  forceAutoScroll = false,
}: {
  children: ReactNode;
  forceAutoScroll?: boolean;
}) {
  const ctx = useContext(ConversationContext);
  const atBottom = ctx?.atBottom ?? true;
  const scrollToBottom = ctx?.scrollToBottom;
  const setViewport = ctx?.setViewport;
  const shouldAutoStickRef = useRef(true);

  useEffect(() => {
    shouldAutoStickRef.current = atBottom;
  }, [atBottom]);

  useEffect(() => {
    if (forceAutoScroll) {
      shouldAutoStickRef.current = true;
    }
  }, [forceAutoScroll]);

  useLayoutEffect(() => {
    if (shouldAutoStickRef.current && scrollToBottom) {
      scrollToBottom('auto');
    }
  }, [children, scrollToBottom]);

  return (
    <div
      className="mx-auto min-h-0 w-full max-w-5xl flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 pb-24 pt-5 md:px-6"
      ref={setViewport}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

export function ConversationScrollButton() {
  const ctx = useContext(ConversationContext);
  if (!ctx || ctx.atBottom) return null;

  return (
    <button
      className="absolute bottom-4 left-1/2 z-20 inline-flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 shadow-lg backdrop-blur transition hover:scale-[1.04] hover:text-white"
      onClick={() => ctx.scrollToBottom('smooth')}
      type="button"
    >
      <ChevronDown className="size-5" />
    </button>
  );
}
