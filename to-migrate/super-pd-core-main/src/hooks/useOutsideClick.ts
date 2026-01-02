import { RefObject, useEffect } from "react";

/**
 * Hook that handle clicks outside of the passed ref
 */
function useOutsideClick(ref: RefObject<any>, callback: () => void, window?: Window | null) {
    useEffect(() => {
      function handleClickOutside(event : Event) {
        if (ref.current && !ref.current.contains(event.target)) {
            callback();
        }
      }
      
      const _document = window?.document || document;
      _document.addEventListener('mousedown', handleClickOutside, true);
      // Handle iframes click
      window?.focus();
      window?.addEventListener('blur', callback);

      return () => {
        _document.removeEventListener('mousedown', handleClickOutside, true);
        window?.removeEventListener('blur', callback);
      };
    }, [ref.current]);
}

export default useOutsideClick;
