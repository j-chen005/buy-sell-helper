<script>
	import { goto } from '$app/navigation';
	import { fade, fly, scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import CTAButton from '$lib/CTAButton.svelte';
	
	let mounted = false;
	
	onMount(() => {
		mounted = true;
	});
	
	function goToBuying() {
		goto('/buying');
	}

	function goToSelling() {
		goto('/selling');
	}
</script>

<main>
	<div class="hero-section">
		<div class="container">
			{#if mounted}
				<div class="logo-container" in:fly={{ y: -30, duration: 800, delay: 200 }}>
					<div class="logo" in:scale={{ duration: 600, delay: 400 }}>
						<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect width="48" height="48" rx="12" fill="#3B82F6"/>
							<path d="M12 20L24 12L36 20V36H12V20Z" fill="white"/>
							<path d="M16 24L24 18L32 24V32H16V24Z" fill="#3B82F6"/>
							<circle cx="24" cy="26" r="2" fill="white"/>
						</svg>
					</div>
					<h1 class="title" in:fly={{ x: 30, duration: 800, delay: 600 }}>Market Aide</h1>
				</div>
			{/if}
			
			{#if mounted}
				<p class="tagline" in:fade={{ duration: 800, delay: 800 }}>
					Your intelligent companion for smarter buying and selling decisions
				</p>
			{/if}
			
			{#if mounted}
				<div class="features">
					<div class="feature" in:fly={{ y: 40, duration: 600, delay: 1200 }}>
						<div class="feature-icon">📊</div>
						<h3>Market Analysis</h3>
						<p>Get real-time insights and trends</p>
					</div>
					<div class="feature" in:fly={{ y: 40, duration: 600, delay: 1400 }}>
						<div class="feature-icon">🤖</div>
						<h3>AI-Powered</h3>
						<p>Advanced recommendations</p>
					</div>
					<div class="feature" in:fly={{ y: 40, duration: 600, delay: 1600 }}>
						<div class="feature-icon">⚡</div>
						<h3>Instant Results</h3>
						<p>Quick and accurate guidance</p>
					</div>
				</div>
			{/if}

			{#if mounted}
				<div class="cta-section" in:scale={{ duration: 600, delay: 1800 }}>
					<div class="cta-buttons">
						<CTAButton variant="buying" onClick={goToBuying}>
							Smart Buying
						</CTAButton>
						<CTAButton variant="selling" onClick={goToSelling}>
							Smart Selling
						</CTAButton>
					</div>
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	* {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	main {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-section {
		width: 100%;
		padding: 2rem 1rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		text-align: center;
		color: white;
	}

	.logo-container {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.title {
		font-size: 3.5rem;
		font-weight: 700;
		margin: 0;
		background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: -0.025em;
	}

	.tagline {
		font-size: 1.25rem;
		font-weight: 400;
		margin: 0 0 4rem 0;
		opacity: 0.9;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.6;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin: 4rem 0;
	}

	.feature {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		padding: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.feature:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
	}

	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.feature h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
	}

	.feature p {
		font-size: 0.95rem;
		margin: 0;
		opacity: 0.8;
		line-height: 1.5;
	}

	.cta-section {
		margin-top: 4rem;
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	@media (max-width: 768px) {
		.title {
			font-size: 2.5rem;
		}
		
		.tagline {
			font-size: 1.1rem;
		}
		
		.features {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		
		.feature {
			padding: 1.5rem;
		}
		
		.cta-buttons {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
