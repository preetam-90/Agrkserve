'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
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

interface KnowledgeEntry {
  id: string;
  category: string;
  key: string;
  data: Record<string, unknown>;
  description?: string;
}

const CATEGORIES = [
  { value: 'platform_info', label: 'Platform Info' },
  { value: 'founder', label: 'Founder' },
  { value: 'mission', label: 'Mission & Vision' },
  { value: 'legal', label: 'Legal' },
  { value: 'faq', label: 'FAQs' },
  { value: 'policy', label: 'Policies' },
  { value: 'metadata', label: 'Metadata' },
];

export default function KnowledgeClient() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    key: '',
    data: '{}',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch('/api/admin/knowledge');
      const json = await res.json();
      if (json.success) {
        setEntries(json.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load knowledge entries');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const parsedData = JSON.parse(formData.data);
      const payload = {
        category: formData.category,
        key: formData.key,
        data: parsedData,
        description: formData.description || undefined,
      };

      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Saved successfully');
        setEditing(null);
        setFormData({ category: '', key: '', data: '{}', description: '' });
        await fetchEntries();
      } else {
        toast.error(json.error || 'Save failed');
      }
    } catch (err) {
      toast.error('Invalid JSON in data field');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(entry: KnowledgeEntry) {
    setEditing(entry);
    setFormData({
      category: entry.category,
      key: entry.key,
      data: JSON.stringify(entry.data, null, 2),
      description: entry.description || '',
    });
  }

  function cancelEdit() {
    setEditing(null);
    setFormData({ category: '', key: '', data: '{}', description: '' });
  }

  function renderDataPreview(data: Record<string, unknown>) {
    return (
      <pre className="max-h-48 overflow-auto rounded-md bg-gray-900 p-3 text-xs text-green-400">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Platform Knowledge Management</h1>
        <Button
          onClick={() =>
            setEditing({ id: '', category: 'platform_info', key: '', data: {}, description: '' })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Entry
        </Button>
      </div>

      {editing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editing.id ? 'Edit Entry' : 'New Entry'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="e.g., platform_name, founder_name"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this entry"
                />
              </div>
              <div>
                <Label htmlFor="data">Data (JSON)</Label>
                <Textarea
                  id="data"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  placeholder='{"key": "value"}'
                  rows={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Knowledge Entries ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-muted-foreground">No entries yet. Add your first one.</p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card key={`${entry.category}/${entry.key}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-primary text-sm font-medium">
                            {CATEGORIES.find((c) => c.value === entry.category)?.label ||
                              entry.category}
                          </span>
                          <code className="bg-secondary rounded px-2 py-1 text-sm">
                            {entry.key}
                          </code>
                        </div>
                        {entry.description && (
                          <p className="text-muted-foreground text-sm">{entry.description}</p>
                        )}
                        {renderDataPreview(entry.data)}
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Button size="icon" variant="outline" onClick={() => startEdit(entry)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={async () => {
                            if (!confirm('Delete this entry?')) return;
                            const res = await fetch(
                              `/api/admin/knowledge?category=${entry.category}&key=${entry.key}`,
                              {
                                method: 'DELETE',
                              }
                            );
                            if (res.ok) {
                              toast.success('Deleted');
                              await fetchEntries();
                            } else {
                              toast.error('Delete failed');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
