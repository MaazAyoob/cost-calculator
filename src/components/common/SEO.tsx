import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Hutty — Understand your home before you build",
  description = "Plan your house, see how much it may cost, understand the materials you may need, and get help from experts when you need it.",
  keywords = "Hutty, home construction planning, residential cost estimator, Bangalore house planning, construction cost calculator, materials needed",
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
