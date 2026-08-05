import { useState, useCallback } from 'react';
import { walletService } from '@/services/finance';
import type { WalletAccount, WalletTransaction } from '@/services/finance';

export function useWallet(profileId: string | null) {
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => { if (!profileId) return; setLoading(true); const [w, txs] = await Promise.all([walletService.getOrCreateWallet(profileId), walletService.getTransactions(profileId, 50)]); setWallet(w); setTransactions(txs); setLoading(false); }, [profileId]);
  const recharge = useCallback(async (amount: number, description?: string) => { if (!profileId) return false; const result = await walletService.recharge(profileId, amount, description); if (result) await refresh(); return result; }, [profileId, refresh]);
  return { wallet, transactions, loading, refresh, recharge };
}
