export type CommentEntry = {
  id: string;
  parentId: string | null;
  authorId?: string | null;
  author: string;
  authorImage?: string | null;
  message: string;
  createdAt: string;
  updatedAt?: string | null;
  likes: number;
  likedByMe?: boolean;
};

export const COMMENTS_EVENT = "gdt-comments-updated";

const STORAGE_PREFIX = "gdt-comments";

function getStorageKey(slug: string) {
  return `${STORAGE_PREFIX}:${slug}`;
}

export function createCommentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function readComments(slug: string): CommentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(getStorageKey(slug));
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.id === "string" && typeof item.message === "string")
      .map((item) => ({
        id: item.id,
        parentId: typeof item.parentId === "string" ? item.parentId : null,
        authorId: typeof item.authorId === "string" ? item.authorId : null,
        author: typeof item.author === "string" && item.author.trim() ? item.author : "Guest",
        authorImage: typeof item.authorImage === "string" ? item.authorImage : null,
        message: item.message,
        createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
        updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : null,
        likes: typeof item.likes === "number" ? item.likes : 0,
        likedByMe: !!item.likedByMe,
      }));
  } catch {
    return [];
  }
}

export function writeComments(slug: string, comments: CommentEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(slug), JSON.stringify(comments));
}

export function notifyCommentsUpdate(slug: string, commentId?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(COMMENTS_EVENT, {
      detail: { slug, commentId },
    })
  );
}

export function addComment(slug: string, comment: CommentEntry) {
  const comments = readComments(slug);
  const next = [...comments, comment];
  writeComments(slug, next);
  notifyCommentsUpdate(slug, comment.id);
  return comment;
}

export function toggleCommentLike(slug: string, commentId: string) {
  const comments = readComments(slug);
  const next = comments.map((comment) => {
    if (comment.id !== commentId) return comment;
    const likedNext = !comment.likedByMe;
    const likeDelta = likedNext ? 1 : -1;
    return {
      ...comment,
      likedByMe: likedNext,
      likes: Math.max(0, (comment.likes || 0) + likeDelta),
    };
  });
  writeComments(slug, next);
  notifyCommentsUpdate(slug, commentId);
  return next;
}

export function updateComment(slug: string, commentId: string, message: string) {
  const comments = readComments(slug);
  const updatedAt = new Date().toISOString();
  const next = comments.map((comment) =>
    comment.id === commentId
      ? {
          ...comment,
          message,
          updatedAt,
        }
      : comment
  );
  writeComments(slug, next);
  notifyCommentsUpdate(slug, commentId);
  return next;
}

export function deleteCommentThread(slug: string, commentId: string) {
  const comments = readComments(slug);
  const idsToDelete = new Set([commentId]);
  let found = true;

  while (found) {
    found = false;
    for (const comment of comments) {
      if (comment.parentId && idsToDelete.has(comment.parentId) && !idsToDelete.has(comment.id)) {
        idsToDelete.add(comment.id);
        found = true;
      }
    }
  }

  const next = comments.filter((comment) => !idsToDelete.has(comment.id));
  writeComments(slug, next);
  notifyCommentsUpdate(slug);
  return next;
}
