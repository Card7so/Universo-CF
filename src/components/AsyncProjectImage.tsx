import { useState, useEffect } from "react";
import { getLargeFile } from "../utils/indexedDB";
// @ts-ignore
import minsaLogo from "../assets/images/minsa_prep_cf_logo_1782517690942.jpg";

interface AsyncProjectImageProps {
  projectId: string;
  title: string;
  type: string;
  coverImageData?: string;
  className?: string;
}

export default function AsyncProjectImage({
  projectId,
  title,
  type,
  coverImageData,
  className = "w-full h-full object-cover",
}: AsyncProjectImageProps) {
  const [src, setSrc] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const getFallback = () => {
    const lowerTitle = title.toLowerCase();
    if (
      lowerTitle.includes("minsa") ||
      lowerTitle.includes("prep") ||
      lowerTitle.includes("cf")
    ) {
      return minsaLogo;
    }

    if (type === "apps") return minsaLogo;
    if (type === "books") return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80";
    if (type === "music") return "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80";
    
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80";
  };

  useEffect(() => {
    let isMounted = true;

    const resolveSrc = async () => {
      if (!coverImageData) {
        if (isMounted) setSrc(getFallback());
        return;
      }

      if (coverImageData === "indexeddb") {
        if (isMounted) setLoading(true);
        try {
          const cached = await getLargeFile(`cover_${projectId}`);
          if (isMounted) {
            setSrc(cached || getFallback());
          }
        } catch (err) {
          console.error("Erro ao obter imagem de capa do IndexedDB:", err);
          if (isMounted) setSrc(getFallback());
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) setSrc(coverImageData);
      }
    };

    resolveSrc();

    return () => {
      isMounted = false;
    };
  }, [projectId, title, type, coverImageData]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-900 border border-white/5`}>
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
}
