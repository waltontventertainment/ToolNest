import React, { useState, useMemo } from 'react';
import { ToolPanel } from '../lib/toolkit';
import { evaluate } from 'mathjs';

export const SimpleCalculator: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [historyExp, setHistoryExp] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);

  const liveResult = useMemo(() => {
    if (!expression || justEvaluated) return '';
    try {
      let toEval = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      const lastChar = toEval.slice(-1);
      if (['+', '-', '*', '/'].includes(lastChar)) {
         toEval = toEval.slice(0, -1);
      }
      if (!toEval) return '';
      
      const res = evaluate(toEval);
      if (typeof res === 'number') {
        return String(parseFloat(res.toPrecision(12)));
      }
      return String(res);
    } catch {
      return '';
    }
  }, [expression, justEvaluated]);

  const handlePress = (val: string) => {
    if (val === 'DEL') {
      if (justEvaluated) {
        setExpression('');
        setHistoryExp('');
        setJustEvaluated(false);
      } else {
        setExpression(prev => prev.slice(0, -1));
      }
      return;
    }
    
    if (val === 'C' || val === 'AC') {
      setExpression('');
      setHistoryExp('');
      setJustEvaluated(false);
      return;
    }
    
    const isOp = (c: string) => ['+', '−', '×', '÷'].includes(c);
    
    if (val === '=') {
      if (!expression || justEvaluated) return;
      
      const res = liveResult;
      if (res) {
        setHistoryExp(expression + ' =');
        setExpression(res);
        setJustEvaluated(true);
      }
      return;
    }

    if (val === '±') {
      if (expression) {
        if (justEvaluated || !isNaN(Number(expression))) {
          setExpression(String(-Number(expression)));
        } else {
          setExpression(`-(${expression})`);
        }
      }
      return;
    }

    if (val === '%') {
      if (expression) {
        try {
          const toEval = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
          const res = evaluate(`(${toEval})/100`);
          const finalRes = typeof res === 'number' ? String(parseFloat(res.toPrecision(12))) : String(res);
          setHistoryExp(expression + '% =');
          setExpression(finalRes);
          setJustEvaluated(true);
        } catch {}
      }
      return;
    }

    if (justEvaluated) {
      if (isOp(val)) {
        setExpression(prev => prev + val);
        setHistoryExp('');
        setJustEvaluated(false);
      } else {
        setExpression(val);
        setHistoryExp('');
        setJustEvaluated(false);
      }
      return;
    }

    const lastChar = expression.slice(-1);
    
    if (isOp(val) && isOp(lastChar)) {
        setExpression(prev => prev.slice(0, -1) + val);
    } else {
        setExpression(prev => prev + val);
    }
  };

  const Button = ({ children, onClick, className = '' }: { children: React.ReactNode, onClick: () => void, className?: string }) => (
    <button
      onClick={onClick}
      className={`text-2xl sm:text-3xl font-medium rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-transform active:scale-95 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-xs sm:max-w-sm mx-auto">
      <div className="bg-zinc-900 p-4 sm:p-6 rounded-3xl shadow-2xl">
        <div className="text-right text-white text-4xl sm:text-5xl font-light tabular-nums tracking-tight h-24 flex flex-col justify-end pb-4 overflow-hidden break-all">
          <div className="text-zinc-500 text-lg mb-1 min-h-[28px]">{historyExp || liveResult}</div>
          <div>{expression || '0'}</div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          <Button onClick={() => handlePress(expression === '' ? 'AC' : 'C')} className="bg-zinc-300 text-black hover:bg-zinc-200">{expression === '' ? 'AC' : 'C'}</Button>
          <Button onClick={() => handlePress('DEL')} className="bg-zinc-300 text-black hover:bg-zinc-200">⌫</Button>
          <Button onClick={() => handlePress('%')} className="bg-zinc-300 text-black hover:bg-zinc-200">%</Button>
          <Button onClick={() => handlePress('÷')} className="bg-orange-500 text-white hover:bg-orange-400">÷</Button>
          
          <Button onClick={() => handlePress('7')} className="bg-zinc-800 text-white hover:bg-zinc-700">7</Button>
          <Button onClick={() => handlePress('8')} className="bg-zinc-800 text-white hover:bg-zinc-700">8</Button>
          <Button onClick={() => handlePress('9')} className="bg-zinc-800 text-white hover:bg-zinc-700">9</Button>
          <Button onClick={() => handlePress('×')} className="bg-orange-500 text-white hover:bg-orange-400">×</Button>
          
          <Button onClick={() => handlePress('4')} className="bg-zinc-800 text-white hover:bg-zinc-700">4</Button>
          <Button onClick={() => handlePress('5')} className="bg-zinc-800 text-white hover:bg-zinc-700">5</Button>
          <Button onClick={() => handlePress('6')} className="bg-zinc-800 text-white hover:bg-zinc-700">6</Button>
          <Button onClick={() => handlePress('−')} className="bg-orange-500 text-white hover:bg-orange-400">−</Button>
          
          <Button onClick={() => handlePress('1')} className="bg-zinc-800 text-white hover:bg-zinc-700">1</Button>
          <Button onClick={() => handlePress('2')} className="bg-zinc-800 text-white hover:bg-zinc-700">2</Button>
          <Button onClick={() => handlePress('3')} className="bg-zinc-800 text-white hover:bg-zinc-700">3</Button>
          <Button onClick={() => handlePress('+')} className="bg-orange-500 text-white hover:bg-orange-400">+</Button>
          
          <Button onClick={() => handlePress('0')} className="bg-zinc-800 text-white hover:bg-zinc-700 col-span-2 !w-auto justify-start pl-7 sm:pl-8">0</Button>
          <Button onClick={() => handlePress('.')} className="bg-zinc-800 text-white hover:bg-zinc-700">.</Button>
          <Button onClick={() => handlePress('=')} className="bg-orange-500 text-white hover:bg-orange-400">=</Button>
        </div>
      </div>
    </div>
  );
};
