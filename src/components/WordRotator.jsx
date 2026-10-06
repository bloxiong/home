import React, { useEffect, useState } from 'react';

/* Rolls through a list of words: the current word slides up and out as
   the next slides in, with an accent underline that redraws each time.
   Every word sits in the same grid cell, so the line keeps the width of
   the longest word and nothing shifts. Screen readers get the whole list
   once (not selectable, so copying the line stays clean). With reduced
   motion the words simply swap. */
export default function WordRotator({ words, interval = 2600, className = '' }) {
  const [{ i, prev }, setState] = useState({ i: 0, prev: -1 });

  useEffect(() => {
    const t = setInterval(() => {
      setState(({ i: cur }) => ({ i: (cur + 1) % words.length, prev: cur }));
    }, interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  return (
    <span className={`rotator ${className}`}>
      <span className="sr-only select-none">{words.join(', ')}</span>
      <span className="rotator-stack" aria-hidden="true">
        {words.map((w, k) => (
          <span
            key={w}
            className={`rotator-word ${k === i ? 'is-current' : k === prev ? 'is-leaving' : ''}`}
          >
            {w}
          </span>
        ))}
      </span>
    </span>
  );
}
