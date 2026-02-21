'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  BookOpen,
  FileText,
  Database,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Search,
  Filter,
  Layers,
  FileCode,
  Shield,
  HelpCircle,
  Info,
  Target,
  Scale,
  User,
  Settings,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KnowledgeEntry {
  id: string;
  category: string;
  key: string;
  data: Record<string, unknown>;
  description?: string;
}

interface PlatformDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  chunk_index: number;
  metadata?: Record<string, unknown>;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'platform_info', label: 'Platform Info', icon: Info, color: 'from-blue-500 to-cyan-500' },
  { value: 'founder', label: 'Founder', icon: User, color: 'from-purple-500 to-pink-500' },
  { value: 'mission', label: 'Mission & Vision', icon: Target, color: 'from-emerald-500 to-teal-500' },
  { value: 'legal', label: 'Legal', icon: Scale, color: 'from-amber-500 to-orange-500' },
  { value: 'faq', label: 'FAQs', icon: HelpCircle, color: 'from-violet-500 to-indigo-500' },
  { value: 'policy', label: 'Policies', icon: Shield, color: 'from-rose-500 to-red-500' },
  { value: 'metadata', label: 'Metadata', icon: Settings, color: 'from-slate-500 to-gray-500' },
];

const DOCUMENT_TYPES = [
  { value: 'privacy_policy', label: 'Privacy Policy', icon: Shield, color: 'from-blue-500 to-cyan-500' },
  { value: 'terms_of_service', label: 'Terms of Service', icon: FileText, color: 'from-emerald-500 to-teal-500' },
  { value: 'terms_and_conditions', label: 'Terms & Conditions', icon: Scale, color: 'from-amber-500 to-orange-500' },
  { value: 'legal_disclaimer', label: 'Legal Disclaimer', icon: AlertCircle, color: 'from-red-500 to-rose-500' },
  { value: 'platform_rules', label: 'Platform Rules', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
  { value: 'faq_detailed', label: 'Detailed FAQs', icon: HelpCircle, color: 'from-violet-500 to-indigo-500' },
  { value: 'policy_detailed', label: 'Detailed Policy', icon: FileCode, color: 'from-cyan-500 to-blue-500' },
  { value: 'about_platform', label: 'About Platform', icon: Info, color: 'from-teal-500 to-emerald-500' },
  { value: 'founder_story', label: 'Founder Story', icon: User, color: 'from-pink-500 to-rose-500' },
];

// ─── Animated Background Component ────────────────────────────────────────────

function AnimatedBackground() {
  return (
    <>
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 157, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 157, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridFlow 20s linear infinite'
          }}
        />
      </div>
      <style jsx global>{`
        @keyframes gridFlow {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 157, 0.2); }
          50% { box-shadow: 0 0 40px rgba(0, 255, 157, 0.4); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}

// ─── Glass Card Component ─────────────────────────────────────────────────────

function GlassCard({ children, className = '', hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-[#0f1419]/80 backdrop-blur-xl
        border border-[#1e2a38] rounded-2xl
        ${hover ? 'transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5' : ''}
        ${className}
      `}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── Neon Button Component ────────────────────────────────────────────────────

function NeonButton({
  children,
  onClick,
  variant = 'primary',
  size = 'default',
  disabled = false,
  className = '',
  title
}: {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 border-transparent',
    secondary: 'bg-transparent border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500',
    danger: 'bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500',
    ghost: 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
  };

  const sizes = {
    default: 'px-5 py-2.5 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    icon: 'p-2'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center gap-2
        font-medium rounded-xl border
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// ─── Stats Card Component ─────────────────────────────────────────────────────

function StatsCard({
  title,
  value,
  icon: Icon,
  gradient,
  description
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description?: string;
}) {
  return (
    <GlassCard className="p-5 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Category Badge Component ─────────────────────────────────────────────────

function CategoryBadge({ category, showIcon = true }: { category: string; showIcon?: boolean }) {
  const cat = CATEGORIES.find(c => c.value === category);
  if (!cat) return null;

  const Icon = cat.icon;

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 
      rounded-lg text-xs font-medium
      bg-gradient-to-r ${cat.color} bg-opacity-10
      border border-current/20
    `}>
      {showIcon && <Icon className="w-3 h-3" />}
      {cat.label}
    </span>
  );
}

// ─── Document Type Badge Component ────────────────────────────────────────────

function DocumentTypeBadge({ type }: { type: string }) {
  const docType = DOCUMENT_TYPES.find(d => d.value === type);
  if (!docType) return <span className="text-slate-400">{type}</span>;

  const Icon = docType.icon;

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 
      rounded-lg text-xs font-medium
      bg-gradient-to-r ${docType.color} bg-opacity-10
      border border-current/20
    `}>
      <Icon className="w-3 h-3" />
      {docType.label}
    </span>
  );
}

// ─── JSON Viewer Component ────────────────────────────────────────────────────

function JsonViewer({ data, expanded = false }: { data: Record<string, unknown>; expanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {isExpanded ? 'Collapse' : 'Expand'} JSON
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div
        className={`
          overflow-hidden transition-all duration-300
          ${isExpanded ? 'max-h-[500px]' : 'max-h-24'}
        `}
      >
        <pre className="p-3 rounded-xl bg-[#0a0d10] border border-[#1e2a38] text-xs font-mono overflow-x-auto">
          <code className="text-emerald-400">
            {jsonString}
          </code>
        </pre>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0d10] to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
}

// ─── Structured Facts Tab ─────────────────────────────────────────────────────

function FactsTab() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);
  const [formData, setFormData] = useState({ category: '', key: '', data: '{}', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge');
      const json = await res.json();
      if (json.success) setEntries(json.data);
      else toast.error('Failed to load knowledge entries');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    // Step 1: Local Validaton
    let parsedData: Record<string, unknown>;
    try {
      parsedData = JSON.parse(formData.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON format';
      toast.error(`JSON Syntax Error: ${msg}`);
      console.error('Local JSON Parse Error:', err);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          key: formData.key,
          data: parsedData,
          description: formData.description || undefined,
          is_active: true,
        }),
      });

      let json;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const text = await res.text();
        // If the server returns "Internal Server Error" as text, we show that
        throw new Error(text || `Server Error (${res.status})`);
      }

      if (json.success) {
        toast.success(editing?.id ? 'Updated successfully' : 'Created successfully');
        cancelEdit();
        await fetchEntries();
      } else {
        toast.error(json.error || 'Save failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown communication error';
      // If it's a server crash (500 text), msg will be "Internal Server Error"
      toast.error(msg);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(formData.data);
      setFormData({ ...formData, data: JSON.stringify(parsed, null, 2) });
      toast.success('JSON formatted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON';
      toast.error(`Cannot format: ${msg}`);
    }
  };

  async function handleDelete(entry: KnowledgeEntry) {
    if (!confirm(`Delete "${entry.key}" from ${entry.category}?`)) return;
    setDeleting(entry.id);
    try {
      const res = await fetch(
        `/api/admin/knowledge?category=${entry.category}&key=${entry.key}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (json.success) {
        toast.success('Deleted');
        await fetchEntries();
      } else {
        toast.error(json.error || 'Delete failed');
      }
    } catch { toast.error('Network error'); }
    finally { setDeleting(null); }
  }

  function startEdit(entry: KnowledgeEntry) {
    setEditing(entry);
    setFormData({
      category: entry.category,
      key: entry.key,
      data: JSON.stringify(entry.data, null, 2),
      description: entry.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditing(null);
    setFormData({ category: '', key: '', data: '{}', description: '' });
  }

  const filteredEntries = entries.filter(entry =>
    entry.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.description && entry.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Add / Edit Form */}
      {editing && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              {editing.id ? <Pencil className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {editing.id ? 'Edit Structured Fact' : 'New Structured Fact'}
              </h3>
              <p className="text-sm text-slate-400">
                {editing.id ? 'Update the knowledge entry' : 'Add a new knowledge entry for AI'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                  required
                >
                  <SelectTrigger className="bg-[#0a0d10] border-[#1e2a38] text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1419] border-[#1e2a38]">
                    {CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        value={cat.value}
                        className="text-white focus:bg-emerald-500/10 focus:text-emerald-400"
                      >
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Key</Label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., founder_details"
                  className="bg-[#0a0d10] border-[#1e2a38] text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Description (optional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this entry"
                className="bg-[#0a0d10] border-[#1e2a38] text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-300">Data (JSON)</Label>
                <button
                  type="button"
                  onClick={formatJson}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Format JSON
                </button>
              </div>
              <Textarea
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                placeholder='{"key": "value"}'
                rows={8}
                className="bg-[#0a0d10] border-[#1e2a38] text-emerald-400 font-mono text-sm rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-slate-600"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Entry'}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEdit} className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 rounded-xl">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facts..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0d10] border border-[#1e2a38] rounded-xl text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-slate-600"
          />
        </div>
        {!editing && (
          <NeonButton
            variant="primary"
            onClick={() =>
              setEditing({ id: '', category: 'platform_info', key: '', data: {}, description: '' })
            }
          >
            <Plus className="w-4 h-4" />
            Add Fact
          </NeonButton>
        )}
      </div>

      {/* List */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Structured Facts</h3>
            <p className="text-sm text-slate-400">{entries.length} total entries</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-slate-400">Loading facts...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-2xl bg-[#0a0d10] border border-[#1e2a38] mb-4">
              <BookOpen className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-center">
              {searchQuery ? 'No facts match your search' : 'No facts yet. Add your first one above.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div
                key={`${entry.category}/${entry.key}`}
                className="group p-4 rounded-xl bg-[#0a0d10] border border-[#1e2a38] hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CategoryBadge category={entry.category} />
                      <code className="px-2 py-0.5 bg-[#0f1419] border border-[#1e2a38] rounded-lg text-sm text-emerald-400 font-mono">
                        {entry.key}
                      </code>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-slate-400">{entry.description}</p>
                    )}
                    <JsonViewer data={entry.data} />
                  </div>
                  <div className="flex shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <NeonButton variant="ghost" size="icon" onClick={() => startEdit(entry)}>
                      <Pencil className="w-4 h-4" />
                    </NeonButton>
                    <NeonButton
                      variant="danger"
                      size="icon"
                      disabled={deleting === entry.id}
                      onClick={() => handleDelete(entry)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </NeonButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab() {
  const [docs, setDocs] = useState<PlatformDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PlatformDocument | null>(null);
  const [formData, setFormData] = useState({
    document_type: '',
    title: '',
    content: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/documents');
      const json = await res.json();
      if (json.success) setDocs(json.data);
      else toast.error('Failed to load documents');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        document_type: formData.document_type,
        title: formData.title,
        content: formData.content,
        is_active: formData.is_active,
      };
      if (editing?.id) payload.id = editing.id;

      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editing?.id ? 'Document updated' : 'Document created');
        cancelEdit();
        await fetchDocs();
      } else {
        toast.error(json.error || 'Save failed');
      }
    } catch { toast.error('Save error'); }
    finally { setSaving(false); }
  }

  async function handleToggle(doc: PlatformDocument) {
    setToggling(doc.id);
    try {
      const res = await fetch('/api/admin/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: doc.id, is_active: !doc.is_active }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(doc.is_active ? 'Document deactivated (AI will ignore it)' : 'Document activated (AI can use it)');
        await fetchDocs();
      } else {
        toast.error(json.error || 'Toggle failed');
      }
    } catch { toast.error('Network error'); }
    finally { setToggling(null); }
  }

  async function handleDelete(doc: PlatformDocument) {
    if (!confirm(`Permanently delete "${doc.title}"?`)) return;
    setDeleting(doc.id);
    try {
      const res = await fetch(`/api/admin/documents?id=${doc.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Document deleted');
        await fetchDocs();
      } else {
        toast.error(json.error || 'Delete failed');
      }
    } catch { toast.error('Network error'); }
    finally { setDeleting(null); }
  }

  function startEdit(doc: PlatformDocument) {
    setEditing(doc);
    setFormData({
      document_type: doc.document_type,
      title: doc.title,
      content: doc.content,
      is_active: doc.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditing(null);
    setFormData({ document_type: '', title: '', content: '', is_active: true });
  }

  const filteredDocs = docs.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDocs = docs.filter(d => d.is_active).length;

  return (
    <div className="space-y-6">
      {/* Add / Edit Form */}
      {editing && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
              {editing.id ? <Pencil className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {editing.id ? 'Edit Document' : 'New Document'}
              </h3>
              <p className="text-sm text-slate-400">
                {editing.id ? 'Update the document content' : 'Create a new AI-readable document'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Document Type</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(v) => setFormData({ ...formData, document_type: v })}
                  required
                >
                  <SelectTrigger className="bg-[#0a0d10] border-[#1e2a38] text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1419] border-[#1e2a38]">
                    {DOCUMENT_TYPES.map((dt) => (
                      <SelectItem
                        key={dt.value}
                        value={dt.value}
                        className="text-white focus:bg-emerald-500/10 focus:text-emerald-400"
                      >
                        <div className="flex items-center gap-2">
                          <dt.icon className="w-4 h-4" />
                          {dt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Document title"
                  className="bg-[#0a0d10] border-[#1e2a38] text-white rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">
                Content{' '}
                <span className="text-slate-500 font-normal">(plain text — this is what the AI reads)</span>
              </Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the document content here..."
                rows={14}
                className="bg-[#0a0d10] border-[#1e2a38] text-slate-300 font-mono text-sm rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-slate-600"
                required
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0d10] border border-[#1e2a38]">
              <input
                id="doc-active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500/20 bg-transparent"
              />
              <Label htmlFor="doc-active" className="text-sm text-slate-300 cursor-pointer">
                Active (AI can use this document)
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:shadow-lg hover:shadow-violet-500/25 rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Document'}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEdit} className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10 rounded-xl">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0d10] border border-[#1e2a38] rounded-xl text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-slate-600"
          />
        </div>
        {!editing && (
          <NeonButton
            variant="primary"
            onClick={() =>
              setEditing({ id: '', document_type: 'about_platform', title: '', content: '', chunk_index: 0, version: '1.0.0', is_active: true, created_at: '', updated_at: '' })
            }
          >
            <Plus className="w-4 h-4" />
            Add Document
          </NeonButton>
        )}
      </div>

      {/* Document List */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Platform Documents</h3>
            <p className="text-sm text-slate-400">{docs.length} total documents • {activeDocs} active</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-slate-400">Loading documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-2xl bg-[#0a0d10] border border-[#1e2a38] mb-4">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-center">
              {searchQuery ? 'No documents match your search' : 'No documents yet. Create your first one above.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className={`group p-4 rounded-xl bg-[#0a0d10] border border-[#1e2a38] transition-all duration-300 ${doc.is_active
                  ? 'hover:border-emerald-500/30'
                  : 'opacity-50 hover:opacity-75'
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <DocumentTypeBadge type={doc.document_type} />
                      <span className="font-medium text-white">{doc.title}</span>
                      {doc.is_active ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-medium text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{doc.content}</p>
                  </div>
                  <div className="flex shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <NeonButton
                      variant="ghost"
                      size="icon"
                      title={doc.is_active ? 'Deactivate (hide from AI)' : 'Activate (show to AI)'}
                      disabled={toggling === doc.id}
                      onClick={() => handleToggle(doc)}
                    >
                      {doc.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </NeonButton>
                    <NeonButton variant="ghost" size="icon" onClick={() => startEdit(doc)}>
                      <Pencil className="w-4 h-4" />
                    </NeonButton>
                    <NeonButton
                      variant="danger"
                      size="icon"
                      disabled={deleting === doc.id}
                      onClick={() => handleDelete(doc)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </NeonButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = 'facts' | 'documents';

export default function KnowledgeClient() {
  const [activeTab, setActiveTab] = useState<Tab>('facts');
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [docs, setDocs] = useState<PlatformDocument[]>([]);

  // Fetch counts for stats
  useEffect(() => {
    fetch('/api/admin/knowledge')
      .then(res => res.json())
      .then(json => { if (json.success) setEntries(json.data); })
      .catch(() => { });

    fetch('/api/admin/documents')
      .then(res => res.json())
      .then(json => { if (json.success) setDocs(json.data); })
      .catch(() => { });
  }, []);

  const activeDocs = docs.filter(d => d.is_active).length;

  return (
    <div className="min-h-screen bg-[#0a0d10] relative">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                AI Knowledge Base
              </h1>
              <p className="text-slate-400 mt-1">
                Manage what the AI assistant knows about your platform
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Facts"
            value={entries.length}
            icon={Database}
            gradient="from-blue-400 to-cyan-400"
            description="Structured data points"
          />
          <StatsCard
            title="Documents"
            value={docs.length}
            icon={FileText}
            gradient="from-violet-400 to-purple-400"
            description="AI-readable docs"
          />
          <StatsCard
            title="Active Docs"
            value={activeDocs}
            icon={Zap}
            gradient="from-emerald-400 to-teal-400"
            description="Available to AI"
          />
          <StatsCard
            title="Categories"
            value={CATEGORIES.length}
            icon={Layers}
            gradient="from-amber-400 to-orange-400"
            description="Data categories"
          />
        </div>

        {/* Tab Bar */}
        <div className="mb-6">
          <div className="inline-flex p-1 rounded-xl bg-[#0f1419] border border-[#1e2a38]">
            <button
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-300
                ${activeTab === 'facts'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
              `}
              onClick={() => setActiveTab('facts')}
            >
              <BookOpen className="w-4 h-4" />
              Structured Facts
            </button>
            <button
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-300
                ${activeTab === 'documents'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
              `}
              onClick={() => setActiveTab('documents')}
            >
              <FileText className="w-4 h-4" />
              Documents
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'facts' ? <FactsTab /> : <DocumentsTab />}
      </div>
    </div>
  );
}