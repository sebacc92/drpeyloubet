import type { RequestHandler } from "@builder.io/qwik-city";
import { getDb, treatments } from "~/db";
import { asc } from "drizzle-orm";

export const onGet: RequestHandler = async (event) => {
  const db = getDb(event.env);

  const allTreatments = await db
    .select({
      id: treatments.id,
      slug: treatments.slug,
      name: treatments.name,
      category: treatments.category,
      shortDescription: treatments.shortDescription,
      mainImageUrl: treatments.mainImageUrl,
      isFeatured: treatments.isFeatured,
      displayOrder: treatments.displayOrder,
    })
    .from(treatments)
    .orderBy(asc(treatments.displayOrder));

  event.json(200, allTreatments);
};
