import Image from 'next/image';
import Link from 'next/link';
import Button from '@mui/material/Button';
import { useParams } from 'next/navigation';

export default function ProductGrid({ products }) {
  const { lang: locale } = useParams();
  //console.log(products, 'productsproducts');

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {products?.map((product, index) => (
        <div key={`${product?.variationId}`} className='group'>
          {/* <Link href={`/products/${product?.id}?vid=${product?.variationId}`}> */}
          <Link
            href={{
              pathname: `/${locale}/products/${product?.id}`,
              query: { vid: product?.variationId }
            }}
            rel='noopener noreferrer'
            className="block"
          >
            <div className='p-2 bg-bgLight rounded-lg mb-3'>
              <div className="relative aspect-square overflow-hidden rounded-md group">
                {/* Default Image */}
                <Image
                  src={
                    product?.avatar?.trim()
                      ? `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${product.avatar}`
                      : '/placeholder.svg'
                  }
                  alt={product?.name || 'Product'}
                  fill
                  className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={index < 6}
                />

                {/* Hover Image */}
                <Image
                  src={
                    product?.avatar1?.trim()
                      ? `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${product.avatar1}`
                      : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${product.avatar}` // fallback to main image
                  }
                  alt={product?.name || 'Product Hover'}
                  fill
                  className="object-cover absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                />
              </div>

            </div>
          </Link>
          <div className='text-center'>
            <Link
              href={{
                pathname: `/${locale}/products/${product?.id}`,
                query: { vid: product?.variationId }
              }}
              rel='noopener noreferrer'
              className="block"
            >
              <h3 className='font-normal text-16'>{product?.name}</h3>
              <p className='text-red-800 my-1'>£{product?.price ? parseFloat(product?.price).toFixed(2) : '0.00'}</p>
            </Link>
            <div className='flex justify-center items-center gap-1 my-2'>
              {[1, 2, 3, 4, 5].map(i => (
                <i
                  key={i}
                  className={`ri-star-fill h-4 w-4 ${i <= product?.rating ? 'text-red-800' : 'text-gray-200'}`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
