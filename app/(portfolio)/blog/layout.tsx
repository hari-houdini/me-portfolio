/**
 * app/(portfolio)/blog/layout.tsx
 *
 * Blog section layout. Provides a skip link to main content and a
 * breadcrumb navigation back to the home page.
 */

import styles from "./blog.module.css";

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<a href="#main-content" className={styles.skipLink}>
				Skip to content
			</a>
			<nav aria-label="Breadcrumb" className={styles.breadcrumb}>
				<ol className={styles.breadcrumbList}>
					<li>
						<a href="/">Home</a>
					</li>
					<li aria-hidden="true" className={styles.separator}>
						/
					</li>
					<li>
						<a href="/blog" aria-current="page">
							Blog
						</a>
					</li>
				</ol>
			</nav>
			{children}
		</>
	);
}
