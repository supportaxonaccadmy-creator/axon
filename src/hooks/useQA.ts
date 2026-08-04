import { useState, useCallback } from 'react';
import { qaService } from '@/services/testing';
import type { QAResult, TestSuite } from '@/services/testing';

export function useQA() {
  const [qaResult, setQaResult] = useState<QAResult | null>(null);
  const [smokeSuites, setSmokeSuites] = useState<TestSuite[]>([]);
  const [regressionSuites, setRegressionSuites] = useState<TestSuite[]>([]);
  const [moduleHealth, setModuleHealth] = useState<{ id: string; name: string; status: string; testCount: number; lastRun: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const runFullQA = useCallback(() => { setLoading(true); const result = qaService.getQAResult(); setQaResult(result); setLoading(false); return result; }, []);
  const runSmokeTests = useCallback(() => { setLoading(true); const results = qaService.runSmokeTests(); setSmokeSuites(results); setLoading(false); return results; }, []);
  const runRegressionTests = useCallback(() => { setLoading(true); const results = qaService.runRegressionTests(); setRegressionSuites(results); setLoading(false); return results; }, []);
  const refreshModuleHealth = useCallback(() => { setModuleHealth(qaService.getModuleHealth()); }, []);

  return { qaResult, smokeSuites, regressionSuites, moduleHealth, loading, runFullQA, runSmokeTests, runRegressionTests, refreshModuleHealth };
}
