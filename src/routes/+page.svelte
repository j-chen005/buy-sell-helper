<script>
	import { goto } from '$app/navigation';
	
	function goToBuying() {
		goto('/buying');
	}
</script>

<main>
	<div class="container">
		<h1>Buy Sell Helper</h1>

		<div class="card">
			<p class="welcome-text">
				Welcome to Buy Sell Helper! Your one-stop solution for buying and selling products.
			</p>
		</div>

		<div class="action-buttons">
			<button on:click={goToBuying} class="buy-button">
				Buy
			</button>
		</div>

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

	.card {
		padding: 2em;
		margin: 2rem 0;
	}

	.welcome-text {
		font-size: 1.2rem;
		color: #374151;
		line-height: 1.6;
		margin: 0;
	}

	.action-buttons {
		margin: 3rem 0;
	}

	.buy-button {
		background: #059669;
		color: white;
		border: none;
		padding: 1rem 3rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1.2rem;
		font-weight: 600;
		transition: background-color 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.buy-button:hover {
		background: #047857;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.tailwind-test {
		margin-top: 2rem;
	}
</style>
