import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileUploader } from '@/components/admin/storage/FileUploader';
import { useNavigate } from 'react-router-dom';
import { STORAGE_BUCKETS, type StorageBucket, type EntityType } from '@/services/storage';

const BUCKET_OPTIONS: { value: StorageBucket; label: string; description: string }[] = [
  { value: STORAGE_BUCKETS.COURSE_ASSETS, label: 'Course Assets', description: 'Batch thumbnails, subject images, class thumbnails, banners' },
  { value: STORAGE_BUCKETS.PDF_NOTES, label: 'PDF Notes', description: 'Chapter PDFs, study materials, documents' },
  { value: STORAGE_BUCKETS.VIDEOS, label: 'Videos', description: 'Recorded classes, video lessons' },
  { value: STORAGE_BUCKETS.PROFILE_MEDIA, label: 'Profile Media', description: 'User profile images' },
];

const ENTITY_OPTIONS: { value: EntityType; label: string }[] = [
  { value: 'batch', label: 'Batch' },
  { value: 'subject', label: 'Subject' },
  { value: 'chapter', label: 'Chapter' },
  { value: 'class', label: 'Class' },
  { value: 'pdf', label: 'PDF' },
  { value: 'profile', label: 'Profile' },
  { value: 'general', label: 'General' },
];

export function StorageUploadPage() {
  const navigate = useNavigate();
  const [bucket, setBucket] = useState<StorageBucket>(STORAGE_BUCKETS.COURSE_ASSETS);
  const [entityType, setEntityType] = useState<EntityType>('general');
  const [entityId, setEntityId] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/storage')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Upload Files</h1>
          <p className="mt-1 text-sm text-neutral-500">Upload files to Supabase Storage with validation and compression</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Storage Bucket</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {BUCKET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBucket(opt.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    bucket === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-300 bg-white hover:border-neutral-400'
                  }`}
                >
                  <p className="text-sm font-medium text-neutral-900">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Entity Type</label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as EntityType)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                {ENTITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Entity ID (optional)</label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="UUID of the linked entity"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">Make file publicly accessible (without signed URL)</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            bucket={bucket}
            entityType={entityType}
            entityId={entityId || undefined}
            isPublic={isPublic}
            multiple
          />
        </CardContent>
      </Card>
    </div>
  );
}
