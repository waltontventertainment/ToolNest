import React, { useState, useEffect, useRef } from 'react';
import { ToolPanel, CopyButton } from '../lib/toolkit';
import { create, all } from 'mathjs';

const math = create(all, {});

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  error?: boolean;
}

export const AdvancedCalculator: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ans, setAns] = useState<string>('0');
  
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [calcMode, setCalcMode] = useState<'COMP' | 'CMPLX' | 'STAT' | 'BASE-N' | 'MATRIX' | 'VECTOR'>('COMP');
  const [isModeMenu, setIsModeMenu] = useState(false);
  
  const [cursorPos, setCursorPos] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const evalMath = (expr: string, currentAngleMode: string, currentAns: string) => {
    const scope = {
      Ans: parseFloat(currentAns) || 0,
      sin: (x: any) => currentAngleMode === 'DEG' && typeof x === 'number' ? math.sin(math.unit(x, 'deg')) : math.sin(x),
      cos: (x: any) => currentAngleMode === 'DEG' && typeof x === 'number' ? math.cos(math.unit(x, 'deg')) : math.cos(x),
      tan: (x: any) => currentAngleMode === 'DEG' && typeof x === 'number' ? math.tan(math.unit(x, 'deg')) : math.tan(x),
      asin: (x: any) => currentAngleMode === 'DEG' && typeof x === 'number' ? (math.asin(x) as any) * 180 / Math.PI : math.asin(x),
      acos: (x: any) => currentAngleMode === 'DEG' && typeof x === 'number' ? (math.acos(x) as any) * 180 / Math.PI : math.acos(x),
      atan: (x: any) => currentAngleMode === 'DEG' && typeof x === 'number' ? (math.atan(x) as any) * 180 / Math.PI : math.atan(x),
    };
    
    let toEval = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/E/g, 'e');
    return math.evaluate(toEval, scope);
  };

  useEffect(() => {
    if (!expression.trim() || isModeMenu) {
      setResult('');
      return;
    }
    
    try {
      const res = evalMath(expression, angleMode, ans);
      
      if (res !== undefined && typeof res !== 'function') {
        if (typeof res === 'number') {
          setResult(Number.isInteger(res) ? res.toString() : parseFloat(res.toPrecision(14)).toString());
        } else if (typeof res === 'object' && res !== null) {
          setResult(res.toString());
        } else {
           setResult(String(res));
        }
      } else {
        setResult('');
      }
    } catch (err) {
      setResult('');
    }
  }, [expression, ans, angleMode, calcMode, isModeMenu]);

  const handleEvaluate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!expression.trim() || isModeMenu) return;

    let finalResult = result;
    let isError = false;

    if (!finalResult) {
      try {
        const res = evalMath(expression, angleMode, ans);
        if (res !== undefined && typeof res !== 'function') {
           if (typeof res === 'number') {
             finalResult = Number.isInteger(res) ? res.toString() : parseFloat(res.toPrecision(14)).toString();
           } else {
             finalResult = String(res);
           }
        } else {
           finalResult = '';
        }
      } catch (err) {
        finalResult = err instanceof Error ? err.message : 'Error';
        isError = true;
      }
    }

    if (finalResult) {
      const newItem = {
        id: Date.now().toString(),
        expression,
        result: finalResult,
        error: isError
      };
      setHistory([newItem, ...history]);
      if (!isError) {
        setAns(finalResult);
        setExpression(finalResult);
        setCursorPos(finalResult.length);
      }
    }
  };

  const handleBackspace = () => {
    if (isModeMenu) {
      setIsModeMenu(false);
      return;
    }
    if (cursorPos !== null && cursorPos > 0) {
      const newExpr = expression.substring(0, cursorPos - 1) + expression.substring(cursorPos);
      setExpression(newExpr);
      setCursorPos(cursorPos - 1);
    } else if (cursorPos === null && expression.length > 0) {
      setExpression(prev => prev.slice(0, -1));
    }
  };

  const insertAtCursor = (val: string) => {
    if (cursorPos !== null) {
      const newExpr = expression.substring(0, cursorPos) + val + expression.substring(cursorPos);
      setExpression(newExpr);
      setCursorPos(cursorPos + val.length);
    } else {
      setExpression(prev => prev + val);
    }
  };

  const handleSciClick = (btn: any) => {
    if (isModeMenu) {
      setIsModeMenu(false);
      return;
    }
    if (btn.val === 'MODE') {
      setIsModeMenu(true);
      return;
    }
    if (btn.val === 'SHIFT') {
      setIsShiftActive(!isShiftActive);
      return;
    }
    if (btn.val === 'ALPHA') {
      return;
    }
    if (btn.val === 'AC' || btn.val === 'ON') {
      setExpression('');
      setResult('');
      setCursorPos(null);
      return;
    }

    const valToInsert = (isShiftActive && btn.shiftVal) ? btn.shiftVal : btn.val;
    insertAtCursor(valToInsert);
    if (isShiftActive) setIsShiftActive(false);
  };

  const handleBasicClick = (btn: string) => {
    if (isModeMenu) {
      if (btn === '1') setCalcMode('COMP');
      if (btn === '2') setCalcMode('CMPLX');
      if (btn === '3') setCalcMode('STAT');
      if (btn === '4') setCalcMode('BASE-N');
      if (btn === '5') setCalcMode('MATRIX');
      if (btn === '6') setCalcMode('VECTOR');
      if (btn === '7') setAngleMode('DEG');
      if (btn === '8') setAngleMode('RAD');
      setIsModeMenu(false);
      return;
    }

    if (btn === 'AC') {
      setExpression('');
      setResult('');
      setCursorPos(null);
    } else if (btn === 'DEL') {
      handleBackspace();
    } else if (btn === '=') {
      handleEvaluate();
    } else {
      insertAtCursor(btn === 'Exp' ? 'E' : btn);
    }
  };

  const advancedButtons = [
    { label: 'SHIFT', val: 'SHIFT', color: isShiftActive ? 'bg-yellow-600/30 text-yellow-500 ring-1 ring-yellow-500/50' : 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20' },
    { label: 'ALPHA', val: 'ALPHA', color: 'text-red-400 bg-red-400/10 hover:bg-red-400/20' },
    { label: 'MODE', val: 'MODE', color: 'text-gray-200 bg-white/10 hover:bg-white/20' },
    { label: 'ON', val: 'ON', color: 'text-orange-400 bg-orange-400/10 hover:bg-orange-400/20' },
    { label: 'nPr', val: ' permutations(', shiftLabel: 'nCr', shiftVal: ' combinations(' },
    { label: 'mod', val: ' mod ' },

    { label: 'x⁻¹', val: '^-1', shiftLabel: 'x!', shiftVal: '!' },
    { label: '√', val: 'sqrt(', shiftLabel: '∛', shiftVal: 'cbrt(' },
    { label: 'x²', val: '^2', shiftLabel: 'x³', shiftVal: '^3' },
    { label: 'x^y', val: '^', shiftLabel: 'x√', shiftVal: 'nthRoot(' },
    { label: 'log', val: 'log10(', shiftLabel: '10^x', shiftVal: '10^' },
    { label: 'ln', val: 'log(', shiftLabel: 'e^x', shiftVal: 'exp(' },

    { label: '(-)', val: '-', shiftLabel: '|x|', shiftVal: 'abs(' },
    { label: '°\'\"', val: 'deg', shiftLabel: 'rad', shiftVal: 'rad' },
    { label: 'hyp', val: 'sinh(' },
    { label: 'sin', val: 'sin(', shiftLabel: 'sin⁻¹', shiftVal: 'asin(' },
    { label: 'cos', val: 'cos(', shiftLabel: 'cos⁻¹', shiftVal: 'acos(' },
    { label: 'tan', val: 'tan(', shiftLabel: 'tan⁻¹', shiftVal: 'atan(' },
    
    { label: '(', val: '(', shiftLabel: '[', shiftVal: '[' },
    { label: ')', val: ')', shiftLabel: ']', shiftVal: ']' },
    { label: 'i', val: 'i', shiftLabel: '∠', shiftVal: ' angle(' },
    { label: 'π', val: 'pi', shiftLabel: 'e', shiftVal: 'e' },
    { label: 'det', val: 'det(' },
    { label: 'cross', val: 'cross(' },
  ];

  const basicButtons = [
    ['7', '8', '9', 'DEL', 'AC'],
    ['4', '5', '6', '×', '÷'],
    ['1', '2', '3', '+', '−'],
    ['0', '.', 'Exp', 'Ans', '=']
  ];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      <div className="lg:col-span-3">
        <div className="p-6 md:p-8 space-y-6 shadow-2xl rounded-[2.5rem] bg-[#0c0e14] border border-white/5 relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="relative bg-[#1a2130] rounded-2xl p-4 sm:p-6 min-h-[160px] flex flex-col shadow-[inset_0_4px_30px_rgba(0,0,0,0.6)] border border-white/5">
              {/* Status bar */}
              <div className="flex gap-4 text-[10px] sm:text-xs font-mono text-primary/70 mb-4 font-bold tracking-widest uppercase">
                 <span className="text-primary drop-shadow-[0_0_5px_rgba(var(--primary),0.5)]">{angleMode}</span>
                 <span className="text-primary drop-shadow-[0_0_5px_rgba(var(--primary),0.5)]">{calcMode}</span>
              </div>
              
              {/* Main Display */}
              {isModeMenu ? (
                <div className="flex-1 text-primary font-mono text-sm sm:text-base grid grid-cols-2 gap-2 sm:gap-4 animate-in fade-in duration-200">
                  <div className="p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => handleBasicClick('1')}>1:COMP</div>
                  <div className="p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => handleBasicClick('2')}>2:CMPLX</div>
                  <div className="p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => handleBasicClick('3')}>3:STAT</div>
                  <div className="p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => handleBasicClick('4')}>4:BASE-N</div>
                  <div className="p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => handleBasicClick('5')}>5:MATRIX</div>
                  <div className="p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => handleBasicClick('6')}>6:VECTOR</div>
                  <div className="p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => handleBasicClick('7')}>7:DEG</div>
                  <div className="p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => handleBasicClick('8')}>8:RAD</div>
                </div>
              ) : (
                <form onSubmit={handleEvaluate} className="flex-1 flex flex-col">
                  <input 
                     ref={inputRef}
                     type="text"
                     className="w-full bg-transparent text-white text-3xl sm:text-4xl font-mono focus:outline-none placeholder:text-white/10 tracking-wider"
                     value={expression}
                     onChange={(e) => {
                        setExpression(e.target.value);
                        setCursorPos(e.target.selectionStart);
                     }}
                     onSelect={(e) => setCursorPos((e.target as HTMLInputElement).selectionStart)}
                     placeholder="0"
                     autoComplete="off"
                  />
                  <div className="text-right text-primary/90 font-mono text-2xl sm:text-3xl mt-auto h-10 truncate pt-2 font-semibold tracking-tight">
                     {result ? `= ${result}` : ''}
                  </div>
                </form>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Advanced Pad */}
              <div>
                 <div className="grid grid-cols-6 gap-2">
                    {advancedButtons.map((btn, i) => (
                      <button
                        key={i}
                        onClick={() => handleSciClick(btn)}
                        className={`relative pt-3 sm:pt-4 pb-1 sm:pb-2 px-1 bg-[#1e2330] text-gray-300 text-[10px] sm:text-xs font-mono font-medium rounded-xl hover:bg-[#2a3142] hover:text-white transition-all active:scale-95 shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-white/5 flex flex-col items-center justify-center leading-none ${btn.color || ''}`}
                      >
                        {btn.shiftLabel && (
                          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] text-yellow-500 font-bold tracking-tighter whitespace-nowrap">{btn.shiftLabel}</span>
                        )}
                        <span className="truncate w-full text-center mt-1">{btn.label}</span>
                      </button>
                    ))}
                 </div>
              </div>

              {/* Basic Numpad */}
              <div>
                 <div className="grid grid-cols-5 gap-3 h-full">
                    {basicButtons.map((row, i) => (
                      <React.Fragment key={i}>
                        {row.map((btn) => {
                          const isAction = ['DEL', 'AC'].includes(btn);
                          const isOp = ['÷', '×', '−', '+'].includes(btn);
                          const isEqual = btn === '=';
                          return (
                            <button
                              key={btn}
                              onClick={() => handleBasicClick(btn)}
                              className={`
                                p-3 sm:p-5 text-xl sm:text-2xl font-bold font-mono rounded-2xl transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3)] border border-white/5 flex items-center justify-center
                                ${isOp ? 'bg-primary/20 text-primary hover:bg-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)]' 
                                 : isEqual ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_rgba(var(--primary),0.4)]'
                                 : isAction ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                 : 'bg-[#222838] text-white hover:bg-[#2d354a]'}
                              `}
                            >
                              {btn}
                            </button>
                          );
                        })}
                      </React.Fragment>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:h-[650px] flex flex-col p-0 overflow-hidden shadow-2xl bg-card rounded-[2.5rem] border border-border/50 ring-1 ring-black/5">
        <div className="p-6 border-b bg-muted/20 flex justify-between items-center backdrop-blur">
          <h3 className="font-semibold tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            History Log
          </h3>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors px-3 py-1 rounded-full hover:bg-destructive/10">Clear All</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 custom-scrollbar">
           {history.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
                <span className="text-sm">Your calculations will appear here</span>
             </div>
           ) : (
             history.map((item) => (
               <div 
                 key={item.id} 
                 className="bg-background border border-border/50 rounded-2xl p-5 text-sm space-y-3 shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group relative overflow-hidden" 
                 onClick={() => {
                   setExpression(item.expression);
                   setCursorPos(item.expression.length);
                 }}
               >
                 <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-colors"></div>
                 <div className="text-muted-foreground font-mono truncate group-hover:text-foreground transition-colors">{item.expression} =</div>
                 <div className={`font-bold font-mono text-xl break-all ${item.error ? 'text-destructive' : 'text-primary'}`}>
                   {item.result}
                 </div>
                 <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <CopyButton text={item.result} />
                 </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};
