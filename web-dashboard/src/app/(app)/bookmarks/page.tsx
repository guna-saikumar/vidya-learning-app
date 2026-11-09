import { Bookmark } from "lucide-react";
import { getBookmarksPageData } from "@/lib/data";
import { PageIntro } from "@/components/ui/PageIntro";
import { BookmarksList } from "@/components/BookmarksList";

export const instant = false;

export default async function BookmarksPage() {
  const { bookmarks } = await getBookmarksPageData();

  return (
    <div className="space-y-4">
      <PageIntro
        eyebrow="Study vault"
        badge={`${bookmarks.length} Saved`}
        title="Saved Bookmarks"
        description="Your saved chapters, sections and formula notes — all in one place."
        action={
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-[11px] font-extrabold text-primary-dark">
            <Bookmark size={14} /> {bookmarks.length} items
          </span>
        }
      />
      <BookmarksList bookmarks={bookmarks} />
    </div>
  );
}
