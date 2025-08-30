<script>
  let count = 0
  const increment = () => {
    count += 1
  }
</script>

<button 
  on:click={increment}
  class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
>
  count is {count}
</button>
