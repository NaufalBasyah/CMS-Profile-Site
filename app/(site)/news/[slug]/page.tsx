import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container, Cta, PageFallback, TextLink } from "@/components/site/blocks";
import { getNewsPost } from "@/lib/content";
import { longDate, paragraphs } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  await connection();
  const post = await getNewsPost((await params).slug);
  return post ? { title: post.title, description: post.summary } : { title: "News" };
}

export default function NewsPostPage({ params }: PageProps<"/news/[slug]">) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: { params: PageProps<"/news/[slug]">["params"] }) {
  await connection();
  const post = await getNewsPost((await params).slug);
  if (!post) notFound();
  return (
    <>
      <section className="border-b bg-mist">
        <Container className="py-14 sm:py-20">
          <TextLink href="/news" className="text-sm">Back to all news</TextLink>
          <h1 className="mt-4 max-w-4xl text-4xl sm:text-6xl">{post.title}</h1>
          <p className="mt-4 text-muted-foreground">
            Published <time dateTime={post.publishedOn}>{longDate(post.publishedOn)}</time> in{" "}
            <span className="font-semibold text-palm">{post.category}</span>
          </p>
          <p className="mt-5 max-w-3xl text-lg sm:text-xl">{post.summary}</p>
        </Container>
      </section>
      <Container className="py-14">
        <article className="max-w-[68ch] space-y-5 text-lg leading-relaxed">
          {post.imageUrl && (
            <Image src={post.imageUrl} alt="" width={1200} height={675} unoptimized className="h-auto w-full rounded-lg border" />
          )}
          {paragraphs(post.body).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      </Container>
      <Cta />
    </>
  );
}
