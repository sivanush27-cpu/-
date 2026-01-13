
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, MathQuestion, Player, ComparisonResult } from './types';
import { generateQuestion } from './services/mathService';
import StarDisplay from './components/StarDisplay';
import confetti from 'https://cdn.skypack.dev/canvas-confetti';

const QUESTIONS_PER_PLAYER = 12;
const TIME_LIMIT = 20;
const AVATARS = ['🦁', '🐯', '🐵', '🐘', '🦒', '🐍', '🐸', '🦜', '🐊', '🐼', '🦓', '🦏', '🦛', '🦘', '🦥', '🦦'];

const GameFooter = () => (
  <footer className="fixed bottom-0 left-0 right-0 py-2 px-8 bg-emerald-950/70 backdrop-blur-md text-white/95 text-xs md:text-sm font-bold flex justify-between items-center z-[300] border-t border-white/20 pointer-events-none">
    <div className="flex items-center gap-2">
      <span className="text-xl">🦁</span>
      <span>ספארי המספרים</span>
    </div>
    <div className="flex items-center gap-2">
      <span>שם יוצרת המשחק: אליה בן שושן</span>
      <span className="text-xl">✨</span>
    </div>
  </footer>
);

const VerticalMath: React.FC<{ expression: string; value: number; showResult?: boolean }> = ({ expression, value, showResult = true }) => {
  const parts = expression.split(' ');
  if (parts.length !== 3) return null; 

  const [num1Str, op, num2Str] = parts;
  
  const formatToDigits = (numStr: string) => {
    const padded = numStr.padStart(3, ' ');
    return padded.split('');
  };

  const n1Digits = formatToDigits(num1Str);
  const n2Digits = formatToDigits(num2Str);
  const resDigits = formatToDigits(value.toString());

  return (
    <div className="flex flex-col items-center bg-white/95 p-3 md:p-4 rounded-xl border-2 border-emerald-600 shadow-md min-w-[120px] md:min-w-[140px]" dir="ltr">
      <div className="grid grid-cols-4 gap-1 w-full mb-1 text-[10px] md:text-xs text-emerald-800 font-black text-center border-b border-emerald-100 pb-1">
        <div className="w-3"></div>
        <div className="w-6 md:w-8">מ'</div>
        <div className="w-6 md:w-8">ע'</div>
        <div className="w-6 md:w-8">א'</div>
      </div>

      <div className="font-mono text-3xl md:text-4xl text-emerald-900 leading-none space-y-1">
        <div className="grid grid-cols-4 gap-1 text-center font-bold">
          <div className="w-3"></div>
          {n1Digits.map((d, i) => (
            <div key={`n1-${i}`} className="w-6 h-8 md:w-8 md:h-10 flex items-center justify-center bg-emerald-50/50 rounded-lg">
              {d === ' ' ? '\u00A0' : d}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-4 gap-1 text-center font-bold">
          <div className="w-3 h-8 md:h-10 flex items-center justify-center text-2xl md:text-3xl text-emerald-600">{op}</div>
          {n2Digits.map((d, i) => (
            <div key={`n2-${i}`} className="w-6 h-8 md:w-8 md:h-10 flex items-center justify-center bg-emerald-50/50 rounded-lg">
              {d === ' ' ? '\u00A0' : d}
            </div>
          ))}
        </div>
        
        <div className="w-full h-1 bg-emerald-800 rounded-full my-1"></div>
        
        <div className="grid grid-cols-4 gap-1 text-center font-black">
          <div className="w-3"></div>
          {resDigits.map((d, i) => (
            <div key={`res-${i}`} className="w-6 h-8 md:w-8 md:h-10 flex items-center justify-center bg-emerald-100 rounded-lg text-emerald-700">
              {showResult ? (d === ' ' ? '\u00A0' : d) : '?'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const VisualNumber: React.FC<{ value: number; color: string }> = ({ value, color }) => {
  const tens = Math.floor(value / 10);
  const ones = value % 10;

  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-2xl border-2 border-emerald-100 shadow-sm w-full">
      <div className="text-base md:text-lg font-black text-emerald-950 mb-2">{value}</div>
      <div className="flex flex-wrap justify-center gap-1.5 min-h-[50px]">
        <div className="flex gap-1">
          {Array.from({ length: tens }).map((_, i) => (
            <div key={`t-${i}`} className="w-3 h-10 bg-emerald-700 rounded-full border border-emerald-900 flex flex-col justify-around py-0.5 shadow-sm">
              {[1].map(j => <div key={j} className="h-px w-full bg-emerald-400/20"></div>)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: ones }).map((_, i) => (
            <div key={`o-${i}`} className="w-4 h-4 bg-amber-900 rounded-full border border-amber-950 shadow-inner"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LeafDecoration = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute text-4xl animate-leaf-float opacity-15"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${-10 + Math.random() * 110}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${18 + Math.random() * 18}s`
        }}
      >
        {['🍃', '🌿', '🌱', '🌴'][Math.floor(Math.random() * 4)]}
      </div>
    ))}
  </div>
);

const SafariTimeBar: React.FC<{ timeLeft: number; maxTime: number; avatar: string }> = ({ timeLeft, maxTime, avatar }) => {
  const percentage = (timeLeft / maxTime) * 100;
  const isLowTime = timeLeft <= 5;
  const barColor = isLowTime ? 'bg-red-500' : 'bg-emerald-400';

  return (
    <div className="w-full max-w-xl mx-auto mt-2 px-4">
      <div className={`relative h-5 bg-emerald-950/50 rounded-full border border-emerald-900/50 shadow-inner overflow-visible ${isLowTime ? 'animate-shake-intense' : ''}`}>
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-linear shadow-sm ${barColor}`}
          style={{ width: `${percentage}%` }}
        ></div>
        <div 
          className={`absolute top-1/2 -translate-y-1/2 text-3xl transition-all duration-1000 ease-linear z-10 drop-shadow-md`}
          style={{ left: `calc(${percentage}% - 12px)` }}
        >
          {avatar}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [players, setPlayers] = useState<Player[]>([
    { name: 'שחקן 1', score: 0, streak: 0, questionsAnswered: 0, color: 'bg-emerald-600', avatar: '🦁' },
    { name: 'שחקן 2', score: 0, streak: 0, questionsAnswered: 0, color: 'bg-amber-600', avatar: '🐯' }
  ]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [switchingToPlayerIdx, setSwitchingToPlayerIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [feedback, setFeedback] = useState<{ pIndex: number; type: 'correct' | 'wrong' | 'timeout' | 'streak'; message?: string; showVisual?: boolean; isSimple?: boolean } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (freqs: number[], type: OscillatorType = 'triangle', duration = 0.1, volume = 0.05) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + i * duration);
        gain.gain.setValueAtTime(volume, now + i * duration);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * duration + duration * 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * duration);
        osc.stop(now + i * duration + duration * 1.5);
      });
    } catch (e) {}
  };

  const playCorrectSound = () => playSound([523.25, 659.25, 783.99], 'sine', 0.1); 
  const playWrongSound = () => playSound([392.00, 261.63], 'sawtooth', 0.15);
  const playSwooshSound = () => playSound([200, 400, 600, 800], 'sine', 0.05, 0.02);

  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const startNewGame = () => {
    setPlayers(players.map(p => ({ ...p, score: 0, streak: 0, questionsAnswered: 0 })));
    setCurrentTurn(0);
    setSwitchingToPlayerIdx(0);
    setIsSwitching(true);
    setGameState(GameState.PLAYING);
    playSwooshSound();
    
    setTimeout(() => {
      setFeedback(null);
      setShowHint(false);
      setTimeLeft(TIME_LIMIT);
      setCurrentQuestion(generateQuestion(0));
      setTimeout(() => {
        setIsSwitching(false);
        setSwitchingToPlayerIdx(null);
      }, 1200); 
    }, 1400);
  };

  const checkGameOver = (newPlayers: Player[]) => {
    return newPlayers.every(p => p.questionsAnswered >= QUESTIONS_PER_PLAYER);
  };

  const nextTurn = useCallback(() => {
    if (checkGameOver(players)) {
      setGameState(GameState.GAME_OVER);
      triggerConfetti();
      return;
    }

    let nextIdx = currentTurn === 0 ? 1 : 0;
    
    if (players[nextIdx].questionsAnswered >= QUESTIONS_PER_PLAYER) {
      nextIdx = currentTurn;
    }

    setSwitchingToPlayerIdx(nextIdx);
    setIsSwitching(true);
    playSwooshSound();
    
    setTimeout(() => {
      setFeedback(null);
      setShowHint(false);
      setTimeLeft(TIME_LIMIT);
      setCurrentTurn(nextIdx);
      setCurrentQuestion(generateQuestion(players[nextIdx].score));
      setTimeout(() => {
        setIsSwitching(false);
        setSwitchingToPlayerIdx(null);
      }, 1200); 
    }, 1400);
  }, [currentTurn, players]);

  useEffect(() => {
    if (gameState === GameState.PLAYING && !feedback && !isSwitching) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => (prev <= 1 ? (handleTimeout(), 0) : prev - 1));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, feedback, currentTurn, isSwitching]);

  const handleTimeout = () => {
    if (!currentQuestion) return;
    playWrongSound();
    const newPlayers = [...players];
    newPlayers[currentTurn].streak = 0;
    newPlayers[currentTurn].questionsAnswered += 1;
    setPlayers(newPlayers);
    setFeedback({ 
      pIndex: currentTurn, 
      type: 'timeout', 
      message: `${currentQuestion.leftValue} ${currentQuestion.correctAnswer} ${currentQuestion.rightValue}`,
      showVisual: true,
      isSimple: currentQuestion.leftExpression === currentQuestion.leftValue.toString() && currentQuestion.rightExpression === currentQuestion.rightValue.toString()
    });
  };

  const handleAnswer = (playerIndex: number, answer: ComparisonResult) => {
    if (playerIndex !== currentTurn || !currentQuestion || feedback || isSwitching) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = answer === currentQuestion.correctAnswer;
    const newPlayers = [...players];
    newPlayers[playerIndex].questionsAnswered += 1;
    
    if (isCorrect) {
      newPlayers[playerIndex].score += 1;
      newPlayers[playerIndex].streak += 1;
      
      if (newPlayers[playerIndex].streak >= 2) {
        newPlayers[playerIndex].score += 1;
        newPlayers[playerIndex].streak = 0; 
        setFeedback({ pIndex: playerIndex, type: 'streak', message: "איזו הצלחה! קיבלת כוכב בונוס! 🌟" });
      } else {
        setFeedback({ pIndex: playerIndex, type: 'correct', message: "מצוין! בול פגיעה! 🎯" });
      }
      
      playCorrectSound();
      setPlayers(newPlayers);
      
      if (checkGameOver(newPlayers)) {
         setTimeout(() => {
           setGameState(GameState.GAME_OVER);
           triggerConfetti();
         }, 1200);
      } else {
         setTimeout(nextTurn, 1200);
      }
    } else {
      playWrongSound();
      newPlayers[playerIndex].streak = 0; 
      setPlayers(newPlayers);
      const isSimpleComparison = currentQuestion.leftExpression === currentQuestion.leftValue.toString() && 
                                 currentQuestion.rightExpression === currentQuestion.rightValue.toString();
      const relation = currentQuestion.correctAnswer;
      let message = isSimpleComparison ? `${currentQuestion.leftValue} ${relation} ${currentQuestion.rightValue}` : "";
      setFeedback({ pIndex: playerIndex, type: 'wrong', message: message, showVisual: true, isSimple: isSimpleComparison });
    }
  };

  const updatePlayerName = (i: number, n: string) => { const np = [...players]; np[i].name = n || `שחקן ${i+1}`; setPlayers(np); };
  const updatePlayerAvatar = (i: number, a: string) => { const np = [...players]; np[i].avatar = a; setPlayers(np); };

  const renderContent = () => {
    if (gameState === GameState.START) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center z-10 relative bg-emerald-950/20">
          <LeafDecoration />
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-xl tracking-tighter">ספארי המספרים 🦁</h1>
            <h2 className="text-lg md:text-xl font-bold text-emerald-100 opacity-90 drop-shadow-md">אליה בן שושן</h2>
          </div>
          <div className="bg-white/95 p-6 md:p-8 rounded-3xl shadow-2xl max-w-3xl w-full border-[10px] border-emerald-900 mb-8 overflow-hidden relative">
            <p className="text-2xl md:text-3xl font-black mb-6 text-emerald-950 bg-emerald-100/50 py-3 rounded-2xl shadow-inner">בחרו חיה ושם!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {players.map((p, idx) => (
                <div key={idx} className={`p-4 md:p-6 rounded-[2rem] border-2 shadow-lg transition-transform hover:scale-[1.02] ${idx === 0 ? 'border-emerald-500 bg-emerald-50' : 'border-amber-500 bg-amber-50'}`}>
                  <input 
                    type="text" 
                    maxLength={10} 
                    className="w-full p-2 border-2 border-emerald-200 rounded-xl text-center font-black text-xl mb-4 focus:border-emerald-500 outline-none" 
                    placeholder={`שחקן ${idx + 1}`} 
                    onChange={(e) => updatePlayerName(idx, e.target.value)} 
                    value={p.name}
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {AVATARS.slice(0, 8).map(av => (
                      <button 
                        key={av} 
                        onClick={() => updatePlayerAvatar(idx, av)} 
                        className={`text-3xl p-1.5 rounded-xl border-2 transform transition-all hover:scale-110 active:scale-90 ${p.avatar === av ? 'bg-emerald-500 border-white scale-110 shadow-md' : 'bg-white border-transparent'}`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={startNewGame} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-4 rounded-[2rem] text-3xl md:text-4xl shadow-[0_8px_0_#064e3b] transform transition-all active:translate-y-1 active:shadow-none">
              בואו נשחק! 🚜
            </button>
          </div>
        </div>
      );
    }

    if (gameState === GameState.GAME_OVER) {
      const winner = players[0].score > players[1].score ? players[0] : (players[1].score > players[0].score ? players[1] : null);
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 z-10 text-center">
          <LeafDecoration />
          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border-[12px] border-amber-500 animate-bounce-in max-w-2xl w-full relative z-20">
            {winner ? (
              <>
                <h2 className="text-3xl font-black text-emerald-800 mb-2">מלך הספארי! 👑</h2>
                <div className="text-6xl md:text-8xl mb-4 drop-shadow-xl animate-bounce">{winner.avatar}</div>
                <h3 className="text-3xl font-black mb-6 text-emerald-950">{winner.name} ניצח/ה!</h3>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black text-emerald-800 mb-4">תיקו מותח! 🤝</h2>
                <div className="text-6xl mb-4 flex justify-center gap-4">
                  <span>{players[0].avatar}</span>
                  <span>{players[1].avatar}</span>
                </div>
              </>
            )}

            <div className="bg-emerald-50 p-4 md:p-6 rounded-3xl mb-8 border-2 border-emerald-200 shadow-inner">
              <h4 className="text-emerald-800 font-black mb-4 underline">תוצאות המשחק</h4>
              <div className="flex justify-around items-center">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-1">{players[0].avatar}</div>
                  <div className="text-sm font-bold text-emerald-700 mb-1">{players[0].name}</div>
                  <div className="bg-white px-4 py-1 rounded-full border border-emerald-200 font-black text-2xl text-emerald-900 shadow-sm">
                    {players[0].score} <span className="text-lg">⭐</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-300 mx-2">VS</div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-1">{players[1].avatar}</div>
                  <div className="text-sm font-bold text-emerald-700 mb-1">{players[1].name}</div>
                  <div className="bg-white px-4 py-1 rounded-full border border-emerald-200 font-black text-2xl text-emerald-900 shadow-sm">
                    {players[1].score} <span className="text-lg">⭐</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => setGameState(GameState.START)} className="bg-emerald-700 hover:bg-emerald-800 text-white font-black py-4 px-12 rounded-full text-2xl shadow-xl hover:scale-105 transition-transform active:scale-95">שוב? 🔄</button>
          </div>
        </div>
      );
    }

    const nextPlayer = switchingToPlayerIdx !== null ? players[switchingToPlayerIdx] : players[currentTurn];
    const qNum = Math.min(players[currentTurn].questionsAnswered + 1, QUESTIONS_PER_PLAYER);

    return (
      <div className="h-screen flex flex-col relative z-10 overflow-hidden bg-emerald-900/10">
        <LeafDecoration />
        
        {isSwitching && switchingToPlayerIdx !== null && (
          <div className="fixed inset-0 z-[100] bg-emerald-950/70 backdrop-blur-md flex items-center justify-center animate-turn-swap-fade overflow-hidden">
            <div className="animate-turn-pop text-center relative z-[110]">
               <div className="text-9xl mb-4 drop-shadow-2xl animate-bounce">{nextPlayer.avatar}</div>
               <div className="bg-white py-3 px-12 rounded-full border-[6px] border-amber-400 shadow-2xl">
                 <div className="text-5xl font-black text-emerald-900 tracking-tight">{nextPlayer.name}</div>
                 <div className="text-xl font-bold text-emerald-600">שאלה {nextPlayer.questionsAnswered + 1}</div>
               </div>
            </div>
          </div>
        )}

        <div className={`bg-emerald-900/95 p-4 shadow-2xl z-20 text-center border-b-[6px] border-amber-500 transition-all duration-700 ${isSwitching ? 'translate-y-[-120%] opacity-0' : 'translate-y-0 opacity-100'}`}>
          <div className="flex flex-col items-center max-w-4xl mx-auto gap-3">
            <div className="flex justify-between items-center w-full px-4">
              <div className="bg-amber-100 text-amber-900 px-4 py-1 rounded-full text-xs font-black border-2 border-amber-500 shadow-md">
                שאלה {qNum} מתוך {QUESTIONS_PER_PLAYER}
              </div>
              <h2 className="text-2xl font-black text-white drop-shadow-lg">{players[currentTurn].avatar} {players[currentTurn].name}</h2>
              <div className="w-16"></div> 
            </div>
            <div className="flex justify-center items-center gap-8 w-full">
              <div dir="ltr" className="bg-white px-8 py-3 rounded-2xl text-5xl font-black text-emerald-800 border-4 border-emerald-200 shadow-xl">{currentQuestion?.leftExpression}</div>
              <div className="text-6xl font-black text-amber-400 animate-pulse drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">?</div>
              <div dir="ltr" className="bg-white px-8 py-3 rounded-2xl text-5xl font-black text-amber-800 border-4 border-amber-200 shadow-xl">{currentQuestion?.rightExpression}</div>
            </div>
            <SafariTimeBar timeLeft={timeLeft} maxTime={TIME_LIMIT} avatar={players[currentTurn].avatar} />
          </div>
        </div>

        <div className="flex-1 flex flex-row h-full overflow-hidden max-w-6xl mx-auto w-full pb-12">
          {players.map((player, idx) => {
            const isActive = idx === currentTurn;
            const isPlayer2 = idx === 1;
            const hasExercise = currentQuestion && (currentQuestion.leftExpression.includes(' ') || currentQuestion.rightExpression.includes(' '));

            return (
              <div key={idx} className={`flex-1 flex flex-col items-center justify-start p-4 transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-10 grayscale scale-95 translate-y-4'}`}>
                <div className="flex flex-col items-center gap-1.5 mb-3">
                   <div className={`text-7xl drop-shadow-xl transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-90'}`}>{player.avatar}</div>
                   <div className={`px-4 py-1 rounded-full text-white text-sm font-black ${player.color} border-2 border-white shadow-lg`}>{player.name}</div>
                   <div className="mt-1">
                     <StarDisplay count={player.score} color={player.color} />
                   </div>
                   <div className="flex flex-col items-center mt-1 gap-1">
                     {isActive && player.streak > 0 && <div className="text-orange-500 text-sm font-black animate-bounce">בדרך לכוכב בונוס! 🔥</div>}
                     <div className="text-emerald-800 text-xs font-bold opacity-60">התקדמות: {player.questionsAnswered}/{QUESTIONS_PER_PLAYER}</div>
                   </div>
                </div>

                <div className={`flex ${isPlayer2 ? 'flex-row-reverse' : 'flex-row'} items-start justify-center gap-6 w-full mt-2`}>
                  <div className={`flex flex-col gap-3 w-[150px] transition-all duration-500 ${isActive ? 'translate-x-0' : idx === 0 ? '-translate-x-12' : 'translate-x-12'}`}>
                    {(['>', '=', '<'] as ComparisonResult[]).map((symbol) => (
                      <button 
                        key={symbol} 
                        disabled={!isActive || !!feedback || isSwitching} 
                        onClick={() => handleAnswer(idx, symbol)} 
                        className={`py-4 rounded-2xl text-6xl font-black shadow-xl transform transition-all hover:scale-105 active:scale-95 ${!isActive ? 'bg-gray-300' : 
                          feedback && feedback.pIndex === idx && feedback.type === 'wrong' ? 'bg-red-500 text-white' : 
                          feedback && feedback.pIndex === idx && (feedback.type === 'correct' || feedback.type === 'streak') && currentQuestion?.correctAnswer === symbol ? 'bg-emerald-500 text-white' : 
                          'bg-white text-emerald-900 border-b-[6px] border-emerald-100 hover:bg-emerald-50'}`}
                      >
                        {symbol}
                      </button>
                    ))}
                    {isActive && !feedback && !isSwitching && (
                      <button onClick={() => setShowHint(!showHint)} className="mt-2 bg-amber-400 text-amber-900 font-black py-3 rounded-xl text-sm shadow-lg border-2 border-white transform hover:scale-105 transition-transform">רמז 🐵</button>
                    )}
                  </div>

                  <div className="flex-1 min-w-[280px] flex flex-col items-center">
                    {/* רמז (מסתיר פיתרון) */}
                    {showHint && !feedback && isActive && currentQuestion && (
                      <div className="animate-fade-in-up w-full max-w-sm">
                        <div className="bg-amber-50/95 p-4 rounded-[2rem] border-4 border-amber-300 shadow-2xl">
                          <div className="text-sm md:text-base font-black text-amber-900 mb-3 text-center underline decoration-2 decoration-amber-500 underline-offset-4">עזרה לפתרון</div>
                          <div className="flex flex-col gap-4">
                            {hasExercise ? (
                              <div className="flex justify-center gap-3 scale-90 origin-top" dir="ltr">
                                {currentQuestion.leftExpression.includes(' ') && (
                                  <VerticalMath expression={currentQuestion.leftExpression} value={currentQuestion.leftValue} showResult={false} />
                                )}
                                {currentQuestion.rightExpression.includes(' ') && (
                                  <VerticalMath expression={currentQuestion.rightExpression} value={currentQuestion.rightValue} showResult={false} />
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-row gap-4">
                                <VisualNumber value={currentQuestion.leftValue} color="emerald" />
                                <VisualNumber value={currentQuestion.rightValue} color="amber" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* משוב (Feedback) */}
                    {feedback?.pIndex === idx && (
                      <div className="flex flex-col items-center animate-bounce-in w-full max-w-md mt-6">
                        <div className={`p-6 rounded-[2.5rem] text-center font-black text-lg md:text-xl border-[8px] w-full shadow-2xl leading-relaxed ${
                          feedback.type === 'correct' || feedback.type === 'streak' ? 'bg-emerald-700 text-white border-emerald-400' : 'bg-red-700 text-white border-red-400'
                        }`}>
                          
                          {(feedback.type === 'correct' || feedback.type === 'streak') && (
                            <div className="text-2xl">{feedback.message}</div>
                          )}

                          {(feedback.type === 'wrong' || feedback.type === 'timeout') && currentQuestion && (
                            <div className="flex flex-col items-center gap-4">
                              {feedback.isSimple ? (
                                <div className="text-3xl font-black tracking-widest drop-shadow-sm" dir="ltr">{feedback.message}</div>
                              ) : (
                                <>
                                  <div className="text-sm opacity-80 mb-1">הפיתרון הנכון:</div>
                                  <div className="flex justify-center gap-4 scale-90 origin-top" dir="ltr">
                                    {currentQuestion.leftExpression.includes(' ') && (
                                      <VerticalMath expression={currentQuestion.leftExpression} value={currentQuestion.leftValue} showResult={true} />
                                    )}
                                    {currentQuestion.rightExpression.includes(' ') && (
                                      <VerticalMath expression={currentQuestion.rightExpression} value={currentQuestion.rightValue} showResult={true} />
                                    )}
                                  </div>
                                  <div className="mt-2 text-2xl font-black" dir="ltr">
                                    {currentQuestion.leftValue} {currentQuestion.correctAnswer} {currentQuestion.rightValue}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        {(feedback.type === 'wrong' || feedback.type === 'timeout') && (
                          <button onClick={nextTurn} className="mt-6 bg-white text-emerald-900 font-black py-3 px-10 rounded-2xl shadow-2xl border-4 border-emerald-900 text-2xl hover:scale-110 active:scale-95 transition-all">המשך ➡️</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-start justify-center">
      <div className="transform scale-75 origin-top w-[133.33%] h-[133.33%] relative overflow-hidden">
        {renderContent()}
        <style>{`
          @keyframes leaf-float { 
            0% { transform: translate(0,0) rotate(0deg); } 
            50% { transform: translate(20px, 40px) rotate(180deg); } 
            100% { transform: translate(0, 80px) rotate(360deg); } 
          }
          .animate-leaf-float { animation: leaf-float infinite linear; }
          @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }
          @keyframes bounce-in { 0% { transform: scale(0.3); opacity: 0; } 70% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
          .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          @keyframes turn-swap-fade { 0%, 100% { opacity: 0; } 10%, 90% { opacity: 1; } }
          .animate-turn-swap-fade { animation: turn-swap-fade 3.5s ease-in-out forwards; }
          @keyframes turn-pop { 0% { transform: scale(0.2) translateY(60px); opacity: 0; } 25%, 75% { transform: scale(1.1) translateY(0); opacity: 1; } 100% { transform: scale(0.5) translateY(-60px); opacity: 0; } }
          .animate-turn-pop { animation: turn-pop 3.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          @keyframes shake-intense { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-4px); } 40%, 80% { transform: translateX(4px); } }
          .animate-shake-intense { animation: shake-intense 0.4s infinite; }
        `}</style>
      </div>
      <GameFooter />
    </div>
  );
};

export default App;
