<script>
	let count = 0;
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

<main>
	<div class="container">
		<div class="logos">
			<a href="https://vitejs.dev" target="_blank">
				<img src="/vite.svg" class="logo vite" alt="Vite logo" />
			</a>
			<a href="https://svelte.dev" target="_blank">
				<img src="/svelte.svg" class="logo svelte" alt="Svelte logo" />
			</a>
		</div>
		<h1>Buy Sell Helper</h1>

		<div class="card">
			<button on:click={() => count++}>count is {count}</button>
		</div>

		<div class="api-section">
			<button on:click={fetchProducts} disabled={loading}>
				{loading ? 'Loading...' : 'Fetch Products'}
			</button>
		</div>

		<p>
			Check out SvelteKit, the official Svelte app framework powered by Vite!
		</p>

		<p class="read-the-docs">
			Click on the Vite and Svelte logos to learn more
		</p>

		{#if loading}
			<p>Loading products...</p>
		{:else if error}
			<p class="error">Error: {error}</p>
		{:else if products.length > 0}
			<div class="products">
				{#each products as product}
					<div class="product">
						<h3>{product.product_title}</h3>
						<p>{product.product_description}</p>
						<p>Price: ${product.prices.current_price}</p>
					</div>
				{/each}
			</div>
		{/if}

		<div class="tailwind-test">
			<button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
				✅ Tailwind CSS is working!
			</button>
		</div>
	</div>
</main>

<style>
	.container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}

	.logos {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.logo {
		height: 6em;
		padding: 1.5em;
		will-change: filter;
		transition: filter 300ms;
	}

	.logo:hover {
		filter: drop-shadow(0 0 2em #646cffaa);
	}

	.logo.svelte:hover {
		filter: drop-shadow(0 0 2em #ff3e00aa);
	}

	.card {
		padding: 2em;
	}

	.api-section {
		margin: 2rem 0;
	}

	.api-section button {
		background: #646cff;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
	}

	.api-section button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.read-the-docs {
		color: #888;
	}

	.products {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
		margin: 2rem 0;
	}

	.product {
		border: 1px solid #ddd;
		padding: 1rem;
		border-radius: 8px;
		text-align: left;
	}

	.error {
		color: red;
	}

	.tailwind-test {
		margin-top: 2rem;
	}
</style>
