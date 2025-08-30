<script>
  import svelteLogo from './assets/svelte.svg'
  import Counter from './lib/Counter.svelte'
</script>

<main class="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
  <div class="container mx-auto px-4 py-16 text-center">
    <div class="flex justify-center items-center gap-8 mb-12">
      <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
        <img src="/vite.svg" class="h-24 p-6 transition-all duration-300 hover:drop-shadow-2xl hover:scale-110" alt="Vite Logo" />
      </a>
      <a href="https://svelte.dev" target="_blank" rel="noreferrer">
        <img src={svelteLogo} class="h-24 p-6 transition-all duration-300 hover:drop-shadow-2xl hover:scale-110" alt="Svelte Logo" />
      </a>
    </div>
    
    <h1 class="text-5xl font-bold text-gray-800 dark:text-white mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      Buy Sell Helper
    </h1>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12 max-w-md mx-auto">
      <Counter />
    </div>

    <div class="max-w-2xl mx-auto space-y-6">
      <p class="text-lg text-gray-700 dark:text-gray-300">
        Check out 
        <a 
          href="https://github.com/sveltejs/kit#readme" 
          target="_blank" 
          rel="noreferrer"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline decoration-2 underline-offset-4 hover:decoration-blue-600"
        >
          SvelteKit
        </a>, the official Svelte app framework powered by Vite!
      </p>

      <p class="text-sm text-gray-500 dark:text-gray-400">
        Click on the Vite and Svelte logos to learn more
      </p>
      
      <div class="flex justify-center mt-8">
        <div class="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium">
          ✅ Tailwind CSS is working!
        </div>
      </div>
    </div>
  </div>
</main>
