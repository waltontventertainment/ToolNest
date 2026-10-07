import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  MessageSquare, 
  Lightbulb, 
  Send, 
  X, 
  Check, 
  Mail, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentToolName?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentToolName,
}) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'general'>('bug');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentToolName) {
        setSubject(`[${feedbackType.toUpperCase()}] Issue with ${currentToolName}`);
      } else {
        setSubject(`[${feedbackType.toUpperCase()}] Toolzaro User Feedback`);
      }
      setSubmitted(false);
    }
  }, [isOpen, currentToolName, feedbackType]);

  if (!isOpen) return null;

  const targetEmail = 'sabbirhasansh321@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter your feedback or bug description.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Try sending via free FormSubmit.co endpoint
      const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: subject || `Toolzaro Feedback - ${feedbackType}`,
          type: feedbackType,
          email: email || 'Anonymous User',
          tool: currentToolName || 'General Site',
          message: message,
          page_url: window.location.href,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('Thank you! Your feedback has been sent directly to our team.');
      } else {
        throw new Error('FormSubmit endpoint error');
      }
    } catch (err) {
      // 2. Fallback: Trigger Mailto directly if endpoint fails or network error occurs
      const mailtoSubject = encodeURIComponent(subject || `Toolzaro Feedback - ${feedbackType}`);
      const mailtoBody = encodeURIComponent(
        `Type: ${feedbackType.toUpperCase()}\nTool: ${currentToolName || 'General'}\nUser Email: ${email || 'Not provided'}\nURL: ${window.location.href}\n\nMessage:\n${message}`
      );
      window.location.href = `mailto:${targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
      setSubmitted(true);
      toast.info('Opened your email app to send feedback directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(targetEmail);
    toast.success(`Copied ${targetEmail} to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-150">
      <div className="w-full max-w-lg bg-card border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <Bug className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                Feedback & Bug Report
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Help us improve Toolzaro — report an issue or request a feature
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/20">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h4 className="text-base font-bold text-foreground">Feedback Received!</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Thank you for helping make Toolzaro better for everyone. Our editorial and development team reviews every report.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                  onClose();
                }}
                className="mt-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  What kind of feedback is this?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bug' as const, label: 'Report Bug', icon: Bug, color: 'text-rose-500' },
                    { id: 'suggestion' as const, label: 'Suggestion', icon: Lightbulb, color: 'text-amber-500' },
                    { id: 'general' as const, label: 'General', icon: MessageSquare, color: 'text-blue-500' },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = feedbackType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFeedbackType(t.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-foreground ring-2 ring-primary/20'
                            : 'bg-secondary/40 border-border/70 text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${t.color}`} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">
                  Your Email <span className="text-[10px] font-normal text-muted-foreground">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-10 px-3 bg-secondary/50 focus:bg-background border border-border/80 focus:border-primary rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Message Details */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <label>
                    {feedbackType === 'bug'
                      ? 'Describe the issue or error:'
                      : feedbackType === 'suggestion'
                      ? 'Describe your feature idea:'
                      : 'Your Message:'}
                  </label>
                  {currentToolName && (
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 truncate max-w-[160px]">
                      {currentToolName}
                    </span>
                  )}
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder={
                    feedbackType === 'bug'
                      ? 'What happened? E.g. PDF converter failed on page 3 or button gave error...'
                      : 'What new feature or tool would you like us to add to Toolzaro?'
                  }
                  className="w-full p-3 bg-secondary/50 focus:bg-background border border-border/80 focus:border-primary rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              {/* Alternative Quick Contact */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{targetEmail}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 rounded-lg bg-card border border-border/80 hover:bg-secondary text-[11px] font-bold text-foreground transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Copy className="w-3 h-3" /> Copy Email
                </button>
              </div>

              {/* Submit Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${submitting ? 'animate-bounce' : ''}`} />
                  <span>{submitting ? 'Sending...' : 'Send Web Form'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const mailtoSubject = encodeURIComponent(subject || `Toolzaro Feedback - ${feedbackType}`);
                    const mailtoBody = encodeURIComponent(
                      `Type: ${feedbackType.toUpperCase()}\nTool: ${currentToolName || 'General'}\nUser Email: ${email || 'Not provided'}\nURL: ${window.location.href}\n\nMessage:\n${message}`
                    );
                    window.location.href = `mailto:${targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
                    toast.info('Opened Gmail / Email App');
                  }}
                  disabled={!message.trim()}
                  className="w-full py-3 bg-secondary text-foreground font-bold text-xs rounded-xl border border-border/80 hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Send via Gmail App</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/70 bg-muted/30 flex items-center justify-end text-xs text-muted-foreground">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
