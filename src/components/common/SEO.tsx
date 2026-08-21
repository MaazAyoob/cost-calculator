import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Hutty — Home Construction Planning Platform | Build your home with clarity",
  description = "Plan your plot, spaces, materials and construction cost before you build with Hutty. Deterministic, quantity-based estimates and bank-ready BOQ.",
  keywords = "Hutty, home construction planning, residential cost estimator, Bangalore house planning, BOQ generator, architectural cost planning, construction cost calculator",
}) => {
  useEffect(() => {
    document.title = title;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.setAttribute('content', keywords);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
  }, [title, description, keywords]);

  return null;
};
