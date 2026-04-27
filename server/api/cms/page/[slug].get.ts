type CmsPageBlock =
  | {
      _type: "bigDog";
      _key: string;
      text: string;
      backgroundColor: string;
      imageUrl: string | null;
      imageAlt: string;
    }
  | {
      _type: "homeBannerRef";
      _key: string;
      text: string | null;
      backgroundColor: string | null;
    };

type CmsPageResponse = {
  title: string;
  slug: string;
  content: CmsPageBlock[];
} | null;

export default defineEventHandler(async (event): Promise<CmsPageResponse> => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    return null;
  }

  const sanity = useSanity();
  const query = `
    *[_type == "page" && slug.current == $slug][0]{
      title,
      "slug": slug.current,
      "content": content[]{
        ...,
        _type == "bigDog" => {
          _type,
          _key,
          text,
          backgroundColor,
          "imageUrl": image.asset->url,
          "imageAlt": coalesce(image.alt, "")
        },
        _type == "homeBannerRef" => {
          _type,
          _key,
          "text": banner->text,
          "backgroundColor": banner->backgroundColor
        }
      }
    }
  `;

  const page = await sanity.fetch<CmsPageResponse>(query, { slug });

  if (!page) {
    return null;
  }

  return {
    title: page.title,
    slug: page.slug,
    content: page.content ?? [],
  };
});
