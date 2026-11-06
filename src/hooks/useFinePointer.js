import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Hover is a mouse/trackpad affordance. Touch devices fire hover on tap, so a
// hover-only effect becomes a false positive there — the card jumps on every
// tap and stays jumped until the next tap lands elsewhere. Gate every hover
// animation behind a pointer that can actually hover.
const QUERY = '(hover: hover) and (pointer: fine)';

function read() {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(QUERY).matches;
}

export default function useFinePointer() {
  const [fine, setFine] = useState(read);

  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    const mq = window.matchMedia(QUERY);
    // Safari < 14 only supports the deprecated listener API.
    const onChange = () => setFine(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    if (typeof mq.addListener === 'function') {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
    return undefined;
  }, []);

  return fine;
}
