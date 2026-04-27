type HomeBannerResponse = {
  text: string;
  backgroundColor: string;
} | null;

export default defineEventHandler(async (): Promise<HomeBannerResponse> => {
  const sanity = useSanity();

  const query = `
    *[_type == "homeBanner"] | order(_updatedAt desc)[0]{
      text,
      backgroundColor
    }
  `;

  const banner = await sanity.fetch<HomeBannerResponse>(query);

  if (!banner) {
    return null;
  }

  return {
    text: banner.text,
    backgroundColor: banner.backgroundColor,
  };
});
