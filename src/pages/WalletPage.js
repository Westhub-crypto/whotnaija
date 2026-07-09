import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, Plus, X, Building2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sidebar, Topbar } from './DashboardPage';
import { useWalletStore } from '../store';
import { formatNaira, formatDate } from '../utils/socket';
import api from '../utils/api';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

export default function WalletPage() {
  const { balance, bonusBalance, hasDeposited, fetchBalance, fetchTransactions, transactions } = useWalletStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      const { data } = await api.get('/wallet/balance');
      setBankDetails(data.bankDetails);
    } catch {}
  };

  const loadBanks = async () => {
    try {
      const { data } = await api.get('/payment/banks');
      setBanks(data.banks || []);
    } catch {
      toast.error('Failed to load bank list');
    }
  };

  const handleOpenWithdraw = () => {
    if (!hasDeposited) {
      toast.error('You must make a deposit before you can withdraw');
      return;
    }
    setShowWithdrawModal(true);
    loadBanks();
  };

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 1000) {
      toast.error('Minimum deposit is ₦1,000');
      return;
    }
    setDepositLoading(true);
    try {
      const { data } = await api.post('/payment/initiate-deposit', { amount });
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        toast.success('Payment initiated. Complete it in the new window.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate deposit');
    }
    setDepositLoading(false);
  };

  const handleVerifyAccount = async () => {
    if (!bankCode || accountNumber.length !== 10) {
      toast.error('Select a bank and enter a valid 10-digit account number');
      return;
    }
    setVerifyingAccount(true);
    try {
      const { data } = await api.post('/payment/verify-account', { accountNumber, bankCode });
      setAccountName(data.accountName);
      toast.success('Account verified!');
    } catch {
      toast.error('Could not verify account. Check details.');
    }
    setVerifyingAccount(false);
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 1000) {
      toast.error('Minimum withdrawal is ₦1,000');
      return;
    }
    if (amount > balance) {
      toast.error('Insufficient wallet balance');
      return;
    }
    if (!accountName) {
      toast.error('Please verify your bank account first');
      return;
    }
    setWithdrawLoading(true);
    try {
      await api.post('/payment/withdraw', { amount, bankCode, accountNumber, accountName });
      toast.success('Withdrawal request submitted!');
      setShowWithdrawModal(false);
      fetchBalance();
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    }
    setWithdrawLoading(false);
  };

  const handleSaveBankDetails = async () => {
    if (!accountName || !accountNumber || !bankCode) {
      toast.error('Please verify your account details first');
      return;
    }
    try {
      const bank = banks.find(b => b.bank_code === bankCode);
      await api.post('/users/bank-details', {
        accountName, accountNumber, bankCode, bankName: bank?.bank_name || '',
      });
      toast.success('Bank details saved!');
      setShowBankModal(false);
      loadBankDetails();
    } catch {
      toast.error('Failed to save bank details');
    }
  };

  const txTypeLabel = {
    deposit: { label: 'Deposit', icon: <ArrowDownCircle size={16} />, color: 'var(--brand-green)' },
    withdrawal: { label: 'Withdrawal', icon: <ArrowUpCircle size={16} />, color: 'var(--brand-red)' },
    'game-win': { label: 'Game Win', icon: '🏆', color: 'var(--brand-gold)' },
    'game-stake': { label: 'Game Stake', icon: '🎮', color: 'var(--text-muted)' },
    'welcome-bonus': { label: 'Welcome Bonus', icon: '🎁', color: 'var(--brand-pink)' },
    'referral-bonus': { label: 'Referral Bonus', icon: '👥', color: 'var(--brand-purple)' },
    refund: { label: 'Refund', icon: '↩️', color: 'var(--brand-green)' },
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Wallet" />

        <div style={{ padding: 24 }}>
          {/* Balance card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="balance-card" style={{ marginBottom: 24 }}>
            <p style={{ opacity: 0.9, fontSize: 14, marginBottom: 4 }}>Wallet Balance</p>
            <div className="balance-amount">{formatNaira(balance)}</div>
            {bonusBalance > 0 && (
              <p style={{ fontSize: 13, marginTop: 8, opacity: 0.85 }}>
                🎁 + {formatNaira(bonusBalance)} bonus {hasDeposited ? 'available' : '(unlocks after deposit)'}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn" style={{ background: '#fff', color: '#0C0C1E', fontWeight: 700 }} onClick={() => setShowDepositModal(true)}>
                <Plus size={16} /> Deposit
              </button>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }} onClick={handleOpenWithdraw}>
                <ArrowUpCircle size={16} /> Withdraw
              </button>
            </div>
          </motion.div>

          {/* Bank details card */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} /> Bank Details
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowBankModal(true); loadBanks(); }}>
                {bankDetails?.accountNumber ? 'Update' : 'Add Bank'}
              </button>
            </div>
            {bankDetails?.accountNumber ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={18} style={{ color: 'var(--brand-green)' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{bankDetails.accountName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{bankDetails.bankName} — {bankDetails.accountNumber}</div>
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm">No bank account added yet. Add one to enable withdrawals.</p>
            )}
          </div>

          {/* Transactions */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Transaction History</h3>
            {transactions.length === 0 ? (
              <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '24px 0' }}>No transactions yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {transactions.map((tx, i) => {
                  const meta = txTypeLabel[tx.type] || { label: tx.type, icon: '💵', color: 'var(--text-muted)' };
                  const isCredit = ['deposit', 'game-win', 'welcome-bonus', 'referral-bonus', 'refund'].includes(tx.type);
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-card2)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{typeof meta.icon === 'string' ? meta.icon : meta.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{meta.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(tx.createdAt)}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: isCredit ? 'var(--brand-green)' : 'var(--brand-red)' }}>
                          {isCredit ? '+' : '-'}{formatNaira(tx.amount)}
                        </div>
                        <span className={`badge ${tx.status === 'completed' ? 'badge-green' : tx.status === 'pending' || tx.status === 'processing' ? 'badge-gold' : 'badge-red'}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <button className="modal-close" onClick={() => setShowDepositModal(false)}><X size={16} /></button>
              <h3 className="modal-title">Deposit Funds</h3>
              <p className="text-secondary text-sm mb-4">Minimum deposit: ₦1,000</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                {QUICK_AMOUNTS.map(amt => (
                  <button key={amt} className="btn btn-secondary btn-sm" onClick={() => setDepositAmount(String(amt))}>
                    {formatNaira(amt)}
                  </button>
                ))}
              </div>

              <div className="input-group">
                <label className="input-label">Amount (₦)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Enter amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <button className="btn btn-primary btn-full" onClick={handleDeposit} disabled={depositLoading}>
                {depositLoading ? <span className="spinner" /> : 'Proceed to Payment'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <button className="modal-close" onClick={() => setShowWithdrawModal(false)}><X size={16} /></button>
              <h3 className="modal-title">Withdraw Funds</h3>
              <p className="text-secondary text-sm mb-4">Minimum withdrawal: ₦1,000 • Available: {formatNaira(balance)}</p>

              <div className="input-group">
                <label className="input-label">Select Bank</label>
                <select className="select" value={bankCode} onChange={(e) => { setBankCode(e.target.value); setAccountName(''); }}>
                  <option value="">Choose bank</option>
                  {banks.map(b => <option key={b.bank_code} value={b.bank_code}>{b.bank_name}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Account Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="0123456789"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '')); setAccountName(''); }}
                />
              </div>

              {accountName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--brand-green)' }}>
                  <CheckCircle2 size={16} /> {accountName}
                </div>
              ) : (
                <button className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }} onClick={handleVerifyAccount} disabled={verifyingAccount}>
                  {verifyingAccount ? <span className="spinner" /> : 'Verify Account'}
                </button>
              )}

              <div className="input-group">
                <label className="input-label">Amount (₦)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <button className="btn btn-primary btn-full" onClick={handleWithdraw} disabled={withdrawLoading}>
                {withdrawLoading ? <span className="spinner" /> : 'Withdraw Now'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank Details Modal */}
      <AnimatePresence>
        {showBankModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <button className="modal-close" onClick={() => setShowBankModal(false)}><X size={16} /></button>
              <h3 className="modal-title">Add Bank Account</h3>
              <p className="text-secondary text-sm mb-4">This account will be used for withdrawals</p>

              <div className="input-group">
                <label className="input-label">Select Bank</label>
                <select className="select" value={bankCode} onChange={(e) => { setBankCode(e.target.value); setAccountName(''); }}>
                  <option value="">Choose bank</option>
                  {banks.map(b => <option key={b.bank_code} value={b.bank_code}>{b.bank_name}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Account Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="0123456789"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '')); setAccountName(''); }}
                />
              </div>

              {accountName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--brand-green)' }}>
                  <CheckCircle2 size={16} /> {accountName}
                </div>
              ) : (
                <button className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }} onClick={handleVerifyAccount} disabled={verifyingAccount}>
                  {verifyingAccount ? <span className="spinner" /> : 'Verify Account'}
                </button>
              )}

              <button className="btn btn-primary btn-full" onClick={handleSaveBankDetails}>
                Save Bank Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
