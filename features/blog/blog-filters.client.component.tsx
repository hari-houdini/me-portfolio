"use client";

/**
 * blog-filters.client.component.tsx
 *
 * Client Component. Renders the search input, sort selector, and tag filter
 * chips for the blog list page.
 *
 * Updates the URL via useRouter (replaceState) so each filter combination
 * produces a unique, crawlable URL. A Suspense boundary is required at the
 * usage site because this component calls useSearchParams().
 *
 * Debounces the search input (300 ms) to avoid firing a navigation on every
 * keystroke.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TagData } from "../cms/cms.schema";
import styles from "./blog-filters.module.css";

interface BlogFiltersProps {
	tags: TagData[];
	initialSearch?: string;
	initialTagSlug?: string;
	initialSort?: string;
}

export function BlogFilters({
	tags,
	initialSearch = "",
	initialTagSlug = "",
	initialSort = "newest",
}: BlogFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [searchValue, setSearchValue] = useState(initialSearch);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const activeTag = searchParams.get("tag") ?? initialTagSlug;
	const activeSort = searchParams.get("sort") ?? initialSort;
	const hasActiveFilter = Boolean(
		searchParams.get("search")?.trim() || activeTag || activeSort !== "newest",
	);

	const pushUrl = useCallback(
		(overrides: Record<string, string | undefined>) => {
			const params = new URLSearchParams(searchParams.toString());
			for (const [key, val] of Object.entries(overrides)) {
				if (val) {
					params.set(key, val);
				} else {
					params.delete(key);
				}
			}
			// Reset to page 1 when any filter changes
			params.delete("page");
			router.replace(`/blog?${params.toString()}`);
		},
		[router, searchParams],
	);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setSearchValue(val);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			pushUrl({ search: val || undefined });
		}, 300);
	};

	const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		pushUrl({ sort: e.target.value === "newest" ? undefined : e.target.value });
	};

	const handleTagClick = (slug: string) => {
		pushUrl({ tag: activeTag === slug ? undefined : slug });
	};

	// Keep local search in sync when the URL changes externally (e.g. back button)
	useEffect(() => {
		setSearchValue(searchParams.get("search") ?? "");
	}, [searchParams]);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

	return (
		<div className={styles.filters}>
			<form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
				<label htmlFor="blog-search" className={styles.srOnly}>
					Search posts
				</label>
				<input
					id="blog-search"
					type="search"
					name="search"
					placeholder="Search posts…"
					value={searchValue}
					onChange={handleSearchChange}
					className={styles.searchInput}
					aria-label="Search blog posts"
					autoComplete="off"
				/>
			</form>

			<div className={styles.controls}>
				<div className={styles.sortGroup}>
					<label htmlFor="blog-sort" className={styles.controlLabel}>
						Sort
					</label>
					<select
						id="blog-sort"
						value={activeSort}
						onChange={handleSortChange}
						className={styles.select}
						aria-label="Sort posts"
					>
						<option value="newest">Newest first</option>
						<option value="oldest">Oldest first</option>
					</select>
				</div>

				{hasActiveFilter ? (
					<a
						href="/blog"
						className={styles.clearButton}
						aria-label="Clear all filters"
					>
						Clear filters
					</a>
				) : null}
			</div>

			{tags.length > 0 ? (
				<div className={styles.tagGroup}>
					<span className={styles.controlLabel} id="tag-filter-label">
						Filter by tag
					</span>
					<ul className={styles.tagList} aria-labelledby="tag-filter-label">
						{tags.map((tag) => {
							const isActive = activeTag === tag.slug;
							return (
								<li key={tag.slug}>
									<button
										type="button"
										onClick={() => handleTagClick(tag.slug)}
										className={isActive ? styles.tagActive : styles.tag}
										aria-pressed={isActive}
									>
										{tag.label}
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			) : null}
		</div>
	);
}
