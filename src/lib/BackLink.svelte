<script lang="ts">
	export let href = '/';
</script>

<a {href} class="back-link">
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M15 10H5M5 10L10 5M5 10L10 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
	</svg>
	<slot>Back to Home</slot>
</a>

<style>
	.back-link {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		color: white;
		text-decoration: none;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		opacity: 0.9;
		transition: opacity 0.2s ease;
	}

	.back-link:hover {
		opacity: 1;
	}

	@media (max-width: 768px) {
		.back-link {
			position: static;
			transform: none;
			justify-content: center;
			margin-bottom: 1rem;
		}
	}
</style>
