import { memo, useEffect } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import type { WalletTransaction } from '@/services/finance';

interface WalletCardProps { profileId: string | null; }

function WalletCardComponent({ profileId }: WalletCardProps) {
  const { wallet, transactions, loading, refresh } = useWallet(profileId);
  useEffect(() => { void refresh(); }, [refresh]);
  if (!profileId) return <div className="p-4 text-sm text-neutral-400">Sign in to view wallet.</div>;
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Wallet className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">My Wallet</h3></div><div className="mb-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 p-4 text-white"><p className="text-xs opacity-80">Available Balance</p><p className="mt-1 text-3xl font-bold">₹{wallet?.balance.toLocaleString() ?? 0}</p></div><div className="space-y-1.5">{transactions.slice(0, 10).map((tx: WalletTransaction) => (<div key={tx.id} className="flex items-center gap-2 rounded-lg border border-neutral-100 p-2 text-xs">{tx.type === 'credit' ? <ArrowDownCircle className="h-4 w-4 text-success-500" /> : <ArrowUpCircle className="h-4 w-4 text-error-500" />}<div className="flex-1"><p className="text-neutral-600">{tx.description}</p><p className="text-neutral-400">{new Date(tx.createdAt).toLocaleString()}</p></div><div className="text-right"><p className={tx.type === 'credit' ? 'font-bold text-success-600' : 'font-bold text-error-600'}>{tx.type === 'credit' ? '+' : '-'}₹{tx.amount}</p><p className="text-neutral-400">Bal: ₹{tx.balanceAfter}</p></div></div>))}{transactions.length === 0 && !loading && <p className="text-sm text-neutral-400">No transactions yet.</p>}</div></div>);
}
export const WalletCard = memo(WalletCardComponent);
