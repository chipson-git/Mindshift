import { PageTitle, Paywall } from "@/components/Paywall";
import { createPostAction } from "@/lib/actions";
import { requireSessionPage } from "@/lib/page";
import { hasFeature } from "@/lib/plans";

export default async function CommunityPage({ params }: PageProps<"/[locale]/app/community">) {
  const { locale, t, session, backend } = await requireSessionPage(params);
  const c = t.community;
  const title = <PageTitle title={c.title} subtitle={c.subtitle} />;

  if (!hasFeature(session.subscription.tier, "community")) {
    return (
      <>
        {title}
        <Paywall locale={locale} t={t} feature="community" />
      </>
    );
  }

  const posts = await backend.listPosts();
  const dateFormat = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      {title}
      <form action={createPostAction} className="card space-y-3">
        <input type="hidden" name="locale" value={locale} />
        <label htmlFor="post-body" className="sr-only">{c.placeholder}</label>
        <textarea id="post-body" name="body" required maxLength={1000} rows={3} placeholder={c.placeholder} className="input resize-y" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">{c.guidelines}</p>
          <button type="submit" className="btn-primary">{c.post}</button>
        </div>
      </form>

      <ul className="mt-6 space-y-3">
        {posts.length === 0 && <li className="text-center text-sm text-muted">{c.empty}</li>}
        {posts.map((post) => (
          <li key={post.id} className="card">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-lavender-soft text-sm font-semibold text-lavender" aria-hidden="true">
                {post.authorName.slice(0, 1).toUpperCase() || "?"}
              </span>
              <div>
                <p className="text-sm font-medium">{post.authorName}</p>
                <time dateTime={post.createdAt} className="text-xs text-muted">
                  {dateFormat.format(new Date(post.createdAt))}
                </time>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{post.body}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
