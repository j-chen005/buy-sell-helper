<script lang="ts">
	import { onMount } from 'svelte';
	import BackLink from '$lib/BackLink.svelte';
	import SearchButton from '$lib/SearchButton.svelte';
	import ActionButton from '$lib/ActionButton.svelte';
	
	interface Product {
		product_title: string;
		product_description: string;
		product_photos?: string[];
		store_name: string;
		price: number;
		offer_url?: string;
	}
	
	let products: Product[] = [];
	let sellingRecommendations: string | null = null;
	let productDescription: string | null = null;
	let loading = false;
	let aiLoading = false;
	let descriptionLoading = false;
	let error: string | null = null;
	let searchQuery = '';

	async function fetchProducts(query = '') {
		loading = true;
		error = null;
		sellingRecommendations = null;
		productDescription = null;
		
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
			
			// Debug: Log the products received
			console.log('Products received from API:', products.map((p: Product, i: number) => ({
				index: i,
				title: p.product_title,
				price: p.price,
				store: p.store_name
			})));
			
			// Set loading to false immediately after products are loaded
			loading = false;
			
			// Call OpenAI API with the parsed products in the background
			getSellingRecommendations(products);
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
			loading = false;
		}
	}

	async function getSellingRecommendations(productList: Product[]) {
		aiLoading = true;
		try {
			const response = await fetch('/api/openAI/sell', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					productList,
					type: 'vision'
				})
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const result = await response.json();
			
			// Debug: Log the AI recommendation
			console.log('AI Selling Recommendation received:', {
				response: result.response,
				type: result.type
			});
			
			sellingRecommendations = result.response;
		} catch (err) {
			console.error('AI recommendation error:', err);
			// Don't set error here as it's not critical for the main functionality
		} finally {
			aiLoading = false;
		}
	}

	async function getProductDescription() {
		if (!products.length) return;
		
		descriptionLoading = true;
		try {
			// Create a simple attribute list from the first few products
			const attributeList = products.slice(0, 3).map(p => ({
				title: p.product_title,
				description: p.product_description,
				price: p.price,
				store: p.store_name
			}));

			const response = await fetch('/api/openAI/sell', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					productList: products,
					attributeList,
					type: 'description'
				})
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const result = await response.json();
			productDescription = result.response;
		} catch (err) {
			console.error('Product description error:', err);
		} finally {
			descriptionLoading = false;
		}
	}

	function handleSearch() {
		if (searchQuery.trim()) {
			fetchProducts(searchQuery.trim());
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function handleImageError(event: Event) {
		const target = event.target as HTMLImageElement;
		if (target) {
			target.style.display = 'none';
		}
	}

	function formatRecommendations(text: string): string {
		// Convert markdown-style formatting to HTML
		return text
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/\n/g, '<br>')
			.replace(/\$(\d+\.?\d*)/g, '<span class="price-highlight">$$$1</span>');
	}
    
</script>

<svelte:head>
	<title>Selling - Market Aide</title>
</svelte:head>

<main>
	<div class="container">
		<header class="header">
			<BackLink />
			<h1>Market Aide</h1>
			<p class="subtitle">Smart Selling Decisions</p>
		</header>

		<div class="content">
			<div class="search-section">
				<div class="search-container">
					<input 
						type="text" 
						bind:value={searchQuery}
						on:keypress={handleKeyPress}
						placeholder="Search for products to analyze selling opportunities (e.g., Nike shoes, binders, Muji pens)"
						class="search-input"
						disabled={loading}
					/>
					<SearchButton 
						onClick={handleSearch} 
						disabled={loading || !searchQuery.trim()}
						loading={loading}
					/>
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
						<p>Analyzing selling opportunities...</p>
					</div>
				{:else if sellingRecommendations}
					<div class="ai-analysis">
						<h2>AI Selling Analysis</h2>
						
						<!-- Selling Recommendations -->
						<div class="analysis-section">
							<h3>Selling Recommendations</h3>
							<div class="recommendations-content">
								{@html formatRecommendations(sellingRecommendations)}
							</div>
						</div>

						<!-- Product Description Section -->
						<div class="description-section">
							<div class="description-header">
								<h3>Product Description</h3>
								{#if !productDescription && !descriptionLoading}
									<ActionButton variant="generate" size="small" onClick={getProductDescription}>
										Generate Description
									</ActionButton>
								{/if}
							</div>
							
							{#if descriptionLoading}
								<div class="description-loading">
									<div class="loading-spinner"></div>
									<p>Generating product description...</p>
								</div>
							{:else if productDescription}
								<div class="description-content">
									<p>{productDescription}</p>
								</div>
							{:else}
								<div class="description-placeholder">
									<p>Click "Generate Description" to create a compelling product description for your listing.</p>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Products Section -->
				<div class="products-section">
					<h2>Market Analysis Products</h2>
					<div class="products">
						{#each products as product}
							<div class="product-card">
								<div class="product-image">
									{#if product.product_photos && product.product_photos.length > 0}
										<img 
											src={product.product_photos[0]} 
											alt={product.product_title}
											on:error={handleImageError}
										/>
									{:else}
										<div class="no-image-placeholder">
											<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM15 15V13.5C15 12.7 14.3 12 13.5 12C14.3 12 15 11.3 15 10.5V9C15 7.9 14.1 7 13 7H9V9H13V11H11V13H13V15H9V17H13C14.1 17 15 16.1 15 15Z" fill="rgba(255,255,255,0.3)"/>
											</svg>
										</div>
									{/if}
								</div>
								<div class="product-content">
									<div class="product-info">
										<h3 class="product-title">{product.product_title}</h3>
										<p class="description">
											{product.product_description.length > 100 
												? product.product_description.substring(0, 100) + '...' 
												: product.product_description}
										</p>
										<p class="store">Store: {product.store_name}</p>
										<p class="price">Price: {product.price}</p>
									</div>
									{#if product.offer_url}
										<ActionButton variant="view" size="medium" href={product.offer_url}>
											View Product
										</ActionButton>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="no-products">
					<p>No products available. Use the search bar above to find products for selling analysis.</p>
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

	.ai-analysis {
		background: rgba(34, 197, 94, 0.2);
		border: 2px solid rgba(34, 197, 94, 0.4);
		border-radius: 16px;
		padding: 2rem;
		margin: 2rem 0;
		backdrop-filter: blur(10px);
	}

	.ai-analysis h2 {
		color: white;
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.analysis-section {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
	}

	.analysis-section h3 {
		color: white;
		margin: 0 0 1rem 0;
		font-size: 1.3rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.analysis-section h3::before {
		content: '';
		width: 4px;
		height: 20px;
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		border-radius: 2px;
	}

	.recommendations-content, .description-content {
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.7;
		text-align: left;
		font-size: 1rem;
	}

	.recommendations-content p, .description-content p {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
	}

	.recommendations-content p:last-child, .description-content p:last-child {
		margin-bottom: 0;
	}

	.recommendations-content strong, .description-content strong {
		color: #22c55e;
		font-weight: 700;
	}

	.recommendations-content em, .description-content em {
		font-style: italic;
		color: rgba(255, 255, 255, 0.8);
	}

	.recommendations-content span.price-highlight {
		color: #22c55e;
		font-weight: 700;
		background: rgba(34, 197, 94, 0.1);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		border: 1px solid rgba(34, 197, 94, 0.3);
	}

	.recommendations-content ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.recommendations-content li {
		margin-bottom: 0.5rem;
	}

	.recommendations-content li:last-child {
		margin-bottom: 0;
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
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		height: 200px; /* Fixed height for consistent card sizes */
		overflow: hidden;
	}

	.product-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		background: rgba(255, 255, 255, 0.15);
	}

	.product-image {
		flex-shrink: 0;
		width: 120px;
		height: 120px;
		overflow: hidden;
		border-radius: 12px;
		background-color: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.product-image img:hover {
		transform: scale(1.05);
	}

	.no-image-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px dashed rgba(255, 255, 255, 0.2);
	}

	.product-content {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-between;
		min-width: 0; /* Allow content to shrink */
	}

	.product-info {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.product-title {
		margin: 0;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-wrap: break-word;
	}

	.description {
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		line-height: 1.4;
		font-size: 0.8rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-wrap: break-word;
	}

	.store {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.8rem;
		font-weight: 500;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.price {
		font-weight: 600;
		color: #22c55e;
		font-size: 0.9rem;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}



	.description-section {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1.5rem;
		margin-top: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
	}

	.description-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.description-header h3 {
		margin: 0;
		color: white;
		font-size: 1.3rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.description-header h3::before {
		content: '';
		width: 4px;
		height: 20px;
		background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
		border-radius: 2px;
	}

	.description-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.9rem;
	}

	.description-placeholder {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9rem;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.header {
			margin-bottom: 2rem;
		}

		h1 {
			font-size: 2rem;
		}


		.search-container {
			flex-direction: column;
		}

		.ai-analysis {
			padding: 1.5rem;
		}

		.analysis-section {
			padding: 1rem;
		}

		.analysis-section h3 {
			font-size: 1.1rem;
		}

		.recommendations-content, .description-content {
			font-size: 0.9rem;
		}

		.products {
			grid-template-columns: 1fr;
		}

		.product-card {
			padding: 1rem;
			flex-direction: column;
			align-items: center;
			gap: 0.75rem;
			height: auto;
			min-height: 250px;
		}

		.product-image {
			width: 100%;
			height: 120px;
		}

		.product-content {
			width: 100%;
			height: auto;
		}

		.product-info {
			gap: 0.4rem;
		}

		.product-title {
			font-size: 0.95rem;
			-webkit-line-clamp: 2;
		}

		.description {
			font-size: 0.75rem;
			-webkit-line-clamp: 2;
		}

		.store, .price {
			font-size: 0.75rem;
		}


		.description-section {
			padding: 1rem;
		}

		.description-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.description-header h3 {
			font-size: 1.1rem;
		}

		.description-loading {
			font-size: 0.8rem;
		}

		.description-placeholder {
			font-size: 0.8rem;
		}
	}
</style>
