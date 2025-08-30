<script>
	import { onMount } from 'svelte';
	
	let products = [];
	let aiRecommendations = null;
	let loading = false;
	let aiLoading = false;
	let error = null;
	let searchQuery = '';

	async function fetchProducts(query = '') {
		loading = true;
		error = null;
		aiRecommendations = null;
		
		try {
			// Use the provided query or default to a sample search
			const searchTerm = query || 'Nike shoes';
			const encodedQuery = encodeURIComponent(searchTerm);
			const response = await fetch(`/api/rapidApi?q=${encodedQuery}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			products = result.filtered_products;
			
			// Call OpenAI API with the parsed products
			await getAIRecommendations(products);
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function getAIRecommendations(productList) {
		aiLoading = true;
		try {
			const response = await fetch('/api/openAI/buy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ productList })
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const result = await response.json();
			aiRecommendations = result.response;
		} catch (err) {
			console.error('AI recommendation error:', err);
			// Don't set error here as it's not critical for the main functionality
		} finally {
			aiLoading = false;
		}
	}

	function handleSearch() {
		if (searchQuery.trim()) {
			fetchProducts(searchQuery.trim());
		}
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}
    
</script>

<svelte:head>
	<title>Buying - Market Aide</title>
</svelte:head>

<main>
	<div class="container">
		<header class="header">
			<a href="/" class="back-link">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M15 10H5M5 10L10 5M5 10L10 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				Back to Home
			</a>
			<h1>Market Aide</h1>
			<p class="subtitle">Smart Buying Decisions</p>
		</header>

		<div class="content">
			<div class="search-section">
				<div class="search-container">
					<input 
						type="text" 
						bind:value={searchQuery}
						on:keypress={handleKeyPress}
						placeholder="Search for products (e.g., Nike shoes, iPhone, laptop...)"
						class="search-input"
						disabled={loading}
					/>
					<button 
						on:click={handleSearch} 
						disabled={loading || !searchQuery.trim()} 
						class="search-button"
					>
						{loading ? 'Searching...' : 'Search'}
					</button>
				</div>
			</div>

			{#if loading}
				<div class="loading">
					<div class="loading-spinner"></div>
					<p>Loading products...</p>
				</div>
			{:else if error}
				<div class="error">
					<p>Error: {error}</p>
				</div>
			{:else if products.length > 0}
				<!-- AI Recommendations Section -->
				{#if aiLoading}
					<div class="ai-loading">
						<div class="loading-spinner"></div>
						<p>🤖 Getting AI recommendations...</p>
					</div>
				{:else if aiRecommendations}
					<div class="ai-recommendations">
						<h2>🤖 AI Buying Recommendations</h2>
						<div class="recommendations-content">{@html aiRecommendations}</div>
					</div>
				{/if}

				<!-- Products Section -->
				<div class="products-section">
					<h2>📦 Available Products</h2>
					<div class="products">
						{#each products as product}
							<div class="product-card">
								<h3>{product.product_title}</h3>
								<p class="description">{product.product_description}</p>
								<p class="store">Store: {product.store_name}</p>
								<p class="price">Price: ${product.price}</p>
								{#if product.offer_url}
									<a href={product.offer_url} target="_blank" rel="noopener noreferrer" class="buy-button">
										Buy Now
									</a>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="no-products">
					<p>No products available. Use the search bar above to find products.</p>
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
		padding: 2rem 1rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
		position: relative;
		color: white;
	}

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

	h1 {
		font-size: 2.5rem;
		color: white;
		margin: 0;
		font-weight: 700;
		background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.8);
		margin: 0.5rem 0 0 0;
		font-weight: 400;
	}

	.content {
		text-align: center;
	}

	.search-section {
		margin-bottom: 2rem;
	}

	.search-container {
		display: flex;
		gap: 0.5rem;
		max-width: 600px;
		margin: 0 auto 2rem;
	}

	.search-input {
		flex-grow: 1;
		padding: 1rem 1.5rem;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		outline: none;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}

	.search-input:focus {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.4);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
	}

	.search-button {
		background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 12px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
	}

	.search-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
		background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
	}

	.search-button:disabled {
		background: rgba(255, 255, 255, 0.2);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.loading, .error, .no-products, .ai-loading {
		padding: 2rem;
		border-radius: 16px;
		margin: 2rem 0;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top: 3px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.4);
	}

	.no-products {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.ai-loading {
		background: rgba(59, 130, 246, 0.2);
		border-color: rgba(59, 130, 246, 0.4);
		font-weight: 500;
	}

	.ai-recommendations {
		background: rgba(34, 197, 94, 0.2);
		border: 2px solid rgba(34, 197, 94, 0.4);
		border-radius: 16px;
		padding: 2rem;
		margin: 2rem 0;
		backdrop-filter: blur(10px);
	}

	.ai-recommendations h2 {
		color: white;
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.recommendations-content {
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.6;
		text-align: left;
	}

	.recommendations-content a {
		color: #22c55e;
		text-decoration: none;
		font-weight: 500;
	}

	.recommendations-content a:hover {
		text-decoration: underline;
	}

	.products-section {
		margin: 2rem 0;
	}

	.products-section h2 {
		color: white;
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.products {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.product-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 1.5rem;
		border-radius: 16px;
		text-align: left;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		color: white;
	}

	.product-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		background: rgba(255, 255, 255, 0.15);
	}

	.product-card h3 {
		margin: 0 0 0.5rem 0;
		color: white;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.description {
		color: rgba(255, 255, 255, 0.8);
		margin: 0.5rem 0;
		line-height: 1.5;
	}

	.store {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9rem;
		margin: 0.5rem 0;
		font-weight: 500;
	}

	.price {
		font-weight: 600;
		color: #22c55e;
		font-size: 1.1rem;
		margin: 1rem 0;
	}

	.buy-button {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		width: 100%;
		transition: all 0.3s ease;
		text-decoration: none;
		display: inline-block;
		text-align: center;
		box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
	}

	.buy-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
		background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
	}

	@media (max-width: 768px) {
		.header {
			margin-bottom: 2rem;
		}

		h1 {
			font-size: 2rem;
		}

		.back-link {
			position: static;
			transform: none;
			justify-content: center;
			margin-bottom: 1rem;
		}

		.search-container {
			flex-direction: column;
		}

		.products {
			grid-template-columns: 1fr;
		}

		.product-card {
			padding: 1rem;
		}
	}
</style>
