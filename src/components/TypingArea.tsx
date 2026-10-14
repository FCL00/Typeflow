import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MousePointerClick } from 'lucide-react';
import { UserSettings, WordItem } from '../types';
import { playKeySound } from '../utils/audio';

interface TypingAreaProps {
  words: WordItem[];
  currentWordIndex: number;
  currentInput: string;
  onInputChange: (newInput: string, key: string) => void;
  onSpacePress: () => void;
  onBackspacePress: (isCtrlOrAlt: boolean) => void;
  onRestartTest: () => void;
  settings: UserSettings;
  isTestActive: boolean;
  isCompleted: boolean;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  words,
  currentWordIndex,
  currentInput,
  onInputChange,
  onSpacePress,
  onBackspacePress,
  onRestartTest,
  settings,
  isTestActive,
  isCompleted,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [caretPos, setCaretPos] = useState<{ top: number; left: number; width: number; height: number }>({
    top: 0,
    left: 0,
    width: 2,
    height: 32,
  });
  const [containerScrollTop, setContainerScrollTop] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsWrapperRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const wordRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Focus input helper
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      setIsFocused(true);
    }
  }, []);

  // Ensure focus on mount and test restart
  useEffect(() => {
    focusInput();
  }, [focusInput, words]);

  // Update caret position and line scroll
  useEffect(() => {
    if (isCompleted || words.length === 0) return;

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    const charIndex = currentInput.length;
    let targetElement: HTMLElement | null = null;
    let isAfterEnd = false;

    if (charIndex < currentWord.original.length) {
      // Points directly to the current character
      const letterKey = `${currentWordIndex}-${charIndex}`;
      targetElement = letterRefs.current.get(letterKey) || null;
    } else {
      // Points right after the last character in the word (or extra characters)
      const lastCharIndex = currentWord.letters.length - 1;
      const letterKey = `${currentWordIndex}-${lastCharIndex}`;
      targetElement = letterRefs.current.get(letterKey) || null;
      isAfterEnd = true;
    }

    const container = containerRef.current;
    const wordsWrapper = wordsWrapperRef.current;

    if (targetElement && container && wordsWrapper) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      let left = targetRect.left - containerRect.left;
      if (isAfterEnd) {
        left += targetRect.width;
      }
      const top = targetRect.top - containerRect.top;

      // Adjust height and width based on caret style
      let width = 2;
      let height = targetRect.height || 32;

      if (settings.caretStyle === 'block') {
        width = isAfterEnd ? 12 : targetRect.width;
      } else if (settings.caretStyle === 'underline') {
        width = isAfterEnd ? 12 : targetRect.width;
        height = 3;
      } else if (settings.caretStyle === 'outline') {
        width = isAfterEnd ? 12 : targetRect.width;
      }

      setCaretPos({
        top: settings.caretStyle === 'underline' ? top + targetRect.height - 3 : top,
        left,
        width,
        height,
      });

      // Smooth line scroll tracking: check active word vertical offset
      const wordEl = wordRefs.current.get(currentWordIndex);
      if (wordEl) {
        const wordOffsetTop = wordEl.offsetTop;
        const lineHeight = targetRect.height || 36;
        
        // When active word reaches line 2 (offset > 1.2 * lineHeight), scroll up so active line is on top/center
        if (wordOffsetTop > lineHeight * 1.4) {
          const targetScroll = wordOffsetTop - lineHeight * 0.9;
          setContainerScrollTop(targetScroll);
        } else {
          setContainerScrollTop(0);
        }
      }
    }
  }, [currentWordIndex, currentInput, words, settings.caretStyle, isCompleted]);

  // Handle physical key events on the hidden input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isCompleted) return;

    // Restart shortcut: Tab + Enter or Escape
    if (e.key === 'Escape' || (e.key === 'Enter' && e.shiftKey)) {
      e.preventDefault();
      onRestartTest();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      onRestartTest();
      return;
    }

    // Space advances to next word
    if (e.key === ' ') {
      e.preventDefault();
      onSpacePress();
      return;
    }

    // Backspace handling
    if (e.key === 'Backspace') {
      e.preventDefault();
      onBackspacePress(e.ctrlKey || e.altKey || e.metaKey);
      return;
    }

    // Single character input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      onInputChange(currentInput + e.key, e.key);
    }
  };

  // Font styling helpers
  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'plusjakarta':
        return 'font-sans';
      case 'spacemono':
        return 'font-mono tracking-normal';
      case 'sourcecode':
        return 'font-mono';
      case 'jetbrains':
      default:
        return 'font-mono tracking-tight';
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'md':
        return 'text-xl sm:text-2xl leading-relaxed';
      case 'xl':
        return 'text-3xl sm:text-4xl leading-loose';
      case 'lg':
      default:
        return 'text-2xl sm:text-3xl leading-relaxed';
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={focusInput}
      className={`relative w-full max-w-4xl mx-auto h-[180px] sm:h-[195px] overflow-hidden select-none cursor-text px-3 py-2 rounded-xl transition-all ${
        getFontFamilyClass()
      } ${getFontSizeClass()}`}
    >
      {/* Hidden input to capture keyboard events reliably */}
      <input
        ref={inputRef}
        type="text"
        className="absolute inset-0 opacity-0 cursor-default pointer-events-none w-0 h-0 p-0 m-0 border-0"
        value={currentInput}
        onChange={() => {}} // Controlled by onKeyDown
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Blurred out-of-focus overlay with prompt */}
      {!isFocused && !isCompleted && (
        <div
          onClick={focusInput}
          className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg-color)]/70 backdrop-blur-[2px] cursor-pointer transition-opacity"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--sub-alt-color)] text-[var(--text-color)] text-sm font-sans font-medium shadow-lg animate-pulse">
            <MousePointerClick className="w-4 h-4 text-[var(--main-color)]" />
            <span>Click or press any key to focus</span>
          </div>
        </div>
      )}

      {/* Words display container with smooth line transition */}
      <div
        ref={wordsWrapperRef}
        style={{ transform: `translateY(-${containerScrollTop}px)` }}
        className="flex flex-wrap gap-x-3.5 gap-y-2 transition-transform duration-200 ease-out will-change-transform"
      >
        {words.map((word, wIdx) => {
          const isCurrentWord = wIdx === currentWordIndex;
          const isPastWord = wIdx < currentWordIndex;

          return (
            <div
              key={word.id}
              ref={el => {
                if (el) wordRefs.current.set(wIdx, el);
                else wordRefs.current.delete(wIdx);
              }}
              className={`relative flex items-center transition-colors ${
                isPastWord && word.hasMistake
                  ? 'border-b border-[var(--error-color)]/60'
                  : ''
              }`}
            >
              {/* Letters */}
              {word.letters.map((letter, lIdx) => {
                const key = `${wIdx}-${lIdx}`;
                let colorClass = 'text-[var(--sub-color)]';

                if (letter.state === 'correct') {
                  colorClass = 'text-[var(--text-color)]';
                } else if (letter.state === 'incorrect') {
                  colorClass = 'text-[var(--error-color)]';
                } else if (letter.state === 'extra') {
                  colorClass = 'text-[var(--error-extra-color)]';
                }

                return (
                  <span
                    key={key}
                    ref={el => {
                      if (el) letterRefs.current.set(key, el);
                      else letterRefs.current.delete(key);
                    }}
                    className={`inline-block transition-colors duration-75 ${colorClass}`}
                  >
                    {letter.char}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Visible Caret / Cursor */}
      {isFocused && !isCompleted && settings.caretStyle !== 'off' && (
        <div
          style={{
            top: `${caretPos.top}px`,
            left: `${caretPos.left}px`,
            width: `${caretPos.width}px`,
            height: `${caretPos.height}px`,
          }}
          className={`absolute pointer-events-none z-10 ${
            settings.smoothCaret ? 'transition-all duration-100 ease-out' : ''
          } ${
            !isTestActive ? 'animate-caret-blink' : ''
          } ${
            settings.caretStyle === 'outline'
              ? 'border-2 border-[var(--caret-color)] bg-transparent rounded-sm'
              : settings.caretStyle === 'block'
              ? 'bg-[var(--caret-color)]/40 rounded-sm'
              : 'bg-[var(--caret-color)] rounded-full'
          }`}
        />
      )}
    </div>
  );
};
