-- AlterTable
ALTER TABLE "gdt_field_notes"."Post" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "gdt_field_notes"."PostRevision" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostRevision_postId_idx" ON "gdt_field_notes"."PostRevision"("postId");

-- AddForeignKey
ALTER TABLE "gdt_field_notes"."PostRevision" ADD CONSTRAINT "PostRevision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "gdt_field_notes"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
