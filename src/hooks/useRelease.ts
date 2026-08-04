import { useState, useCallback } from 'react';
import { releaseService } from '@/services/devops';
import type { ReleaseInfo, ChangelogEntry } from '@/services/devops';

export function useRelease() {
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo>(releaseService.getReleaseInfo());
  const refresh = useCallback(() => { setReleaseInfo(releaseService.getReleaseInfo()); }, []);
  const generateNotes = useCallback((version: string) => { return releaseService.generateReleaseNotes(version); }, []);
  const checklist = releaseService.getReleaseChecklist();
  const changelog: ChangelogEntry[] = releaseService.getChangelog();
  const currentVersion = releaseService.getCurrentVersion();
  const buildNumber = releaseService.getBuildNumber();
  const gitHash = releaseService.getGitHash();
  return { releaseInfo, checklist, changelog, currentVersion, buildNumber, gitHash, generateNotes, refresh };
}
