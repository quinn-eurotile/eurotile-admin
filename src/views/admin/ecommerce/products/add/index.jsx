'use client';

// React Imports
import { useForm, FormProvider } from 'react-hook-form';

// MUI Imports
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';

// Component Imports

import ProductFeaturedImage from './ProductFeaturedImage';
import { useEffect, useState } from 'react';
import { createProduct, getProductRawData } from '@/app/server/actions';
import { generateSku, generateSlug } from '@/components/common/helper';
import { useParams, useRouter } from 'next/navigation';
import ProductVariants from './ProductVariants';
import ProductOrganize from './ProductOrganize';
import ProductAddHeader from './ProductAddHeader';
import ProductInformation from './ProductInformation';
import ProductImage from './ProductImage';

const AddProduct = () => {
  const formMethods = useForm();
  const router = useRouter();
  const { lang: locale } = useParams();

  const { handleSubmit } = formMethods;
  const [rawProduct, setRawProduct] = useState([]);
  const [productSuppliers, setProductSuppliers] = useState([]);

  const getRawData = async () => {
    try {
      const response = await getProductRawData();
      if (response?.data) {
        setRawProduct(response?.data);
      }
    } catch (error) {
      console.error('Failed to fetch raw data:', error);
    }
  };

  useEffect(() => {
    getRawData();
  }, []);



  const onSubmit = async (data) => {
    // Generate slug and SKU
    const slug = generateSlug(data?.name);
    const sku = generateSku();

    // Create a new FormData instance
    const formData = new FormData();

    // Append slug and sku as strings
    formData.append('slug', slug);
    formData.append('sku', sku);

    // Append all fields except files first
    for (const key in data) {
      if (!['productFeaturedImage', 'productImages'].includes(key)) {
        // Handle arrays or objects by stringifying
        if (Array.isArray(data[key]) || typeof data[key] === 'object') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    }

    // Append productFeaturedImage file if exists
    if (data.productFeaturedImage) {
      formData.append('productFeaturedImage', data.productFeaturedImage);
    } else {
      formData.append('productFeaturedImage', []);
    }

    // Append multiple productImages files if they exist
    if (Array.isArray(data.productImages)) {
      data.productImages.forEach((img) => {
        if (img) {
          formData.append('productImages', img); // name must be exactly 'productImages'
        }
      });
    } else {
      formData.append('productImages', []);
    }

    // Call the API with FormData (make sure API accepts multipart/form-data)
    const response = await createProduct(formData);
    if (response.success) {
      //router.push(`/${locale}/admin/ecommerce/products/list`)
    }

    console.log(response, 'response from createProduct');
  };

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
                <ProductVariants productAttributes={rawProduct?.productAttributes} />
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
  );
};

export default AddProduct;
