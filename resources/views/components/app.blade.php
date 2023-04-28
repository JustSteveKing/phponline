@props([
    'title' => config('app.name')
])

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full bg-white dark:bg-gray-900">
    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>

        <title>{{ $title }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />

        @vite(['resources/js/app.js', 'resources/css/app.css'])
    </head>
    <body class="h-full">

        <div class="bg-white">
            <header class="relative bg-white">
                <nav aria-label="Top" class="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div class="border-b border-gray-200 px-4 pb-14 sm:px-0 sm:pb-0">
                        <div class="flex h-16 items-center justify-between">
                            <!-- Logo -->
                            <div class="flex flex-1">
                                <a href="#">
                                    <span class="sr-only">Your Company</span>
                                    <x-logo class="h-8 w-auto" />
                                </a>
                            </div>

                            <!-- Flyout menus -->
                            <div class="absolute inset-x-0 bottom-0 sm:static sm:flex-1 sm:self-stretch">
                                <div class="flex h-14 space-x-8 overflow-x-auto border-t px-4 pb-px sm:h-full sm:justify-center sm:overflow-visible sm:border-t-0 sm:pb-0">
                                    <div class="flex" x-data="{ open: false, focus: false }" @keydown.escape="open = false">
                                        <div class="relative flex">
                                            <button type="button" class="relative z-10 -mb-px flex items-center border-b-2 pt-px text-sm font-medium transition-colors duration-200 ease-out border-transparent text-gray-700 hover:text-gray-800" :class="{ 'border-indigo-600 text-indigo-600': open, 'border-transparent text-gray-700 hover:text-gray-800': !(open) }" @click="open = ! open" aria-expanded="false" :aria-expanded="open.toString()">Women</button>
                                        </div>


                                        <div x-show="open" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" class="absolute inset-x-0 top-full text-gray-500 sm:text-sm" x-ref="panel" @click.away="open = false" style="display: none;">
                                            <!-- Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow -->
                                            <div class="absolute inset-0 top-1/2 bg-white shadow" aria-hidden="true"></div>

                                            <div class="relative bg-white">
                                                <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                    <div class="grid grid-cols-1 items-start gap-x-6 gap-y-10 pb-12 pt-10 md:grid-cols-2 lg:gap-x-8">
                                                        <div class="grid grid-cols-1 gap-x-6 gap-y-10 lg:gap-x-8">
                                                            <div>
                                                                <p id="clothing-heading" class="font-medium text-gray-900">Clothing</p>
                                                                <div class="mt-4 border-t border-gray-200 pt-6 sm:grid sm:grid-cols-2 sm:gap-x-6">
                                                                    <ul role="list" aria-labelledby="clothing-heading" class="space-y-6 sm:space-y-4">
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Tops</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Dresses</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Pants</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Denim</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Sweaters</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">T-Shirts</a>
                                                                        </li>

                                                                    </ul>
                                                                    <ul role="list" aria-label="More clothing" class="mt-6 space-y-6 sm:mt-0 sm:space-y-4">
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Jackets</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Activewear</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Shorts</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Swimwear</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Browse All</a>
                                                                        </li>

                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:gap-x-8">
                                                            <div>
                                                                <p id="accessories-heading" class="font-medium text-gray-900">Accessories</p>
                                                                <ul role="list" aria-labelledby="accessories-heading" class="mt-4 space-y-6 border-t border-gray-200 pt-6 sm:space-y-4">
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Shoes</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Jewelry</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Handbags</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Socks</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Hats</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Browse All</a>
                                                                    </li>

                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <p id="categories-heading" class="font-medium text-gray-900">Categories</p>
                                                                <ul role="list" aria-labelledby="categories-heading" class="mt-4 space-y-6 border-t border-gray-200 pt-6 sm:space-y-4">
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">New Arrivals</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Sale</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Basic Tees</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Artwork Tees</a>
                                                                    </li>

                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div class="flex" x-data="{ open: false, focus: false }" @keydown.escape="open = false">
                                        <div class="relative flex">
                                            <button type="button" class="border-transparent text-gray-700 hover:text-gray-800 relative z-10 -mb-px flex items-center border-b-2 pt-px text-sm font-medium transition-colors duration-200 ease-out" :class="{ 'border-indigo-600 text-indigo-600': open, 'border-transparent text-gray-700 hover:text-gray-800': !(open) }" @click="open = ! open" aria-expanded="false" :aria-expanded="open.toString()">Men</button>
                                        </div>


                                        <div x-show="open" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" class="absolute inset-x-0 top-full text-gray-500 sm:text-sm" x-ref="panel" @click.away="open = false" style="display: none;">
                                            <!-- Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow -->
                                            <div class="absolute inset-0 top-1/2 bg-white shadow" aria-hidden="true"></div>

                                            <div class="relative bg-white">
                                                <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                    <div class="grid grid-cols-1 items-start gap-x-6 gap-y-10 pb-12 pt-10 md:grid-cols-2 lg:gap-x-8">
                                                        <div class="grid grid-cols-1 gap-x-6 gap-y-10 lg:gap-x-8">
                                                            <div>
                                                                <p id="clothing-heading" class="font-medium text-gray-900">Clothing</p>
                                                                <div class="mt-4 border-t border-gray-200 pt-6 sm:grid sm:grid-cols-2 sm:gap-x-6">
                                                                    <ul role="list" aria-labelledby="clothing-heading" class="space-y-6 sm:space-y-4">
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Dress Shirts</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Pants</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Jackets</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">T-Shirts</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Jeans</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Hoodies</a>
                                                                        </li>

                                                                    </ul>
                                                                    <ul role="list" aria-label="More clothing" class="mt-6 space-y-6 sm:mt-0 sm:space-y-4">
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Vests</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Kilts</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Outdoors</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Capes</a>
                                                                        </li>
                                                                        <li class="flex">
                                                                            <a href="#" class="hover:text-gray-800">Browse All</a>
                                                                        </li>

                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:gap-x-8">
                                                            <div>
                                                                <p id="accessories-heading" class="font-medium text-gray-900">Accessories</p>
                                                                <ul role="list" aria-labelledby="accessories-heading" class="mt-4 space-y-6 border-t border-gray-200 pt-6 sm:space-y-4">
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Watches</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Boots</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Fanny Packs</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Sunglasses</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Browse All</a>
                                                                    </li>

                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <p id="categories-heading" class="font-medium text-gray-900">Categories</p>
                                                                <ul role="list" aria-labelledby="categories-heading" class="mt-4 space-y-6 border-t border-gray-200 pt-6 sm:space-y-4">
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Just Added</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Clearance</a>
                                                                    </li>
                                                                    <li class="flex">
                                                                        <a href="#" class="hover:text-gray-800">Graphic Tees</a>
                                                                    </li>

                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>


                                    <a href="#" class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800">Company</a>
                                    <a href="#" class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800">Stores</a>

                                </div>
                            </div>

                            <div class="flex flex-1 items-center justify-end">
                                <!-- Search -->
                                <a href="#" class="p-2 text-gray-400 hover:text-gray-500">
                                    <span class="sr-only">Search</span>
                                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
                                    </svg>
                                </a>

                                <!-- Cart -->
                                <div class="ml-4 flow-root lg:ml-8">
                                    <a href="#" class="group -m-2 flex items-center p-2">
                                        <svg class="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path>
                                        </svg>
                                        <span class="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">0</span>
                                        <span class="sr-only">items in cart, view bag</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        </div>

        <main>
            {{ $slot }}
        </main>
    </body>
</html>
