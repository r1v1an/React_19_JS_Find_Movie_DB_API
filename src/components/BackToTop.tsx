import { useState, useEffect } from "react";

const BackToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Кнопка видна, если прокручено больше 70% страницы
      const isBottom = (window.scrollY + window.innerHeight) > (document.documentElement.scrollHeight * 0.7);
      setShow(isBottom);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button type="button" aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-8 right-8 z-50 size-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border border-white/10 backdrop-blur-md bg-white/10 hover:bg-[#AB8BFF] text-[#D6C7FF] hover:text-white ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

export default BackToTop;
