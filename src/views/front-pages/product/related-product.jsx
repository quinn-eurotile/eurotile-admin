import Image from "next/image"
import Link from "next/link"
import Button from '@mui/material/Button'
import { useParams } from "next/navigation";
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useState } from 'react'

export default function RelatedProductGrid({ products }) {
  const { lang: locale } = useParams();
  const [loaded, setLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [details, setDetails] = useState()

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      slideChanged: slider => setCurrentSlide(slider.track.details.rel),
      created: () => setLoaded(true),
      detailsChanged: s => setDetails(s.track.details),
      slides: {
        perView: 4,
        spacing: 24
      },
      breakpoints: {
        '(max-width: 1200px)': {
          slides: {
            perView: 3,
            spacing: 24
          }
        },
        '(max-width: 900px)': {
          slides: {
            perView: 2,
            spacing: 24
          }
        },
        '(max-width: 600px)': {
          slides: {
            perView: 1,
            spacing: 24
          }
        }
      }
    },
    [
      slider => {
        let timeout
        const mouseOver = false
        function clearNextTimeout() {
          clearTimeout(timeout)
        }
        function nextTimeout() {
          clearTimeout(timeout)
          if (mouseOver) return
          timeout = setTimeout(() => {
            slider.next()
          }, 3000)
        }
        slider.on('created', nextTimeout)
        slider.on('dragStarted', clearNextTimeout)
        slider.on('animationEnded', nextTimeout)
        slider.on('updated', nextTimeout)
      }
    ]
  )

  if (!products || products.length === 0) {
    return <div>No related products available.</div>;
  }
  return (
    <div className="relative">
      <div ref={sliderRef} className="keen-slider">
        {products?.map((product) => {
          const imageSrc = product?.productFeaturedImage
            ? `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${product?.productFeaturedImage?.filePath}`
            : "/placeholder.svg";
          const price = product?.productVariations?.[0]?.regularPriceB2B || 0.0;
          const variationId = product?.productVariations?.[0]?._id || null;
          return (
            <div className="keen-slider__slide group" key={product._id}>
              <Link rel='noopener noreferrer' href={{
                pathname: `/${locale}/products/${product?.id}`,
                query: { vid: variationId }
              }}
                className="block p-2 bg-bgLight rounded-lg mb-3">
                <div className="relative aspect-[1/1] overflow-hidden rounded-md">
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="text-center">
                <Link rel='noopener noreferrer' href={{
                  pathname: `/${locale}/products/${product?.id}`,
                  query: { vid: variationId }
                }}
                  className="block">
                  <h3 className="font-normal text-16">{product.name}</h3>
                  <p className="text-red-800 my-1">£{price}</p>
                </Link>
                <div className="flex justify-center items-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i
                      key={i}
                      className={`ri-star-fill h-4 w-4 ${i <= product.rating ? "text-red-800" : "text-gray-200"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {loaded && instanceRef.current && (
        <>
          <button
            onClick={e => instanceRef.current?.prev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full shadow p-2 hover:bg-red-800 hover:text-white"
            aria-label="Previous"
          >
            <i className="ri-arrow-left-s-line text-2xl"></i>
          </button>
          <button
            onClick={e => instanceRef.current?.next()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full shadow p-2 hover:bg-red-800 hover:text-white"
            aria-label="Next"
          >
            <i className="ri-arrow-right-s-line text-2xl"></i>
          </button>
        </>
      )}
    </div>
  )
}
