"use client";

export default function ErrorPage({
	error,
	reset,
}: {
	error: globalThis.Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main>
			<h1>Something went wrong</h1>
			<p>{error.message}</p>
			<button type="button" onClick={reset}>
				Try again
			</button>
		</main>
	);
}
