import { env } from "cloudflare:workers";
import { ensureSchema } from "../db/ensure-schema";

export type EditableSiteSettings = {
  displayName: string;
  nativeName: string;
  alias: string;
  academyLabel: string;
  cosplayLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroIntro: string;
  aboutHeadline: string;
  aboutBioEn: string;
  aboutBioJa: string;
  role: string;
  school: string;
  location: string;
  focus: string;
  contactHeadline: string;
  contactEmail: string;
  instagramUrl: string;
  xUrl: string;
  featuresText: string;
};

export type SiteSettings = EditableSiteSettings & { profilePhotoUrl: string | null };

export const defaultSiteSettings: EditableSiteSettings = {
  displayName: "Clark Lo",
  nativeName: "羅育穎",
  alias: "YuYing",
  academyLabel: "Academy",
  cosplayLabel: "Cosplay",
  heroEyebrow: "Taiwan-based student photographer",
  heroTitle: "I keep the moments that usually pass.",
  heroIntro: "Working across school life, performance, portraiture, cosplay, and the quiet human stories between them.",
  aboutHeadline: "Photography is less about recording what happened than preserving the moments that might otherwise disappear.",
  aboutBioEn: "Clark’s photography began behind the scenes of school events, where he became drawn to moments that happen outside the center of attention—subtle gestures, changing expressions, and the quiet transitions that shape how a place feels.\n\nAs Co-Head of the Media Crew at Pacific American School, he photographs performances and major campus events while mentoring newer photographers and developing post-production workflows. Beyond school, his work has expanded to robotics competitions, Model United Nations conferences, and Taiwan’s cosplay and subculture events, including Fancy Frontier and acosta!.\n\nMoving between documentary coverage and portraiture, Clark focuses on natural expressions, atmosphere, and the relationship between people and their surroundings.",
  aboutBioJa: "台湾を拠点に、ポートレート、パフォーマンス、学校生活、コスプレ、そして人々の物語を撮影する学生フォトグラファー。\n\nクラークの写真活動は、学校行事の舞台裏を記録することから始まりました。ステージの中心だけでなく、何気ない仕草や変化する表情、その場の空気が切り替わる瞬間など、見過ごされやすい場面に惹かれています。\n\nPacific American SchoolではMedia CrewのCo-Headとして、学校行事やパフォーマンスを撮影しながら、後輩フォトグラファーのサポートやポストプロダクションのワークフロー作りにも取り組んでいます。学校外では、ロボティクス大会、模擬国連、Fancy Frontierやacosta!などのコスプレ・サブカルチャーイベントでも撮影を行っています。",
  role: "Student photographer · Media Crew Co-Head",
  school: "Pacific American School",
  location: "Taiwan",
  focus: "Portraiture · Performance · School life · Cosplay",
  contactHeadline: "Have something in mind?",
  contactEmail: "clark970417@gmail.com",
  instagramUrl: "https://www.instagram.com/yin_0417.jpg/?hl=en",
  xUrl: "https://x.com/4yuying?s=21&t=h7d3UL9mlLZ0_H-FhiEjOQ",
  featuresText: "eruk | Roxy / Mushoku Tensei at FF46 | 2026 | https://x.com/A_erukun/status/2020708829672112219?s=20\nZakuro | Fuyuko at Comic Market 105 | 2024 | https://www.facebook.com/share/p/1JqoHXB3XR/\nPacific American School | PASVEX Signature Event Campaign | 2026 | https://www.facebook.com/share/p/1CZzFs8RcV/\nPacific American School | PASMUN Conference Coverage | 2026 | https://www.facebook.com/share/p/1bQ8ZZocCP/",
};

export const editableSettingKeys = Object.keys(defaultSiteSettings) as (keyof EditableSiteSettings)[];

export const settingLimits: Record<keyof EditableSiteSettings, number> = {
  displayName: 80,
  nativeName: 80,
  alias: 80,
  academyLabel: 40,
  cosplayLabel: 40,
  heroEyebrow: 140,
  heroTitle: 180,
  heroIntro: 420,
  aboutHeadline: 320,
  aboutBioEn: 4000,
  aboutBioJa: 4000,
  role: 180,
  school: 180,
  location: 120,
  focus: 240,
  contactHeadline: 180,
  contactEmail: 240,
  instagramUrl: 500,
  xUrl: 500,
  featuresText: 6000,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!env.DB) return { ...defaultSiteSettings, profilePhotoUrl: "/clark-profile.jpg" };
  try {
    await ensureSchema(env.DB);
    const rows = await env.DB.prepare("SELECT key,value,updated_at FROM site_settings").all<{ key: string; value: string; updated_at: number }>();
    const values: Record<string, string> = {};
    let photoVersion = 0;
    for (const row of rows.results) {
      values[row.key] = row.value;
      if (row.key === "profilePhotoKey") photoVersion = row.updated_at;
    }
    const settings = { ...defaultSiteSettings };
    for (const key of editableSettingKeys) {
      if (typeof values[key] === "string") settings[key] = values[key];
    }
    const profilePhotoUrl = values.profilePhotoKey
      ? `/api/profile-photo?v=${photoVersion}`
      : values.profilePhotoHidden === "1"
        ? null
        : "/clark-profile.jpg";
    return { ...settings, profilePhotoUrl };
  } catch {
    return { ...defaultSiteSettings, profilePhotoUrl: "/clark-profile.jpg" };
  }
}

export type FeatureItem = { source: string; title: string; year: string; url: string };

export function parseFeatures(value: string): FeatureItem[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 20).flatMap((line) => {
    const [source, title, year, ...urlParts] = line.split("|").map((part) => part.trim());
    const url = urlParts.join("|");
    if (!source || !title || !url || !/^https:\/\//i.test(url)) return [];
    return [{ source, title, year, url }];
  });
}
