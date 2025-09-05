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
	let imageAnalyzing = false;
	let dragActive = false;

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

	async function analyzeImage(imageFile: File) {
		imageAnalyzing = true;
		error = null;
		
		try {
			// Convert image to base64
			const base64 = await fileToBase64(imageFile);
			
			// Send to OpenAI for analysis
			const response = await fetch('/api/openAI/image-describe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ imageData: base64 })
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const result = await response.json();
			
			if (result.success && result.description) {
				// Use the description as search query
				searchQuery = result.description;
				// Automatically search with the description
				fetchProducts(result.description);
			} else {
				throw new Error(result.error || 'Failed to analyze image');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to analyze image';
		} finally {
			imageAnalyzing = false;
		}
	}

	function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = error => reject(error);
		});
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragActive = false;
		
		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				analyzeImage(file);
			} else {
				error = 'Please drop an image file';
			}
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragActive = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		dragActive = false;
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				analyzeImage(file);
			} else {
				error = 'Please select an image file';
			}
		}
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

			<!-- Image Upload Section -->
			<div class="image-section">
				<div class="section-divider">
					<span>OR</span>
				</div>
				
				<div 
					class="image-drop-zone {dragActive ? 'drag-active' : ''} {imageAnalyzing ? 'analyzing' : ''}"
					on:drop={handleDrop}
					on:dragover={handleDragOver}
					on:dragleave={handleDragLeave}
					role="button"
					tabindex="0"
				>
					{#if imageAnalyzing}
						<div class="analyzing-state">
							<div class="loading-spinner"></div>
							<h3>Analyzing image...</h3>
							<p>AI is describing your image to find similar products</p>
						</div>
					{:else}
						<div class="upload-content">
							<svg class="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M7 10L12 15L17 10M12 15V3M5 21H19C20.1046 21 21 20.1046 21 19V12C21 10.8954 20.1046 10 19 10H15L13 8H11L9 10H5C3.89543 10 3 10.8954 3 12V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<h3>Drop an image here</h3>
							<p>Or <label for="file-input" class="file-label">choose a file</label> to analyze</p>
							<p class="help-text">AI will describe your image in 10 words to search for similar products. </p>
							<p class="help-text">Make sure your image has one of the following formats: png, jpeg, gif, webp. </p>
						</div>
					{/if}
					
					<input
						id="file-input"
						type="file"
						accept="image/*"
						on:change={handleFileSelect}
						style="display: none;"
						disabled={imageAnalyzing || loading}
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
		background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
		background-size: 400% 400%;
		animation: gradientShift 15s ease infinite;
		padding: 2rem 1rem;
		position: relative;
	}

	main::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: 
			radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
		pointer-events: none;
		z-index: 0;
	}

	@keyframes gradientShift {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		position: relative;
		z-index: 1;
	}

	.header {
		text-align: center;
		margin-bottom: 4rem;
		position: relative;
		color: white;
		padding: 2rem 0;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 24px;
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	h1 {
		font-size: 3rem;
		color: white;
		margin: 0;
		font-weight: 800;
		background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		letter-spacing: -0.02em;
	}

	.subtitle {
		font-size: 1.2rem;
		color: rgba(255, 255, 255, 0.85);
		margin: 1rem 0 0 0;
		font-weight: 500;
		letter-spacing: 0.01em;
	}

	.content {
		text-align: center;
	}

	.search-section {
		margin-bottom: 3rem;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 20px;
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.search-container {
		display: flex;
		gap: 0.75rem;
		max-width: 700px;
		margin: 0 auto;
		position: relative;
	}

	.search-input {
		flex-grow: 1;
		padding: 1.2rem 1.75rem;
		border: none;
		border-radius: 16px;
		font-size: 1.05rem;
		outline: none;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(15px);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.15);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		font-weight: 500;
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.65);
		font-weight: 400;
	}

	.search-input:focus {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08), 0 8px 24px rgba(0, 0, 0, 0.15);
		transform: translateY(-1px);
	}

	.image-section {
		margin: 3rem 0;
	}

	.section-divider {
		display: flex;
		align-items: center;
		margin: 3rem 0 2rem;
		color: rgba(255, 255, 255, 0.7);
		font-weight: 600;
	}

	.section-divider::before,
	.section-divider::after {
		content: '';
		flex: 1;
		height: 2px;
		background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
	}

	.section-divider span {
		margin: 0 1.5rem;
		font-size: 1rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	.image-drop-zone {
		max-width: 700px;
		margin: 0 auto;
		padding: 4rem 2.5rem;
		border: 3px dashed rgba(255, 255, 255, 0.25);
		border-radius: 24px;
		background: rgba(255, 255, 255, 0.06);
		backdrop-filter: blur(20px);
		text-align: center;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		position: relative;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.image-drop-zone:hover {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.1);
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
	}

	.image-drop-zone.drag-active {
		border-color: #10b981;
		background: rgba(16, 185, 129, 0.15);
		transform: scale(1.02) translateY(-2px);
		box-shadow: 0 16px 48px rgba(16, 185, 129, 0.2);
	}

	.image-drop-zone.analyzing {
		border-color: #3b82f6;
		background: rgba(59, 130, 246, 0.15);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
	}

	.upload-content {
		color: white;
	}

	.upload-icon {
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 1.5rem;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
		transition: transform 0.3s ease;
	}

	.image-drop-zone:hover .upload-icon {
		transform: scale(1.05);
	}

	.image-drop-zone h3 {
		margin: 0 0 0.75rem 0;
		font-size: 1.4rem;
		font-weight: 700;
		color: white;
		letter-spacing: -0.01em;
	}

	.image-drop-zone p {
		margin: 0.75rem 0;
		color: rgba(255, 255, 255, 0.85);
		font-size: 1.05rem;
		font-weight: 500;
	}

	.help-text {
		font-size: 0.95rem !important;
		color: rgba(255, 255, 255, 0.65) !important;
		margin-top: 1.5rem !important;
		font-weight: 400 !important;
	}

	.file-label {
		color: #10b981;
		text-decoration: underline;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s ease;
		text-decoration-thickness: 2px;
		text-underline-offset: 2px;
	}

	.file-label:hover {
		color: #059669;
		text-decoration-color: #059669;
		transform: translateY(-1px);
	}

	.analyzing-state {
		color: white;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.analyzing-state h3 {
		margin: 0;
		font-size: 1.3rem;
		font-weight: 600;
	}

	.analyzing-state p {
		margin: 0;
		color: rgba(255, 255, 255, 0.8);
		font-size: 1rem;
	}


	.loading, .error, .no-products, .ai-loading {
		padding: 2.5rem;
		border-radius: 20px;
		margin: 3rem 0;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: white;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		transition: all 0.3s ease;
	}

	.loading:hover, .error:hover, .no-products:hover, .ai-loading:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
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
		background: rgba(16, 185, 129, 0.15);
		border: 2px solid rgba(16, 185, 129, 0.3);
		border-radius: 24px;
		padding: 3rem;
		margin: 3rem 0;
		backdrop-filter: blur(20px);
		box-shadow: 0 12px 48px rgba(16, 185, 129, 0.1);
		position: relative;
		overflow: hidden;
	}

	.ai-analysis::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #10b981, #059669, #047857);
	}

	.ai-analysis h2 {
		color: white;
		margin: 0 0 2rem 0;
		font-size: 1.8rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}


	.analysis-section {
		background: rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(15px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	.analysis-section:hover {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px);
	}

	.analysis-section h3 {
		color: white;
		margin: 0 0 1.5rem 0;
		font-size: 1.4rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		letter-spacing: -0.01em;
	}

	.analysis-section h3::before {
		content: '';
		width: 5px;
		height: 24px;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		border-radius: 3px;
		box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
	}

	.recommendations-content, .description-content {
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.8;
		text-align: left;
		font-size: 1.05rem;
		font-weight: 400;
	}

	.recommendations-content p, .description-content p {
		margin: 0 0 1rem 0;
		font-size: 1.05rem;
	}

	.recommendations-content p:last-child, .description-content p:last-child {
		margin-bottom: 0;
	}

	.recommendations-content strong, .description-content strong {
		color: #10b981;
		font-weight: 800;
		text-shadow: 0 1px 2px rgba(16, 185, 129, 0.3);
	}

	.recommendations-content em, .description-content em {
		font-style: italic;
		color: rgba(255, 255, 255, 0.85);
		font-weight: 500;
	}

	.recommendations-content span.price-highlight {
		color: #10b981;
		font-weight: 800;
		background: rgba(16, 185, 129, 0.15);
		padding: 0.3rem 0.6rem;
		border-radius: 8px;
		border: 1px solid rgba(16, 185, 129, 0.4);
		box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
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
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: 2rem;
		margin: 3rem 0;
	}

	.product-card {
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		padding: 2rem;
		border-radius: 20px;
		text-align: left;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		color: white;
		display: flex;
		align-items: flex-start;
		gap: 1.5rem;
		height: 220px;
		overflow: hidden;
		position: relative;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
	}

	.product-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6);
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.product-card:hover {
		transform: translateY(-6px) scale(1.02);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.25);
	}

	.product-card:hover::before {
		opacity: 1;
	}

	.product-image {
		flex-shrink: 0;
		width: 140px;
		height: 140px;
		overflow: hidden;
		border-radius: 16px;
		background-color: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	.product-image::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 16px;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.product-card:hover .product-image::after {
		opacity: 1;
	}

	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.product-image img:hover {
		transform: scale(1.08);
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
		font-size: 1.1rem;
		font-weight: 700;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-wrap: break-word;
		letter-spacing: -0.01em;
	}

	.description {
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		line-height: 1.5;
		font-size: 0.85rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-wrap: break-word;
		font-weight: 400;
	}

	.store {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.85rem;
		font-weight: 600;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.price {
		font-weight: 700;
		color: #10b981;
		font-size: 1rem;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		background: rgba(16, 185, 129, 0.1);
		padding: 0.25rem 0.5rem;
		border-radius: 8px;
		border: 1px solid rgba(16, 185, 129, 0.3);
		display: inline-block;
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
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.description-header h3 {
		margin: 0;
		color: white;
		font-size: 1.4rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		letter-spacing: -0.01em;
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
		main {
			padding: 1.5rem 1rem;
		}

		.header {
			margin-bottom: 3rem;
			padding: 1.5rem 0;
		}

		h1 {
			font-size: 2.2rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.search-section {
			padding: 1.5rem;
		}

		.search-container {
			flex-direction: column;
			max-width: 100%;
		}

		.search-input {
			padding: 1rem 1.5rem;
			font-size: 1rem;
		}

		.ai-analysis {
			padding: 2rem;
		}

		.ai-analysis h2 {
			font-size: 1.5rem;
		}

		.analysis-section {
			padding: 1.5rem;
		}

		.analysis-section h3 {
			font-size: 1.2rem;
		}

		.recommendations-content, .description-content {
			font-size: 0.95rem;
		}

		.products {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.product-card {
			padding: 1.5rem;
			flex-direction: column;
			align-items: center;
			gap: 1rem;
			height: auto;
			min-height: 280px;
		}

		.product-image {
			width: 100%;
			height: 140px;
		}

		.product-content {
			width: 100%;
			height: auto;
		}

		.product-info {
			gap: 0.5rem;
		}

		.product-title {
			font-size: 1rem;
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}

		.description {
			font-size: 0.8rem;
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}

		.store {
			font-size: 0.8rem;
		}

		.price {
			font-size: 0.9rem;
		}

		.description-section {
			padding: 1.5rem;
		}

		.description-header {
			gap: 0.75rem;
		}

		.description-header h3 {
			font-size: 1.2rem;
		}

		.description-loading {
			font-size: 0.85rem;
		}

		.description-placeholder {
			font-size: 0.85rem;
		}

		.image-drop-zone {
			padding: 2.5rem 2rem;
		}

		.image-drop-zone h3 {
			font-size: 1.2rem;
		}

		.image-drop-zone p {
			font-size: 0.95rem;
		}

		.help-text {
			font-size: 0.85rem !important;
		}

		.section-divider {
			margin: 2rem 0 1.5rem;
		}

		.section-divider span {
			font-size: 0.9rem;
		}
	}
</style>
