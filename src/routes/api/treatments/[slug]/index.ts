import type { RequestHandler } from "@builder.io/qwik-city";
import { getDb, treatments, treatmentBeforeAfter } from "~/db";
import { eq, asc } from "drizzle-orm";

export const onGet: RequestHandler = async (event) => {
  const slug = event.params.slug;

  if (!slug || typeof slug !== "string") {
    event.json(400, { error: "Invalid slug" });
    return;
  }

  const db = getDb(event.env);

  const [treatment] = await db
    .select()
    .from(treatments)
    .where(eq(treatments.slug, slug))
    .limit(1);

  if (!treatment) {
    event.json(404, { error: "Treatment not found" });
    return;
  }

  const beforeAfterImages = await db
    .select()
    .from(treatmentBeforeAfter)
    .where(eq(treatmentBeforeAfter.treatmentId, treatment.id))
    .orderBy(asc(treatmentBeforeAfter.displayOrder));

  event.json(200, {
    ...treatment,
    beforeAfterImages,
  });
};
