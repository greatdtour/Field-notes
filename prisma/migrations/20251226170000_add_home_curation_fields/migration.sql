-- Add home curation fields for featured and editorial picks
ALTER TABLE "Post" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN     "editorialPickOrder" INTEGER;

CREATE UNIQUE INDEX "Post_editorialPickOrder_key" ON "Post"("editorialPickOrder");
