<script lang="ts">
	export let variant: 'buy' | 'view' | 'generate' = 'buy';
	export let href: string | undefined = undefined;
	export let onClick: (() => void) | undefined = undefined;
	export let disabled = false;
	export let size: 'small' | 'medium' | 'large' = 'medium';

	$: buttonClass = `action-button ${variant} ${size}`;
	$: isLink = href !== undefined;
</script>

{#if isLink && href}
	<a {href} target="_blank" rel="noopener noreferrer" class={buttonClass}>
		<slot />
	</a>
{:else}
	<button on:click={onClick} class={buttonClass} {disabled}>
		<slot />
	</button>
{/if}

<style>
	.action-button {
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s ease;
		text-decoration: none;
		display: inline-block;
		text-align: center;
		width: 100%;
	}

	/* Size variants */
	.action-button.small {
		padding: 0.5rem 1rem;
		font-size: 0.85rem;
	}

	.action-button.medium {
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
	}

	.action-button.large {
		padding: 1rem 2rem;
		font-size: 1.1rem;
		border-radius: 12px;
	}

	/* Color variants */
	.action-button.buy {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
	}

	.action-button.buy:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
		background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
	}

	.action-button.view {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
	}

	.action-button.view:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
		background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
	}

	.action-button.generate {
		background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
		box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
	}

	.action-button.generate:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(79, 70, 229, 0.4);
		background: linear-gradient(135deg, #4338CA 0%, #3730A3 100%);
	}

	.action-button:disabled {
		background: rgba(255, 255, 255, 0.2);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	/* Large size specific styles */
	.action-button.large {
		margin-top: 1rem;
	}
</style>
