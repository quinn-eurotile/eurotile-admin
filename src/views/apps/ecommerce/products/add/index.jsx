'use client'

// React Imports
import { useForm, FormProvider } from 'react-hook-form'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'

// Component Imports
import ProductAddHeader from '@views/apps/ecommerce/products/add/ProductAddHeader'
import ProductInformation from '@views/apps/ecommerce/products/add/ProductInformation'
import ProductImage from '@views/apps/ecommerce/products/add/ProductImage'
import ProductVariants from '@views/apps/ecommerce/products/add/ProductVariants'
import ProductInventory from '@views/apps/ecommerce/products/add/ProductInventory'
import ProductPricing from '@views/apps/ecommerce/products/add/ProductPricing'
import ProductOrganize from '@views/apps/ecommerce/products/add/ProductOrganize'
import ProductFeaturedImage from './ProductFeaturedImage';
import { useEffect, useState } from 'react';
import { getProductRawData } from '@/app/server/actions';

const AddProduct = () => {
  const formMethods = useForm({
    defaultValues: {
      productName: '',
      sku: '',
      barcode: '',
      description: '',
    }
  })

  const { handleSubmit } = formMethods
   const [rawProduct, setRawProduct] = useState([])
   const [productSuppliers, setProductSuppliers] = useState([])

  const getRawData = async () => {
    try {
      const response = await getProductRawData()
      if (response?.data) {
        setRawProduct(response?.data)
      }
    } catch (error) {
      console.error('Failed to fetch raw data:', error)
    }
  }

  useEffect(() => {
    getRawData()
  }, [])

  const onSubmit = data => {
    console.log('Form Data:', data)
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <ProductAddHeader />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <ProductInformation />
              </Grid>
               <Grid size={{ xs: 12 }}>
                <ProductVariants productAttributes={rawProduct?.productAttributes}/>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <ProductImage />
              </Grid>

              {/* <Grid size={{ xs: 12 }}>
                <ProductInventory />
              </Grid> */}
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container spacing={6}>
              {/* <Grid size={{ xs: 12 }}>
                <ProductPricing />
              </Grid> */}
              <Grid size={{ xs: 12 }}>
                <ProductOrganize rawProductData={rawProduct}/>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <ProductFeaturedImage />
              </Grid>
              {/* <Grid size={{ xs: 12 }}>
                <Button type='submit' variant='contained'>
                  Publish Product
                </Button>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  )
}

export default AddProduct
