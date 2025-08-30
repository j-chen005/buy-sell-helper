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
	<title>Buying - Buy Sell Helper</title>
</svelte:head>

<main>
	<div class="container">
		<header class="header">
			<a href="/" class="back-link">← Back to Home</a>
			<h1>Buying Page</h1>
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

			<div class="api-section">
				<button on:click={() => fetchProducts()} disabled={loading} class="fetch-button">
					{loading ? 'Loading...' : 'Load Sample Products'}
				</button>
			</div>

			{#if loading}
				<div class="loading">
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
					<p>No products available. Click "Load Sample Products" to load some items.</p>
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
		position: relative;
	}

	.back-link {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		color: #646cff;
		text-decoration: none;
		font-weight: 500;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	h1 {
		font-size: 2.5rem;
		color: #213547;
		margin: 0;
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
		padding: 0.75rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 1rem;
		outline: none;
		transition: border-color 0.2s;
	}

	.search-input:focus {
		border-color: #646cff;
	}

	.search-button {
		background: #646cff;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.search-button:hover:not(:disabled) {
		background: #535bf2;
	}

	.search-button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.api-section {
		margin: 2rem 0;
	}

	.fetch-button {
		background: #646cff;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.fetch-button:hover:not(:disabled) {
		background: #535bf2;
	}

	.fetch-button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.loading, .error, .no-products, .ai-loading {
		padding: 2rem;
		border-radius: 8px;
		margin: 2rem 0;
	}

	.loading {
		background: #f0f9ff;
		color: #0369a1;
	}

	.error {
		background: #fef2f2;
		color: #dc2626;
	}

	.no-products {
		background: #f9fafb;
		color: #6b7280;
	}

	.ai-loading {
		background: #f0f9ff;
		color: #0369a1;
		font-weight: 500;
	}

	.ai-recommendations {
		background: #f0fdf4;
		border: 2px solid #22c55e;
		border-radius: 12px;
		padding: 2rem;
		margin: 2rem 0;
	}

	.ai-recommendations h2 {
		color: #15803d;
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
	}

	.recommendations-content {
		color: #166534;
		line-height: 1.6;
	}

	.recommendations-content a {
		color: #059669;
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
		color: #1f2937;
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
	}

	.products {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.product-card {
		border: 1px solid #e5e7eb;
		padding: 1.5rem;
		border-radius: 12px;
		text-align: left;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.product-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.product-card h3 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1.25rem;
	}

	.description {
		color: #6b7280;
		margin: 0.5rem 0;
		line-height: 1.5;
	}

	.store {
		color: #374151;
		font-size: 0.9rem;
		margin: 0.5rem 0;
		font-weight: 500;
	}

	.price {
		font-weight: 600;
		color: #059669;
		font-size: 1.1rem;
		margin: 1rem 0;
	}

	.buy-button {
		background: #059669;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		width: 100%;
		transition: background-color 0.2s;
	}

	.buy-button:hover {
		background: #047857;
	}
</style>
