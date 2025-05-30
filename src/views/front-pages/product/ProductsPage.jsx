'use client'

import Image from 'next/image'
import Link from 'next/link'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import { useEffect, useState } from 'react'
import { Container, Menu, MenuItem, Pagination, TablePagination } from '@mui/material'
import FilterSidebar from '@/views/front-pages/product/filter-sidebar'
import ProductGrid from '@/views/front-pages/product/product-grid'
import { getProductList, getProductRawData } from '@/app/server/actions'
import { callCommonAction } from '@/redux-store/slices/common'

/* import ProductGrid from "@/components/product-grid"
import FilterSidebar from "@/components/filter-sidebar"
import Pagination from "@/components/pagination"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"*/

export default function ProductsPage() {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [reawFilterData, setReawFilterData] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)
  const [filter, setFilter] = useState({
    search_string: '',
    category: [],
    suppliers: [],
    price: [10, 10000],
    attributeVariations: {} // { color: ['red', 'blue'], size: ['M'] }
  })
  const [filterOpen, setFilterOpen] = useState(false)
  //const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)

  useEffect(() => {
    fetchProductList(page + 1, rowsPerPage)
  }, [page, rowsPerPage, filter?.search_string, filter])

  const fetchFilterData = async () => {
    const response = await getProductRawData()
    if (response?.data) {
      setReawFilterData(response?.data)
    }
  }

  useEffect(() => {
    fetchFilterData()
  }, [])

  const fetchProductList = async (currentPage = 1, pageSize = rowsPerPage) => {
    try {
      //dispatch(callCommonAction({ loading: true }))
      const response = await getProductList(currentPage, pageSize, filter?.search_string, filter)
      //dispatch(callCommonAction({ loading: false }))
      if (response.statusCode === 200 && response.data) {
        const formatted = response?.data?.docs?.map(product => ({
          id: product?._id,
          name: product?.name,
          categories: product?.categories,
          supplier: product?.supplier,
          totalQuantity: product?.totalQuantity,
          sku: product?.sku,
          status: product?.status,
          avatar: product?.featuredImage?.filePath,
          username: product?.name.split(' ')[0]
        }))

        setPage(page)
        setData(formatted)
        setTotalRecords(response.data.totalDocs || 0)
      }
    } catch (error) {
      //dispatch(callCommonAction({ loading: false }))
      console.error('Failed to fetch team members', error)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    const newSize = parseInt(event.target.value, 10)
    setRowsPerPage(newSize)
    setPage(0)
  }

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Navigation */}

      <section className='relative h-[311px]'>
        <div className='slider-container relative h-full overflow-hidden'>
          <div className='flex h-full transition-transform duration-500'>
            <div className='min-w-full h-full relative'>
              <Image
                src='/images/pages/product-banner.jpg'
                alt='Luxury living room with tile flooring'
                width={1920}
                height={311}
                className='object-cover w-full h-full brightness-75'
              />
              <div className='absolute inset-0 flex flex-col items-center justify-center text-white text-center'>
                <div className='relative w-full'>
                  <h3 className='text-[196px] absolute uppercase left-0 right-0  -top-28 m-auto opacity-15'>
                    EuroTile
                  </h3>
                  <h1 className='text-4xl md:text-6xl font-light mb-4'>Products</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* Hero Section - Slider */}
        <div className='container mx-auto px-4 py-8'>
          <div className='flex flex-col md:flex-row gap-8'>
            {/* Desktop Filter Sidebar */}
            <div className='hidden md:block'>
              <FilterSidebar reawFilterData={reawFilterData} setFilter={setFilter} filter={filter} />
            </div>

            {/* Mobile Filter Sidebar */}
            {/* <FilterSidebar isMobile={true} isOpen={filterOpen} onClose={() => setFilterOpen(false)} /> */}

            <div className='flex-1'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-medium text-red-800 mb-0'>Products</h2>
                {/* Mobile Filter Button */}
                <Button
                  variant='outline'
                  className='md:hidden flex items-center gap-2'
                  onClick={() => setFilterOpen(true)}
                >
                  <i className='ri-filter-line text-xl h-4 w-4'></i>
                  Filters
                </Button>

                {/* Sort Dropdown */}
                <Button
                  variant='outlined'
                  aria-controls='basic-menu'
                  aria-haspopup='true'
                  onClick={handleClick}
                  className='bg-red-800 hover:bg-black border-0 text-white px-4 py-2 rounded-md flex items-center gap-2'
                >
                  Sort By <i className='ri-arrow-right-s-line text-xl h-4 w-4'></i>
                </Button>
                <Menu keepMounted id='basic-menu' anchorEl={anchorEl} onClose={handleClose} open={Boolean(anchorEl)}>
                  <MenuItem onClick={handleClose}>Price: Low to High</MenuItem>
                  <MenuItem onClick={handleClose}>Price: High to Low</MenuItem>
                  <MenuItem onClick={handleClose}>Newest First</MenuItem>
                  <MenuItem onClick={handleClose}>Popularity</MenuItem>
                  <MenuItem onClick={handleClose}>Rating</MenuItem>
                </Menu>
              </div>

              <ProductGrid products={data} />

              <div className='mt-16 mb-5 flex justify-center'>
                {/* <Pagination /> */}
                <TablePagination
                  component='div'
                  count={totalRecords}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[1, 10, 20, 50]}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
