<script lang="ts">
	export let variant: 'buying' | 'selling' = 'buying';
	export let onClick: () => void;
	export let disabled = false;

	$: buttonClass = variant === 'buying' ? 'cta-button buying' : 'cta-button selling';
</script>

<button on:click={onClick} class={buttonClass} {disabled}>
	<span><slot /></span>
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
	</svg>
</button>

<style>
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

	.cta-button.buying:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
		background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
	}

	.cta-button.selling {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
	}

	.cta-button.selling:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
		background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
	}

	.cta-button:active {
		transform: translateY(0);
	}

	.cta-button:disabled {
		background: rgba(255, 255, 255, 0.2);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	@media (max-width: 768px) {
		.cta-button {
			width: 100%;
			max-width: 280px;
		}
	}
</style>
