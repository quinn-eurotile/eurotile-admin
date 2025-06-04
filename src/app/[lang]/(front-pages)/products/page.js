"use client"

import Image from "next/image"
import Link from "next/link"
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import { useEffect, useState } from "react"
import { Container, Menu, MenuItem, Pagination } from "@mui/material"
import FilterSidebar from "@/views/front-pages/product/filter-sidebar"
import ProductGrid from "@/views/front-pages/product/product-grid"

/* import ProductGrid from "@/components/product-grid"
import FilterSidebar from "@/components/filter-sidebar"
import Pagination from "@/components/pagination"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"*/

export default function ProductsPage() {
  const [filterOpen, setFilterOpen] = useState(false)

  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const partners = [
    {
      image: '/images/pages/partner1.png'
    },
     {
      image: '/images/pages/partner2.png'
    },
     {
      image: '/images/pages/partner3.png'
    },
     {
      image: '/images/pages/partner4.png'
    },
     {
      image: '/images/pages/partner5.png'
    },
     {
      image: '/images/pages/partner6.png'
    }
  ]


    const [cartOpen, setCartOpen] = useState(false)
     useEffect(() => {
        // Search functionality
        const searchTrigger = document.querySelector(".search-trigger")
        const searchOverlay = document.querySelector(".search-overlay")
        const closeSearch = document.querySelector(".search-overlay button")

        if (searchTrigger && searchOverlay && closeSearch) {
          searchTrigger.addEventListener("click", () => {
            searchOverlay.classList.remove("hidden")
            searchOverlay.classList.add("flex")
          })

          closeSearch.addEventListener("click", () => {
            searchOverlay.classList.add("hidden")
            searchOverlay.classList.remove("flex")
          })
        }

        // Mobile menu
        const menuTrigger = document.querySelector(".menu-trigger")
        const mobileMenu = document.querySelector(".mobile-menu")
        const mobileMenuClose = document.querySelector(".mobile-menu-close")
        const mobileMenuContent = document.querySelector(".mobile-menu > div")

        if (menuTrigger && mobileMenu && mobileMenuClose && mobileMenuContent) {
          menuTrigger.addEventListener("click", () => {
            mobileMenu.classList.remove("hidden")
            mobileMenu.classList.add("flex")
            setTimeout(() => {
              mobileMenuContent.classList.remove("translate-x-[-100%]")
            }, 10)
          })

          mobileMenuClose.addEventListener("click", () => {
            mobileMenuContent.classList.add("translate-x-[-100%]")
            setTimeout(() => {
              mobileMenu.classList.add("hidden")
              mobileMenu.classList.remove("flex")
            }, 300)
          })

          mobileMenu.addEventListener("click", (e) => {
            if (e.target === mobileMenu) {
              mobileMenuContent.classList.add("translate-x-[-100%]")
              setTimeout(() => {
                mobileMenu.classList.add("hidden")
                mobileMenu.classList.remove("flex")
              }, 300)
            }
          })
        }

        // Mobile submenu
        const mobileSubmenuTriggers = document.querySelectorAll(".mobile-submenu-trigger")
        mobileSubmenuTriggers.forEach((trigger) => {
          trigger.addEventListener("click", () => {
            const submenu = trigger.nextElementSibling
            submenu.classList.toggle("hidden")
            const icon = trigger.querySelector("svg")
            icon.classList.toggle("rotate-90")
          })
        })

        // Account dropdown
        const accountTrigger = document.querySelector(".account-trigger")
        const accountDropdown = document.querySelector(".account-dropdown")

        if (accountTrigger && accountDropdown) {
          accountTrigger.addEventListener("click", () => {
            accountDropdown.classList.toggle("hidden")
          })

          document.addEventListener("click", (e) => {
            if (!accountTrigger.contains(e.target) && !accountDropdown.contains(e.target)) {
              accountDropdown.classList.add("hidden")
            }
          })
        }



        return () => {
          if (searchTrigger && closeSearch) {
            searchTrigger.removeEventListener("click", () => { })
            closeSearch.removeEventListener("click", () => { })
          }
          clearInterval(autoSlideInterval)
          if (sliderPrev && sliderNext) {
            sliderPrev.removeEventListener("click", () => { })
            sliderNext.removeEventListener("click", () => { })
          }
          sliderDots.forEach((dot) => {
            dot.removeEventListener("click", () => { })
          })
          if (productPrev && productNext) {
            productPrev.removeEventListener("click", () => { })
            productNext.removeEventListener("click", () => { })
          }
          if (menuTrigger && mobileMenuClose) {
            menuTrigger.removeEventListener("click", () => { })
            mobileMenuClose.removeEventListener("click", () => { })
          }
          if (accountTrigger) {
            accountTrigger.removeEventListener("click", () => { })
          }
          document.removeEventListener("click", () => { })
        }

      }, [])

  return (
    <div className="min-h-screen flex flex-col">

{/* ----------------------  Header Start ---------------------- */}
      <header className="bg-darkGrey text-white py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              <Image
                src="/images/pages/logo-white.png"
                alt="Luxury living room with tile flooring"
                width={211}
                height={21}
                className="object-cover w-full h-full brightness-100 w-[150px] md:w-[211px]"
              />
            </Link>
          </div>

          <div className="headRight flex">
            <nav className="hidden md:flex space-x-6 text-sm">
              <Link href="/" className="hover:text-gray-300">
                Home
              </Link>
              <div className="relative group">
                <button className="flex items-center text-white bg-transparent font-montserrat text-15">
                  Products {/* <ChevronRight className="h-4 w-4 ml-1 transform rotate-90" /> */}
                  <i className="ri-arrow-down-s-line text-sm"></i>
                </button>
                <div className="absolute left-0 w-48 bg-white text-black rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link href="/products/kitchen" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    Kitchen Tiles
                  </Link>
                  <Link href="/products/bathroom" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    Bathroom Tiles
                  </Link>
                  <Link href="/products/living" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    Living Room Tiles
                  </Link>
                  <Link href="/products/outdoor" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    Outdoor Tiles
                  </Link>
                </div>
              </div>
              <Link href="/about" className="hover:text-gray-300">
                About Us
              </Link>
              <Link href="/faq" className="hover:text-gray-300">
                FAQ's
              </Link>
              <Link href="/contact" className="hover:text-gray-300">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="md:hidden menu-trigger text-white bg-transparent">
                <i className="ri-menu-line text-sm text-18"></i>
              </button>
              <button className="search-trigger text-white bg-transparent">
                <i className="ri-search-line text-18"></i>
              </button>

              <button className="text-white hover:text-gray-300 relative bg-transparent" onClick={() => setCartOpen(true)}>
                <i className="ri-shopping-cart-line text-18"></i>
                <span className="absolute -top-2 -right-2 bg-red-800 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="relative">
                <button className="flex items-center account-trigger text-white bg-transparent">
                  <i className="ri-user-line text-18"></i>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden account-dropdown">
                  <Link href="/account" className="block px-4 py-2 text-xs text-gray-700 hover:bg-redText hover:text-white">
                    My Account
                  </Link>
                  <Link href="/orders" className="block px-4 py-2 text-xs text-gray-700 hover:bg-redText hover:text-white">
                    My Orders
                  </Link>
                  <Link href="/logout" className="block px-4 py-2 text-xs text-gray-700 hover:bg-redText hover:text-white">
                    Logout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className="mobile-menu fixed inset-0 bg-darkGrey bg-opacity-50 z-50 hidden">
        <div className="bg-white text-black h-full w-80 max-w-full transform transition-transform duration-300 translate-x-[-100%]">
          <div className="flex justify-between items-center p-4 border-b">
            <Link href="/" className="text-xl font-bold">
              <Image
                src="/images/pages/logo-black.png"
                alt="Luxury living room with tile flooring"
                width={211}
                height={21}
                className="object-cover w-full h-full brightness-100"
              />
            </Link>
            <button className="mobile-menu-close bg-transparent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <ul className="space-y-4 list-none p-0">
              <li>
                <Link href="/" className="block py-2 text-lg">
                  Home
                </Link>
              </li>
              <li>
                <button className="flex items-center justify-between w-full py-2 text-lg mobile-submenu-trigger bg-transparent">
                  Products
                   <i className="ri-arrow-down-s-line text-sm"></i>
                </button>
                <ul className="pl-4 mt-2 space-y-2 hidden mobile-submenu">
                  <li>
                    <Link href="/products/kitchen" className="block py-1">
                      Kitchen Tiles
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/bathroom" className="block py-1">
                      Bathroom Tiles
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/living" className="block py-1">
                      Living Room Tiles
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/outdoor" className="block py-1">
                      Outdoor Tiles
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link href="/about" className="block py-2 text-lg">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="block py-2 text-lg">
                  FAQ's
                </Link>
              </li>
              <li>
                <Link href="/contact" className="block py-2 text-lg">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>


      {/* ----------------------  Header End ---------------------- */}

        {/* Search Overlay */}
      <div className="search-overlay fixed inset-0 bg-white z-50 flex-col items-center justify-start pt-20 px-4 hidden">
        <button className="absolute top-4 right-4 text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="w-full max-w-4xl mx-auto">
          <div className="relative">
            <input type="text" placeholder="Search for products..." className="w-full border-b-2 border-gray-300 py-4 px-2 text-xl focus:outline-none focus:border-red-800"
            />
            <button className="absolute right-0 top-0 h-full px-4 text-red-800">
              <i className="ri-search-line h-6 w-6"></i>
            </button>
          </div>
        </div>
      </div>

      <section className="relative h-[311px]">
        <div className="slider-container relative h-full overflow-hidden">
          <div className="flex h-full transition-transform duration-500">
            <div className="min-w-full h-full relative">
              <Image
                src="/images/pages/product-banner.jpg"
                alt="Luxury living room with tile flooring"
                width={1920}
                height={311}
                className="object-cover w-full h-full brightness-75"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
                <div className="relative w-full">
                  <h3 className="text-[196px] absolute uppercase left-0 right-0  -top-28 m-auto opacity-15">EuroTile</h3>
                  <h1 className="text-4xl md:text-6xl font-light mb-4">Products</h1>
                </div>

              </div>
            </div>

          </div>


        </div>
      </section>

      <main>
        {/* Hero Section - Slider */}
        <div className="container mx-auto px-4 py-8">


          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Filter Sidebar */}
            <div className="hidden md:block">
              <FilterSidebar />
            </div>

            {/* Mobile Filter Sidebar */}
            <FilterSidebar isMobile={true} isOpen={filterOpen} onClose={() => setFilterOpen(false)} />

            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-medium text-red-800 mb-0">Products</h2>
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  className="md:hidden flex items-center gap-2"
                  onClick={() => setFilterOpen(true)}
                >
                  <i className="ri-filter-line text-xl h-4 w-4"></i>
                  Filters
                </Button>

                {/* Sort Dropdown */}
                <Button variant='outlined' aria-controls='basic-menu' aria-haspopup='true' onClick={handleClick} className="bg-red-800 hover:bg-black border-0 text-white px-4 py-2 rounded-md flex items-center gap-2 capitalize">
                  Sort By <i className="ri-arrow-right-s-line text-xl h-4 w-4"></i>
                </Button>
                <Menu keepMounted id='basic-menu' anchorEl={anchorEl} onClose={handleClose} open={Boolean(anchorEl)}>
                  <MenuItem onClick={handleClose}>Price: Low to High</MenuItem>
                  <MenuItem onClick={handleClose}>Price: High to Low</MenuItem>
                  <MenuItem onClick={handleClose}>Newest First</MenuItem>
                  <MenuItem onClick={handleClose}>Popularity</MenuItem>
                  <MenuItem onClick={handleClose}>Rating</MenuItem>
                </Menu>

              </div>

              <ProductGrid />

              <div className="mt-16 mb-5 flex justify-center">
                <Pagination />
              </div>
            </div>
          </div>
        </div>

      </main>


{/* ----------------------  Footer Start ---------------------- */}
      <footer className="bg-darkGrey text-white py-12 pb-6 mt-16 bg-[url('/images/pages/why-choose-pattern-img.png'),_url('/images/pages/why-choose-pattern-img.png')] bg-no-repeat bg-[position:left_top,right_bottom] bg-[length:205,205px]">

        <section className="py-8">
          <Container maxWidth="xl" sx={{ px: 4 }}>
            <div className="flex flex-wrap justify-center items-center gap-8 bg-[#F9F9F9] -mt-36 py-6 rounded-sm">
              {partners.map((partner, index) => (
                <div key={index} className="filter grayscale hover:grayscale-0 transition-all duration-300">
                  <Image
                    src={partner.image}
                    alt=""
                    width={157}
                    height={88}
                    className="object-contain "
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 pb-6   ">
            <div className="w-full">
              <h3 className="text-3xl font-light mb-2 text-white">Newsletter</h3>
              <p className="text-sm text-white font-light">Use this text to share the information which you like!</p>
            </div>
            <div className="mt-4 md:mt-0 flex w-full bg-white p-3 rounded-sm">
              <TextField
                type="email"
                size="small"
                placeholder="Your email address"
                variant="outlined"
                className="w-full rounded-l-md text-black me-4"
                InputProps={{
                  sx: {
                    border: 'none',
                    boxShadow: 'none',
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
              <Button size="small" className="bg-red-800 hover:bg-red-900 text-white px-0 rounded w-[40px] min-w-[40px]">
                 < i className="ri-send-plane-fill"></i>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="text-xl font-bold mb-4 block">

                <Image
                  src="/images/pages/logo-white.png"
                  alt="Luxury living room with tile flooring"
                  width={211}
                  height={21}
                  className="object-cover brightness-100" />
              </Link>
              <p className="text-sm text-gray-400">Reference site about Lorem Ipsum, giving information on its origins, as well as a random Lipsum generator.</p>
            </div>
            <div>
              <h4 className="text-sm font-normal mb-4">Information</h4>
              <ul className="space-y-2 text-sm text-gray-400  list-none p-0">
                <li>
                  <Link href="/products" className="hover:text-white">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us

                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-normal mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400 list-none p-0">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>

                <li>
                  <Link href="/track" className="hover:text-white">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-use" className="hover:text-white">
                    Terms Of Use
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-normal mb-4">Contact Info</h4>
              <address className="text-sm text-gray-400 not-italic">
                <div className="contact-div"> <h2 className="text-sm text-white mt-0 mb-2 font-normal">Address </h2>
                  <p className="mt-0">1222, 13 One arlington Avenue ,UK</p>
                </div>
                <div className="contact-div mt-3">
                  <h2 className="text-sm text-white mt-0 mb-2 font-normal">Phone</h2>
                  <p className="mt-2">(123) 456-7890</p>
                </div>
                <div className="contact-div mt-3">
                  <h2 className="text-sm text-white mt-0 mb-2 font-normal">Email</h2>
                  <p className="mt-0">info@eurotile.com</p>
                </div>
              </address>

            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-sm text-gray-400 text-center">
            <p className="mb-0">© 2025-2026 EUROTILE. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
{/* ----------------------  Footer End ---------------------- */}

    </div>
  )
}
