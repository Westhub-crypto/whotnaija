import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, X, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sidebar, Topbar } from './DashboardPage';
import { getSocket } from '../utils/socket';
import { formatDate } from '../utils/socket';
import api from '../utils/api';

const CATEGORIES = [
  { value: 'payment', label: 'Payment Issue' },
  { value: 'game-issue', label: 'Game Issue' },
  { value: 'withdrawal', label: 'Withdrawal Problem' },
  { value: 'account', label: 'Account Issue' },
  { value: 'technical', label: 'Technical Problem' },
  { value: 'other', label: 'Other' },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({ subject: '', category: 'other', message: '' });
  const [replyMessage, setReplyMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeTicket) return;

    socket.emit('joinSupportRoom', { ticketId: activeTicket.ticketId });

    socket.on('newSupportMessage', (msg) => {
      setActiveTicket(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
    });

    return () => socket.off('newSupportMessage');
  }, [activeTicket?.ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages]);

  const loadTickets = async () => {
    try {
      const { data } = await api.get('/support/tickets');
      setTickets(data.tickets || []);
    } catch {}
    setLoading(false);
  };

  const openTicket = async (ticketId) => {
    try {
      const { data } = await api.get(`/support/tickets/${ticketId}`);
      setActiveTicket(data.ticket);
    } catch {
      toast.error('Failed to load ticket');
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketForm.subject || !newTicketForm.message) {
      return toast.error('Please fill in subject and message');
    }
    setCreating(true);
    try {
      const { data } = await api.post('/support/tickets', newTicketForm);
      toast.success('Support ticket created!');
      setShowNewTicket(false);
      setNewTicketForm({ subject: '', category: 'other', message: '' });
      loadTickets();
      setActiveTicket(data.ticket);
    } catch {
      toast.error('Failed to create ticket');
    }
    setCreating(false);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !activeTicket) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('supportMessage', { ticketId: activeTicket.ticketId, message: replyMessage });
    } else {
      await api.post(`/support/tickets/${activeTicket.ticketId}/reply`, { message: replyMessage });
    }
    setReplyMessage('');
  };

  const statusBadge = (status) => {
    const map = {
      open: 'badge-gold', 'in-progress': 'badge-purple', resolved: 'badge-green', closed: 'badge-gray',
    };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Support" />

        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: activeTicket ? '320px 1fr' : '1fr', gap: 20 }}>
          {/* Ticket list */}
          <div>
            <button className="btn btn-primary btn-full" style={{ marginBottom: 16 }} onClick={() => setShowNewTicket(true)}>
              <Plus size={16} /> New Support Ticket
            </button>

            {loading ? (
              <div className="skeleton" style={{ height: 200 }} />
            ) : tickets.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                <MessageCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                <p className="text-muted text-sm">No support tickets yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tickets.map((t) => (
                  <div
                    key={t.ticketId}
                    className="card"
                    style={{ cursor: 'pointer', padding: 16, borderColor: activeTicket?.ticketId === t.ticketId ? 'var(--brand-gold)' : undefined }}
                    onClick={() => openTicket(t.ticketId)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{t.subject}</span>
                      <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {t.ticketId} • {formatDate(t.lastActivityAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat view */}
          {activeTicket && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{activeTicket.subject}</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeTicket.ticketId}</span>
                </div>
                <span className={`badge ${statusBadge(activeTicket.status)}`}>{activeTicket.status}</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
                {activeTicket.messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'admin' ? 'flex-start' : 'flex-end' }}>
                    <div style={{
                      maxWidth: '75%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      background: msg.sender === 'admin' ? 'var(--bg-card2)' : 'var(--grad-brand)',
                      color: msg.sender === 'admin' ? 'var(--text-primary)' : '#fff',
                    }}>
                      {msg.sender === 'admin' && (
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--brand-gold)' }}>
                          Support Agent
                        </div>
                      )}
                      <p style={{ fontSize: 14, color: 'inherit' }}>{msg.content}</p>
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{formatDate(msg.createdAt)}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {activeTicket.status !== 'closed' ? (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <input
                    className="input"
                    placeholder="Type your message..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  />
                  <button className="btn btn-primary btn-icon" onClick={handleSendReply}>
                    <Send size={16} />
                  </button>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 16 }}>
                  This ticket is closed
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* New Ticket Modal */}
        <AnimatePresence>
          {showNewTicket && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                <button className="modal-close" onClick={() => setShowNewTicket(false)}><X size={16} /></button>
                <h3 className="modal-title">New Support Ticket</h3>
                <p className="text-secondary text-sm mb-4">Our team typically responds within minutes</p>

                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select className="select" value={newTicketForm.category} onChange={(e) => setNewTicketForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Subject</label>
                  <input
                    className="input"
                    placeholder="Brief description of your issue"
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm(p => ({ ...p, subject: e.target.value }))}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Message</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    value={newTicketForm.message}
                    onChange={(e) => setNewTicketForm(p => ({ ...p, message: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button className="btn btn-primary btn-full" onClick={handleCreateTicket} disabled={creating}>
                  {creating ? <span className="spinner" /> : 'Submit Ticket'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
