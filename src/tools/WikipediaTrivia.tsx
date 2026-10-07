import React, { useState } from 'react';
import { 
  Shuffle, 
  HelpCircle, 
  ExternalLink, 
  Award,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { WikipediaReaderModal } from '../components/WikipediaReaderModal';

interface WikiSummary {
  title: string;
  displaytitle: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls?: {
    desktop?: {
      page: string;
    };
  };
  description?: string;
}

export const WikipediaTrivia: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [randomArticle, setRandomArticle] = useState<WikiSummary | null>(null);
  const [triviaLoading, setTriviaLoading] = useState(false);
  const [triviaQuestions, setTriviaQuestions] = useState<string>('');
  const [showAnswers, setShowAnswers] = useState(false);
  const [readerArticle, setReaderArticle] = useState<string | null>(null);

  const fetchRandomTrivia = async () => {
    setTriviaLoading(true);
    setRandomArticle(null);
    setTriviaQuestions('');
    setShowAnswers(false);
    try {
      const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`);
      if (res.ok) {
        const data = await res.json();
        setRandomArticle(data);
        
        // Generate AI Trivia Questions via our robust server-side endpoint
        const prompt = `Read the following topic details for "${data.title}":
"${data.extract}"

Generate 3 extremely fun, educational, multiple-choice trivia questions based strictly on this topic.
Format each question clearly in Markdown:
**Question 1**: [Question Text]
- A) Option 1
- B) Option 2
- C) Option 3
- D) Option 4

*Answer*: [Correct Option with short explanation]

Output language: ${lang === 'bn' ? 'Bengali' : 'English'}. Include the correct answers labeled clearly at the bottom of each question.`;

        const response = await fetch('/api/ai/completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt,
            systemPrompt: 'You are a professional quiz master. Create high-quality, engaging multiple choice questions with answers.',
            temperature: 0.7,
            maxTokens: 1000
          })
        });

        const aiResult = await response.json();

        if (aiResult.success && aiResult.text) {
          setTriviaQuestions(aiResult.text);
          toast.success('AI Trivia generated successfully!');
        } else {
          throw new Error(aiResult.error || 'Server returned an error');
        }
      } else {
        throw new Error('Failed to fetch random article');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not generate trivia. Please try again.');
    } finally {
      setTriviaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-ambient p-5 sm:p-6 rounded-3xl border border-border/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Shuffle className="w-3.5 h-3.5" />
              <span>Wikipedia Category Tool</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-foreground tracking-tight leading-tight">
              Wikipedia Random AI Trivia
            </h2>
            <p className="text-xs text-muted-foreground">
              Spawns a random interesting topic from Wikipedia and uses server-side AI to construct a multiple choice quiz card.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-xl border border-border/50 shrink-0">
            <button
              onClick={() => { setLang('en'); toast.success('Language switched to English'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'en' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
            <button
              onClick={() => { setLang('bn'); toast.success('ভাষা পরিবর্তন করা হয়েছে (বাংলা)'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'bn' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/80 p-5 sm:p-6 rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-blue-500" />
              <span>{lang === 'bn' ? 'এআই র্যান্ডম কুইজ ও ফ্ল্যাশকার্ড' : 'Wikipedia Random AI Trivia'}</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {lang === 'bn' ? 'উইকিপিডিয়ার যেকোনো র্যান্ডম চমৎকার বিষয়ের উপর ৩টি কুইজ এবং সঠিক উত্তর জেনারেট করুন।' : 'Generate interesting quizzes based on a randomly selected topic.'}
            </p>
          </div>

          <button
            onClick={fetchRandomTrivia}
            disabled={triviaLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>{triviaLoading ? 'Generating Trivia...' : (lang === 'bn' ? 'কুইজ জেনারেট করুন' : 'Generate Random Quiz')}</span>
          </button>
        </div>

        {triviaLoading && (
          <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Spawning random encyclopedic topic and prompting server-side AI model...</span>
          </div>
        )}

        {!triviaLoading && !randomArticle && (
          <div className="text-center py-12 text-muted-foreground">
            <HelpCircle className="w-12 h-12 text-muted-foreground/45 mx-auto mb-3 animate-bounce" />
            <h4 className="text-sm font-bold text-foreground">
              {lang === 'bn' ? 'কোনো কুইজ তৈরি করা নেই' : 'No Quiz Generated'}
            </h4>
            <p className="text-xs mt-1">
              {lang === 'bn' ? 'উপরের বাটনে ক্লিক করে র্যান্ডম কুইজ তৈরি করুন।' : 'Click the "Generate Random Quiz" button above to pull a random topic and create questions.'}
            </p>
          </div>
        )}

        {!triviaLoading && randomArticle && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in-0 duration-200">
            <div className="lg:col-span-4 p-4 rounded-xl bg-secondary/30 border border-border/80 space-y-4 shadow-2xs text-center sm:text-left">
              {randomArticle.thumbnail && (
                <div className="aspect-square w-24 h-24 sm:w-full sm:h-auto sm:max-h-48 rounded-xl overflow-hidden border border-border mx-auto bg-muted">
                  <img 
                    src={randomArticle.thumbnail.source} 
                    alt={randomArticle.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Random Topic Card
                </span>
                <h4 className="text-base font-black text-foreground pt-1 truncate">
                  {randomArticle.title}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                  {randomArticle.extract}
                </p>
              </div>

              <button
                onClick={() => setReaderArticle(randomArticle.title)}
                className="w-full h-10 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-500/25 transition-all"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Read Full Story</span>
              </button>
            </div>

            <div className="lg:col-span-8 bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-2xs relative">
              <div className="flex items-center justify-between border-b border-border/70 pb-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{lang === 'bn' ? 'এআই টিভিয়া কুইজ' : 'AI-Generated Quiz Sheet'}</span>
                </h4>
                <button
                  onClick={() => setShowAnswers(!showAnswers)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-extrabold cursor-pointer border border-amber-500/25 transition-all"
                >
                  {showAnswers ? (lang === 'bn' ? 'উত্তর লুকান' : 'Hide Answers') : (lang === 'bn' ? 'উত্তর দেখুন' : 'Show Answers')}
                </button>
              </div>

              <div className="text-xs font-medium text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {showAnswers ? triviaQuestions : triviaQuestions.replace(/\*Answer\*:?.*?\n/gi, '').replace(/Answer:.*?\n/gi, '').replace(/\*Correct Option\*.*?\n/gi, '')}
              </div>

              <div className="flex items-center justify-between border-t border-border/70 pt-4 text-[10px] text-muted-foreground italic">
                <span>Creative Commons Attribution-ShareAlike 3.0</span>
                <span>Source: Wikipedia (CC BY-SA 3.0)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <WikipediaReaderModal
        title={readerArticle}
        isOpen={readerArticle !== null}
        lang={lang}
        onClose={() => setReaderArticle(null)}
      />
    </div>
  );
};
