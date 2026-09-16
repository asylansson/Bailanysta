import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export default function TopProgressBar() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutsRef = useRef([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [
      setTimeout(() => setProgress(70), 100),
      setTimeout(() => setProgress(100), 320),
      setTimeout(() => setVisible(false), 480),
      setTimeout(() => setProgress(0), 600),
    ];
    setVisible(true);
    setProgress(20);

    return () => timeoutsRef.current.forEach(clearTimeout);
  }, [location.pathname]);

  return (
    <div
      aria-hidden="true"
      className={`fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
