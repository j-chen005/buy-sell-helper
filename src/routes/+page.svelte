<script>
	import { goto } from '$app/navigation';
	
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
			<div class="logo-container">
				<div class="logo">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect width="48" height="48" rx="12" fill="#3B82F6"/>
						<path d="M12 20L24 12L36 20V36H12V20Z" fill="white"/>
						<path d="M16 24L24 18L32 24V32H16V24Z" fill="#3B82F6"/>
						<circle cx="24" cy="26" r="2" fill="white"/>
					</svg>
				</div>
				<h1 class="title">Market Aide</h1>
			</div>
			
			<p class="tagline">
				Your intelligent companion for smarter buying and selling decisions
			</p>
			
			<div class="features">
				<div class="feature">
					<div class="feature-icon">📊</div>
					<h3>Market Analysis</h3>
					<p>Get real-time insights and trends</p>
				</div>
				<div class="feature">
					<div class="feature-icon">🤖</div>
					<h3>AI-Powered</h3>
					<p>Advanced recommendations</p>
				</div>
				<div class="feature">
					<div class="feature-icon">⚡</div>
					<h3>Instant Results</h3>
					<p>Quick and accurate guidance</p>
				</div>
			</div>

			<div class="cta-section">
				<div class="cta-buttons">
					<button on:click={goToBuying} class="cta-button buying">
						<span>Smart Buying</span>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
					<button on:click={goToSelling} class="cta-button selling">
						<span>Smart Selling</span>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</div>
			</div>
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

	.cta-button {
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 12px;
		cursor: pointer;
		font-size: 1.1rem;
		font-weight: 600;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 160px;
		justify-content: center;
	}

	.cta-button.buying {
		background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
		box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
	}

	.cta-button.buying:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
		background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
	}

	.cta-button.selling {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
	}

	.cta-button.selling:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
		background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
	}

	.cta-button:active {
		transform: translateY(0);
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
		
		.cta-button {
			width: 100%;
			max-width: 280px;
		}
	}
</style>
