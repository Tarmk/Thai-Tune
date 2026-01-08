import { useEffect, useState } from "react";

export function useScriptLoad(src: string): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => {
      console.error(`Failed to load script: ${src}`);
    };

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [src]);

  return loaded;
}
