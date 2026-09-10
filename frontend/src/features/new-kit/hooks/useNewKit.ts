'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries';
import { GenerationProgress } from '@/lib/types';
import { NewKitService } from '../services/new-kit.service';

export function useNewKit() {
  const router = useRouter();
  const queryClient = useQueryClient();



  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');


  const [jd, setJd] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [days, setDays] = useState(5);


  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);


  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim() || !companyUrl.trim()) return;

    setIsGenerating(true);
    setError(null);
    setProgress({
      phase: 'fetching_company',
      step: 1,
      totalSteps: 6,
      message: `Connecting to ${companyUrl} and discovering careers/hiring information...`
    });

    try {
      const completedKit = await NewKitService.generatePrepKit(
        { jd, companyUrl, days },
        (p) => setProgress(p)
      );

      // Seed cache immediately so the kit page loads without redundant network roundtrip
      if (completedKit?.id) {
        queryClient.setQueryData(queryKeys.kit(completedKit.id), completedKit);
        queryClient.invalidateQueries({ queryKey: queryKeys.kits });
        router.push(`/kit/${completedKit.id}`);
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.kits });
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Generation Error:', err);
      setError({
        message: err.message || 'Generation failed to complete. Please check the backend server and URL.',
        code: err.code || 'GENERATION_ERROR'
      });
      setIsGenerating(false);
    }
  };

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBatchFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const validation = NewKitService.validateBatchJson(text);
        if (validation.isValid) {
          setBatchStatus(`Valid batch file loaded with ${validation.count} case(s). Run 'npm run evaluate -- --input <cases.json> --output <kits.json>' via CLI to execute.`);
        } else {
          setBatchStatus(validation.error || 'Invalid batch file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const isStubJd = NewKitService.isStubJd(jd);

  return {
    activeTab,
    setActiveTab,
    jd,
    setJd,
    companyUrl,
    setCompanyUrl,
    days,
    setDays,
    batchFile,
    batchStatus,
    handleBatchUpload,
    isGenerating,
    progress,
    error,
    setError,
    handleGenerate,
    isStubJd
  };
}
