<script>
	import { onMount } from 'svelte';
	
	let products = [];
	let loading = false;
	let error = null;

	async function fetchProducts() {
		loading = true;
		error = null;
		
		try {
			const response = await fetch('/api/rapidApi?q=Nike%20shoes');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			products = result.filtered_products;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
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
			<div class="api-section">
				<button on:click={fetchProducts} disabled={loading} class="fetch-button">
					{loading ? 'Loading...' : 'Refresh Products'}
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
				<div class="products">
					{#each products as product}
						<div class="product-card">
							<h3>{product.product_title}</h3>
							<p class="description">{product.product_description}</p>
							<p class="price">Price: ${product.prices.current_price}</p>
							<button class="buy-button">Buy Now</button>
						</div>
					{/each}
				</div>
			{:else}
				<div class="no-products">
					<p>No products available. Click "Refresh Products" to load some items.</p>
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

	.loading, .error, .no-products {
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
