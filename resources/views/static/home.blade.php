<x-app>
    <div class="bg-white py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <div class="mx-auto max-w-2xl lg:mx-0">
                <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Latest Content
                </h2>
                <p class="mt-2 text-lg leading-8 text-gray-600">
                    Catch up on the latest content from our members.
                </p>
            </div>

            <x-articles.article-list :articles="$articles" />
        </div>
    </div>
</x-app>
