import { renderToStaticMarkup } from "react-dom/server";
import { Router, Route } from "wouter";
import rehypeRaw from "rehype-raw";
import BlogPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import { fromRow } from "@/lib/blog-store";

type BlogSeed = {
  list: Record<string, unknown>[];
  post?: Record<string, unknown>;
};

// The same components and content pipeline as the browser, with no CMS calls
// during rendering. Only published rows from prerender-blog enter this bundle.
export function renderBlogShell(seed: BlogSeed): string {
  const posts = seed.list.map(fromRow);
  const post = seed.post ? fromRow(seed.post) : undefined;
  return renderToStaticMarkup(
    <Router ssrPath={post ? `/blog/${post.slug}` : "/blog"}>
      {post ? (
        <Route path="/blog/:slug">
          <BlogPostPage initialPost={post} initialPosts={posts} initialRehypeRaw={rehypeRaw} />
        </Route>
      ) : <BlogPage initialPosts={posts} />}
    </Router>,
  );
}
