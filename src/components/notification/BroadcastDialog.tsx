import { memo, useState, useCallback } from 'react';
import { Send, X, Users, Layers, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { NotificationPriority, BroadcastTarget } from '@/services/notification';
import type { Option } from '@/types/common';

interface BroadcastDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (input: { title: string; message: string; priority: NotificationPriority; target: BroadcastTarget }) => Promise<void>;
  sending?: boolean | undefined;
  batches?: Array<{ id: string; name: string }> | undefined;
  students?: Array<{ id: string; name: string }> | undefined;
}

type TargetType = 'all_students' | 'batch' | 'individual';

function BroadcastDialogComponent({ open, onClose, onSend, sending = false, batches = [], students = [] }: BroadcastDialogProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<NotificationPriority>('normal');
  const [targetType, setTargetType] = useState<TargetType>('all_students');
  const [batchId, setBatchId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleSend = useCallback(async () => {
    if (!title.trim() || !message.trim()) return;

    let target: BroadcastTarget;
    if (targetType === 'all_students') {
      target = { type: 'all_students' };
    } else if (targetType === 'batch') {
      if (!batchId) return;
      target = { type: 'batch', batchId };
    } else {
      if (selectedStudents.length === 0) return;
      target = { type: 'individual', recipientIds: selectedStudents };
    }

    await onSend({ title: title.trim(), message: message.trim(), priority, target });

    setTitle('');
    setMessage('');
    setSelectedStudents([]);
    setBatchId('');
    onClose();
  }, [title, message, priority, targetType, batchId, selectedStudents, onSend, onClose]);

  if (!open) return null;

  const targetOptions = [
    { value: 'all_students', label: 'All Students', icon: Users },
    { value: 'batch', label: 'Selected Batch', icon: Layers },
    { value: 'individual', label: 'Individual Students', icon: User },
  ];

  const batchSelectOptions: Option[] = batches.map((b) => ({ value: b.id, label: b.name }));
  const priorityOptions: Option[] = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="text-base font-semibold text-neutral-900">Broadcast Notification</h2>
          <button onClick={onClose} className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Send To</label>
            <div className="grid grid-cols-3 gap-2">
              {targetOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTargetType(opt.value as TargetType)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors',
                      targetType === opt.value
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {targetType === 'batch' && batches.length > 0 && (
            <Select label="Batch" options={batchSelectOptions} placeholder="Choose a batch..." value={batchId} onChange={(e) => setBatchId(e.target.value)} />
          )}

          {targetType === 'individual' && students.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Students ({selectedStudents.length} selected)
              </label>
              <div className="max-h-32 overflow-y-auto rounded-lg border border-neutral-200 p-2">
                {students.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(s.id)}
                      onChange={() => setSelectedStudents((prev) => prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id])}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title..." maxLength={200} />
          <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." rows={4} maxLength={2000} />
          <Select label="Priority" options={priorityOptions} value={priority} onChange={(e) => setPriority(e.target.value as NotificationPriority)} />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-100 px-5 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} loading={sending} disabled={!title.trim() || !message.trim()}>
            <Send className="h-4 w-4" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export const BroadcastDialog = memo(BroadcastDialogComponent);
