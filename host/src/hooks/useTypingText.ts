import { useEffect, useState } from 'react';

const startDelay = 500;
const typeDelay = 95;
const holdDelay = 1600;
const deleteDelay = 45;
const nextWordDelay = 400;

export function useTypingText(words: string[], stopped: boolean, rounds = 2) {
  const [typed, setTyped] = useState({ text: '', done: false });
  const wordList = words.join('\n');

  useEffect(() => {
    const list = wordList.split('\n').filter(Boolean);
    if (stopped || list.length === 0) return;

    const lastStep = list.length * rounds - 1;
    let step = 0;
    let length = 0;
    let deleting = false;
    let timer = 0;

    function tick() {
      const word = list[step % list.length];
      let delay = typeDelay;
      if (deleting) {
        length -= 1;
        delay = deleteDelay;
        if (length <= 0) {
          length = 0;
          deleting = false;
          step += 1;
          delay = nextWordDelay;
        }
      } else {
        length += 1;
        if (length >= word.length) {
          if (step === lastStep) {
            setTyped({ text: word, done: true });
            return;
          }
          deleting = true;
          delay = holdDelay;
        }
      }
      setTyped({ text: list[step % list.length].slice(0, length), done: false });
      timer = window.setTimeout(tick, delay);
    }

    timer = window.setTimeout(tick, startDelay);
    return () => window.clearTimeout(timer);
  }, [wordList, stopped, rounds]);

  if (stopped || typed.done) return { text: words.at(-1) ?? '', typing: false };
  return { text: typed.text, typing: true };
}
