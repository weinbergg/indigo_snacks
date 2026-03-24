import { useEffect } from 'react';

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    const previousDescription = descriptionTag?.content;

    document.title = title;

    if (descriptionTag) {
      descriptionTag.content = description;
    }

    return () => {
      document.title = previousTitle;
      if (descriptionTag && previousDescription) {
        descriptionTag.content = previousDescription;
      }
    };
  }, [description, title]);
}
