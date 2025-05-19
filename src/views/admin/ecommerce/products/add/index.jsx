'use client'

// React Imports
import { useForm, FormProvider } from 'react-hook-form'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'

// Component Imports

import ProductFeaturedImage from './ProductFeaturedImage'
import { useEffect, useState } from 'react'
import { createProduct, getProductDetails, getProductRawData } from '@/app/server/actions'
import { generateSku, generateSlug } from '@/components/common/helper'
import { useParams, useRouter } from 'next/navigation'
import ProductVariants from './ProductVariants'
import ProductOrganize from './ProductOrganize'
import ProductAddHeader from './ProductAddHeader'
import ProductInformation from './ProductInformation'
import ProductImage from './ProductImage'

const AddProduct = () => {
  const formMethods = useForm({ defaultValues: {} })
  const router = useRouter()
  const { lang: locale, id: productId } = useParams()

  const { handleSubmit, reset } = formMethods
  const [rawProduct, setRawProduct] = useState([])
  const [productSuppliers, setProductSuppliers] = useState([])
  const [attributeVariations, setAttributeVariations] = useState([])
  const [productVariations, setProductVariations] = useState([])
  console.log(productVariations, 'productVariationsproductVariations')

  useEffect(() => {
    getRawData()
  }, [])

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

  const fetchProductDetails = async () => {
    try {
      const response = await getProductDetails(productId)

      if (response?.success && response?.data) {
        const product = response.data

        // Map supplier object to supplier ID string (or empty string)
        const supplierId = product.supplier?._id || ''

        // Map categories array of objects to array of IDs
        const categoryIds = Array.isArray(product.categories) ? product.categories.map(category => category._id) : []

        // Map attributeVariations array of objects to array of IDs
        const attributeVariationIds = Array.isArray(product.attributeVariations)
          ? product.attributeVariations.map(attr => attr._id)
          : []

        // Map productVariations array (assuming you want full objects)
        const productVariations = Array.isArray(product.productVariations)
          ? product.productVariations.map(variation => ({
              description: variation.description || '',
              stockStatus: variation.stockStatus || '',
              stockQuantity: variation.stockQuantity || 0,
              allowBackorders: variation.allowBackorders || false,
              weight: variation.weight || 0,
              dimensions: {
                length: variation.dimensions?.length || 0,
                width: variation.dimensions?.width || 0,
                height: variation.dimensions?.height || 0
              },
              regularPrice: variation.regularPrice || 0,
              salePrice: variation.salePrice || 0,
              purchasedPrice: variation.purchasedPrice || 0,
              customImageUrl: variation.customImageUrl || '',
              image: variation.image || '',
              shippingClass: variation.shippingClass || '',
              taxClass: variation.taxClass || ''
            }))
          : []

        // Map productImages array if needed, example:
        const productImages = Array.isArray(product.productImages)
          ? product.productImages.map(image => ({
              // Map as per your form expects
              id: image._id || '',
              url: image.url || '' // Assuming your image object has url property
            }))
          : []

        // Prepare full form values object
        const formValues = {
          _id: product._id,
          externalId: product.externalId || '',
          sku: product.sku || '',
          name: product.name || '',
          slug: product.slug || '',
          shortDescription: product.shortDescription || '',
          description: product.description || '',
          isDeleted: product.isDeleted || false,
          supplier: supplierId,
          stockStatus: product.stockStatus || '',
          status: product.status || 0,
          defaultPrice: product.defaultPrice || 0,
          categories: categoryIds,
          attributeVariations: attributeVariationIds,
          productVariations: productVariations,
          productImages: productImages,
          productFeaturedImage: product.productFeaturedImage || null,
          createdBy: product.createdBy || null,
          updatedBy: product.updatedBy || null,
          createdAt: product.createdAt || null,
          updatedAt: product.updatedAt || null
        }

        console.log(formValues, 'formValuesformValues')

        setAttributeVariations(attributeVariationIds)
        setProductVariations(productVariations)

        // Reset the form with fetched and mapped values
        reset(formValues)
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchProductDetails()
    }
  }, [productId])

  const onSubmit = async data => {
    // Generate slug and SKU
    const slug = generateSlug(data?.name)
    const sku = generateSku()

    // Create a new FormData instance
    const formData = new FormData()

    // Append slug and sku as strings
    formData.append('slug', slug)
    formData.append('sku', sku)

    // Append all fields except files first
    for (const key in data) {
      if (!['productFeaturedImage', 'productImages'].includes(key)) {
        // Handle arrays or objects by stringifying
        if (Array.isArray(data[key]) || typeof data[key] === 'object') {
          formData.append(key, JSON.stringify(data[key]))
        } else {
          formData.append(key, data[key])
        }
      }
    }

    // Append productFeaturedImage file if exists
    if (data.productFeaturedImage instanceof File) {
      formData.append('productFeaturedImage', data.productFeaturedImage)
    } else {
      formData.append('productFeaturedImage', [])
    }

    if (data.variationImage instanceof File) {
      formData.append('variationImage', data.variationImage)
    } else {
      formData.append('variationImage', [])
    }

    // Call the API with FormData (make sure API accepts multipart/form-data)
    const response = await createProduct(formData)
    if (response.success) {
      router.push(`/${locale}/admin/ecommerce/products/list`)
    }

    console.log(response, 'response from createProduct')
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
                <ProductVariants
                  productAttributes={rawProduct?.productAttributes}
                  defaultAttributeVariations={attributeVariations}
                  defaultProductVariations={productVariations}
                />
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
                <ProductOrganize rawProductData={rawProduct} />
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
