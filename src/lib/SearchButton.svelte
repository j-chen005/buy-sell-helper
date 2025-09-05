<script lang="ts">
	export let onClick: () => void;
	export let disabled = false;
	export let loading = false;
	export let loadingText = 'Searching...';
	export let defaultText = 'Search';
</script>

<button 
	on:click={onClick} 
	{disabled}
	class="search-button"
>
	{loading ? loadingText : defaultText}
</button>

<style>
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
</style>
