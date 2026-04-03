/**
 * lexical-renderer.component.tsx
 *
 * Async React Server Component that traverses a Lexical rich-text AST and
 * renders each node to semantic HTML.
 *
 * Used for blog post bodies — where code blocks need Shiki processing (async).
 * The About section continues to use @payloadcms/richtext-lexical/react RichText
 * (synchronous) since it does not contain code blocks.
 *
 * Supported node types:
 *  paragraph, heading (h2–h4), bold, italic, underline, strikethrough,
 *  link, blockquote, list (ordered + unordered), listitem,
 *  code (inline), code-block (→ ShikiCodeBlock), horizontalrule, image.
 *
 * Unknown node types fall back to rendering their children recursively.
 */

import Image from "next/image";
import type { MediaObject } from "../cms/cms.schema";
import styles from "./lexical-renderer.module.css";
import { ShikiCodeBlock } from "./shiki-code-block.component";

// Lexical serialised node shape (minimal — only the fields we use)
interface LexicalNode {
	type: string;
	version?: number;
	text?: string;
	format?: number | string;
	url?: string;
	tag?: string;
	listType?: "bullet" | "number" | "check";
	language?: string;
	value?: MediaObject;
	altText?: string;
	children?: LexicalNode[];
	[k: string]: unknown;
}

// Lexical text format bitmask constants
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_UNDERLINE = 8;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_CODE = 16;

function isFormatSet(
	format: number | string | undefined,
	flag: number,
): boolean {
	if (typeof format === "number") return (format & flag) !== 0;
	return false;
}

// ---------------------------------------------------------------------------
// Individual node renderers
// ---------------------------------------------------------------------------

async function RenderNodes({
	nodes,
}: {
	nodes: LexicalNode[];
}): Promise<React.ReactElement> {
	const elements: React.ReactNode[] = [];
	for (let i = 0; i < nodes.length; i++) {
		elements.push(await RenderNode({ node: nodes[i], key: i }));
	}
	return <>{elements}</>;
}

async function RenderNode({
	node,
	key,
}: {
	node: LexicalNode;
	key: number;
}): Promise<React.ReactNode> {
	switch (node.type) {
		case "text": {
			let content: React.ReactNode = node.text ?? "";
			const fmt = node.format;
			if (isFormatSet(fmt, FORMAT_CODE)) {
				content = <code className={styles.inlineCode}>{content}</code>;
			}
			if (isFormatSet(fmt, FORMAT_BOLD)) {
				content = <strong>{content}</strong>;
			}
			if (isFormatSet(fmt, FORMAT_ITALIC)) {
				content = <em>{content}</em>;
			}
			if (isFormatSet(fmt, FORMAT_UNDERLINE)) {
				content = <u>{content}</u>;
			}
			if (isFormatSet(fmt, FORMAT_STRIKETHROUGH)) {
				content = <s>{content}</s>;
			}
			return <span key={key}>{content}</span>;
		}

		case "paragraph":
			return (
				<p key={key} className={styles.paragraph}>
					{node.children ? await RenderNodes({ nodes: node.children }) : null}
				</p>
			);

		case "heading": {
			const tag = (node.tag ?? "h2") as "h2" | "h3" | "h4";
			const Tag = tag;
			return (
				<Tag key={key} className={styles.heading}>
					{node.children ? await RenderNodes({ nodes: node.children }) : null}
				</Tag>
			);
		}

		case "quote":
		case "blockquote":
			return (
				<blockquote key={key} className={styles.blockquote}>
					{node.children ? await RenderNodes({ nodes: node.children }) : null}
				</blockquote>
			);

		case "list": {
			const Tag = node.listType === "number" ? "ol" : "ul";
			return (
				<Tag key={key} className={styles.list}>
					{node.children ? await RenderNodes({ nodes: node.children }) : null}
				</Tag>
			);
		}

		case "listitem":
			return (
				<li key={key} className={styles.listItem}>
					{node.children ? await RenderNodes({ nodes: node.children }) : null}
				</li>
			);

		case "link": {
			const href = typeof node.url === "string" ? node.url : "#";
			const isExternal = href.startsWith("http");
			return (
				<a
					key={key}
					href={href}
					{...(isExternal
						? { rel: "noopener noreferrer", target: "_blank" }
						: {})}
				>
					{node.children ? await RenderNodes({ nodes: node.children }) : null}
				</a>
			);
		}

		case "code": {
			// Inline code — plain <code> with styling
			return (
				<code key={key} className={styles.inlineCode}>
					{node.text ?? ""}
				</code>
			);
		}

		case "code-block":
		case "codeBlock": {
			const code = typeof node.text === "string" ? node.text : "";
			const lang =
				typeof node.language === "string" ? node.language : undefined;
			return <ShikiCodeBlock key={key} code={code} language={lang} />;
		}

		case "horizontalrule":
		case "horizontalRule":
			return <hr key={key} className={styles.rule} />;

		case "image": {
			const src =
				typeof node.url === "string"
					? node.url
					: typeof node.value?.url === "string"
						? node.value.url
						: null;
			const alt =
				typeof node.altText === "string"
					? node.altText
					: typeof node.value?.alt === "string"
						? node.value.alt
						: "";
			if (!src) return null;
			const w = node.value?.width ?? 800;
			const h = node.value?.height ?? 450;
			return (
				<figure key={key} className={styles.figure}>
					<Image
						src={src}
						alt={alt ?? ""}
						width={typeof w === "number" ? w : 800}
						height={typeof h === "number" ? h : 450}
						className={styles.image}
					/>
					{alt ? (
						<figcaption className={styles.caption}>{alt}</figcaption>
					) : null}
				</figure>
			);
		}

		default:
			// Unknown node — render children if any, otherwise nothing
			return node.children ? (
				<span key={key}>{await RenderNodes({ nodes: node.children })}</span>
			) : null;
	}
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface LexicalRendererProps {
	content: {
		root: {
			children: unknown[];
			[k: string]: unknown;
		};
		[k: string]: unknown;
	};
}

export async function LexicalRenderer({ content }: LexicalRendererProps) {
	const nodes = content.root.children as LexicalNode[];
	return <div className={styles.prose}>{await RenderNodes({ nodes })}</div>;
}
