"use client"

import Image from "next/image"
import Link from "next/link"
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import { useEffect, useState } from "react"
import { Divider, FormControl, Grid2, InputLabel, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel } from "@mui/material"
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import ColorSelector from "./ColorSelector"
import RelatedProductGrid from "./related-product"
import { addCart, getProductDetails } from "@/app/server/actions"
import { useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { addToCart } from "@/redux-store/slices/cart"

import { getSession, useSession } from "next-auth/react"
import { toast } from "react-toastify"



// Sample product images
// const productImages = [
//   "/images/pages/slider-img.jpg",
//   "/images/pages/product-img1.jpg",
//   "/images/pages/product-img1.jpg",
//   "/images/pages/product-img1.jpg",
//   "/images/pages/product-img1.jpg",
// ]

export default function ProductDetailPage() {

  const { lang: locale, id: productId } = useParams();
  const [product, setProduct] = useState(null)
  const { data: session, status } = useSession()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState("1")
  const [tiles, setTiles] = useState("10")
  const [pallets, setPallets] = useState("1")
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedFinish, setSelectedFinish] = useState("")
  const [pricingTier, setPricingTier] = useState("Tier 5")
  const [selectedVariation, setSelectedVariation] = useState(null)
  const [selectedAttributes, setSelectedAttributes] = useState({})
  const [error, setError] = useState('')
  const [calculatedValues, setCalculatedValues] = useState({
    sqm: 0,
    tiles: 0,
    pallets: 0
  })
  const [value, setValue] = useState('1')
  const [Tabvalue, setTabValue] = useState('1')
  const dispatch = useDispatch()
  const cart = useSelector(state => state.cartReducer);
  const [isClientOrder, setIsClientOrder] = useState(false)
  const [openPriceDialog, setOpenPriceDialog] = useState(false)
  const [customPrice, setCustomPrice] = useState("")
  const [priceError, setPriceError] = useState("")

  console.log('Current cart state:', cart);
  const fetchProductDetails = async () => {
    try {
      const response = await getProductDetails(productId)
      if (response?.success && response?.data) {
        setProduct(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error)
    }
  }
  const userId = '680b8ce6e2f902abe9cc790b'; // get it from auth/user context if dynamic


  useEffect(() => {
    if (productId) {
      fetchProductDetails()
    }
  }, [productId])
  useEffect(() => {
    if (product?.productVariations?.length > 0) {
      setSelectedVariation(product.productVariations[0])
    }
  }, [product])

  const handleVariationChange = (attributeId, variationId) => {
    // Step 1: Update the selectedAttributes with the selected variationId
    const newAttributes = { ...selectedAttributes, [attributeId]: variationId };
    setSelectedAttributes(newAttributes);

    console.log('Updated selected attributes:', newAttributes);

    // Step 2: Find the matching variation
    const matchingVariation = product.productVariations.find(variation => {
      const variationAttributes = variation.attributes;
      const selectedAttributeIds = Object.keys(newAttributes);

      if (variationAttributes.length !== selectedAttributeIds.length) {
        return false;
      }

      return variationAttributes.every(attrId => {
        const selectedVariationId = newAttributes[attrId];
        return variation.attributeVariations.includes(selectedVariationId);
      });
    });

    if (matchingVariation) {
      setSelectedVariation(matchingVariation);

      if (matchingVariation.variationImages?.length > 0) {
        setCurrentImageIndex(0);
      }
    } else {
      setSelectedVariation(null);
    }
  }


  // Update product images to use variation images
  const productImages =
    (selectedVariation?.variationImages?.length
      ? selectedVariation.variationImages.map(img => img.filePath)
      : product?.productFeaturedImage?.filePath
        ? [product.productFeaturedImage.filePath]
        : ["/images/pages/product-img1.jpg"]);


  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  const selectImage = (index) => {
    setCurrentImageIndex(index)
  }

  // Update pricing tier based on quantity
  const updatePricingTier = (qty) => {
    const numQty = Number.parseInt(qty) || 0

    if (numQty < 30) {
      setPricingTier("Tier 5")
    } else if (numQty < 75) {
      setPricingTier("Tier 4")
    } else if (numQty < 150) {
      setPricingTier("Tier 3")
    } else if (numQty < 1500) {
      setPricingTier("Tier 2")
    } else {
      setPricingTier("Tier 1")
    }
  }




  const handleChange = (event, newValue) => {
    setValue(newValue)
  }


  const handleTab = (event, newValue) => {
    setTabValue(newValue)
  }
  // Update price display
  const displayPrice = selectedVariation ? {
    minPrice: selectedVariation.regularPriceB2B,
    maxPrice: selectedVariation.regularPriceB2C
  } : {
    minPrice: product?.minPriceB2B,
    maxPrice: product?.maxPriceB2B
  }
  if (!product) {
    return <div>Loading product details...</div>
  }
  // Map of tiers to human-friendly names and quantity ranges
  const tierData = [
    {
      label: 'Over 1500 sq.m',
      tierKey: 'tierFirst',
      tierName: 'Tier 1',
    },
    {
      label: 'Under 150 - 1500 sq.m',
      tierKey: 'tierSecond',
      tierName: 'Tier 2',
    },
    {
      label: 'Under 75 - 153 sq.m',
      tierKey: 'tierThird',
      tierName: 'Tier 3',
    },
    {
      label: 'Under 30 - 75 sq.m',
      tierKey: 'tierFourth',
      tierName: 'Tier 4',
    },
    {
      label: 'Under 30 sq.m',
      tierKey: 'tierFifth',
      tierName: 'Tier 5',
    },
  ];



  const calculateValues = (type, value) => {
    if (!selectedVariation) {
      setError('Please select product variation first');
      return null;
    }

    // Use palletSize as tilesPerPallet
    const tilesPerPallet = selectedVariation.palletSize || 1;
    // Use sqmPerTile if available, else fallback to 1 to avoid division by 0
    const sqmPerTile = selectedVariation.sqmPerTile || 1;

    let newValues = { ...calculatedValues };

    switch (type) {
      case 'sqm':
        newValues = {
          sqm: parseFloat(value) || 0,
          tiles: Math.ceil((parseFloat(value) || 0) / sqmPerTile),
          pallets: Math.ceil(Math.ceil((parseFloat(value) || 0) / sqmPerTile) / tilesPerPallet)
        };
        break;
      case 'tiles':
        newValues = {
          sqm: (parseInt(value) || 0) * sqmPerTile,
          tiles: parseInt(value) || 0,
          pallets: Math.ceil((parseInt(value) || 0) / tilesPerPallet)
        };
        break;
      case 'pallets':
        newValues = {
          tiles: parseInt(value) * tilesPerPallet,
          sqm: (parseInt(value) * tilesPerPallet) * sqmPerTile,
          pallets: parseInt(value) || 0
        };
        break;
    }

    // Calculate the tier discount
    const sqm = newValues.sqm;
    let pricingTier;

    if (sqm > 1500) {
      pricingTier = 'tierFirst';
    } else if (sqm > 153) {
      pricingTier = 'tierSecond';
    } else if (sqm > 75) {
      pricingTier = 'tierThird';
    } else if (sqm > 30) {
      pricingTier = 'tierFourth';
    } else {
      pricingTier = 'tierFifth';
    }

    const tierData = selectedVariation.tierDiscount[pricingTier];
    if (tierData) {
      const { tierAddOn, tierMultiplyBy } = tierData;
      const calculatedPrice = tierAddOn + tierMultiplyBy * sqm;

      newValues.tier = pricingTier;
      newValues.calculatedPrice = calculatedPrice;
    }

    setCalculatedValues(newValues);
    updatePricingTier(newValues.sqm);

    return newValues;
  };

  const handleQuantityChange = (e) => {
    const values = calculateValues('sqm', e.target.value)

    console.log(values, 'values');

    if (values) {
      setQuantity(e.target.value)
      setTiles(values.tiles.toString())
      setPallets(values.pallets.toString())
    }
  }

  const handleTilesChange = (e) => {
    const values = calculateValues('tiles', e.target.value)
    if (values) {
      setQuantity(values.sqm.toString())
      setTiles(e.target.value)
      setPallets(values.pallets.toString())
    }
  }

  const handlePalletsChange = (e) => {
    const values = calculateValues('pallets', e.target.value)
    if (values) {
      setQuantity(values.sqm.toString())
      setTiles(values.tiles.toString())
      setPallets(e.target.value)
    }
  }

  const handleAddToCart = async () => {
    if (!selectedVariation) {
      setError('Please select product variation')
      return
    }

    if (!calculatedValues.sqm) {
      setError('Please enter quantity')
      return
    }

    if (calculatedValues.sqm > selectedVariation.stockQuantity) {
      setError('Not enough stock available')
      return
    }

    // If client order is enabled, show price dialog instead of adding to cart directly
    if (isClientOrder) {
      setCustomPrice(selectedVariation.regularPriceB2C.toString())
      setPriceError("")
      setOpenPriceDialog(true)
      return
    }

    const cartItem = {
      productId: product._id,
      variationId: selectedVariation._id,
      quantity: calculatedValues.sqm,
      numberOfTiles: calculatedValues.tiles,
      numberOfPallets: calculatedValues.pallets,
      attributes: selectedAttributes,
      price: selectedVariation.regularPriceB2C
    }

    try {
      const response = await addCart({ 
        items: cartItem,
        userId: session?.user?.id
      });
      
      if (response.success) {
        dispatch(addToCart(response.data))
        toast.success('Product added to cart successfully')
      } else {
        setError(response.message || 'Failed to add item to cart')
      }
    } catch (err) {
      setError('Error adding item to cart')
      console.error(err)
    }
  }

  const handleCustomPriceSubmit = async () => {
    const price = parseFloat(customPrice)
    
    // Validate price is within B2B and B2C range
    // if (price < selectedVariation.regularPriceB2B) {
    //   setPriceError(`Price cannot be lower than £${selectedVariation.regularPriceB2B}`)
    //   return
    // }
    // if (price > selectedVariation.regularPriceB2C) {
    //   setPriceError(`Price cannot be higher than £${selectedVariation.regularPriceB2C}`)
    //   return
    // }

    const cartItem = {
      productId: product._id,
      variationId: selectedVariation._id,
      quantity: calculatedValues.sqm,
      numberOfTiles: calculatedValues.tiles,
      numberOfPallets: calculatedValues.pallets,
      attributes: selectedAttributes,
      price: price,
      isCustomPrice: true
    }

    try {
      const response = await addCart({ 
        items: cartItem,
        userId: session?.user?.id
      });
      
      if (response.success) {
        dispatch(addToCart(response.data))
        toast.success('Product added to cart successfully')
        setOpenPriceDialog(false)
      } else {
        setError(response.message || 'Failed to add item to cart')
      }
    } catch (err) {
      setError('Error adding item to cart')
      console.error(err)
    }
  }

  // const cart = useSelector(state => state.cartReducer);
  // console.log('Current Cart:', cart);
  // 🟩 Calculate thresholds and map them to discounts
  const getDynamicTierData = () => {
    // const { tierDiscount } = selectedVariation;
    const { tierDiscount = {} } = selectedVariation || {};
    return Object.keys(tierDiscount).map((tierKey) => {
      const tierData = tierDiscount[tierKey];
      const threshold = tierData.tierAddOn * tierData.tierMultiplyBy;

      // 🟦 Extract dynamic discount from tierKey (example: "tierFirst" → 20%, etc.)
      const discountPercent = parseInt(tierKey.replace(/\D/g, '')) * 5 || 5;

      return {
        tier: tierKey,
        threshold,
        discountPercent
      };
    }).sort((a, b) => a.threshold - b.threshold); // 🟦 Sort by threshold ascending
  };

  const getNextTierMessage = (sqm) => {
    const tiers = getDynamicTierData();

    for (const tier of tiers) {
      if (sqm < tier.threshold) {
        const sqmNeeded = (tier.threshold - sqm).toFixed(2);
        return `Add ${sqmNeeded} sq.m more and you will get ${tier.discountPercent}% discount`;
      }
    }

    // If user already reached highest tier
    return 'You have unlocked the maximum discount!';
  };


  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}


      <main>


        <div className="container mx-auto px-4 py-8 mt-5">
          <div className="grid md:grid-cols-2 gap-8 mb-5">
            {/* Product Images */}
            <div>
              <div className="mb-4 relative p-4 bg-bgLight rounded-lg">
                <div className="relative aspect-square">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${productImages[currentImageIndex]}` || "/placeholder.svg"}
                    alt="Travertini Bianco Cross Cut"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full w-[30px] h-[30px] cursor-pointer"
                  onClick={prevImage}
                >
                  {/* <ChevronLeft className="h-5 w-5" /> */}
                  <i className="ri-arrow-left-s-line text-lg"></i>
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full w-[30px] h-[30px] cursor-pointer"
                  onClick={nextImage}
                >
                  {/* <ChevronRight className="h-5 w-5" /> */}
                  <i className="ri-arrow-right-s-line text-lg"></i>
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((image, i) => (
                  <div
                    key={i}
                    className={`border cursor-pointer rounded-md ${currentImageIndex === i ? "ring-2 ring-red-800" : ""}`}
                    onClick={() => selectImage(i)}
                  >
                    <div className="relative aspect-square">
                      <Image src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${image}` || "/placeholder.svg"} alt={`Travertini Bianco Cross Cut Thumbnail ${i + 1}`} fill className="object-cover rounded-md " />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-medium text-red-800">{product.name || ""}</h1>
              <p className="text-sm text-gray-600">From {product?.supplier?.companyName || ''}</p>

              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <i key={i} className="ri-star-fill fill-redText text-redText text-lg"></i>
                ))}
                <span className="text-sm text-gray-600 ml-1">3.5k Reviews</span>
              </div>

              <div className="mt-3 mb-4">
                <p className="text-md text-redText mb-3">£{displayPrice?.minPrice} - £{displayPrice?.maxPrice}/SQ.M</p>
                <p className="flex items-center gap-2 text-sm">
                  <span>Current Stock:</span>
                  <span className="text-green-600 font-medium"> {selectedVariation?.stockQuantity || ''} SQ.M</span>
                </p>
              </div>

              <p className="text-sm text-gray-600 my-4">
                {product?.shortDescription || ''}
              </p>

              <div className="my-6">
                <h3 className="font-normal mb-4">Pricing Tiers (inc. Shipping & Duties)</h3>
                <div className=" rounded-md overflow-hidden">
                  <table className="w-full text-sm border border-collapse border-bgLight">
                    <thead className="bg-bgLight">
                      <tr>
                        <th className="px-4 py-2 text-left font-normal text-black">Quantity Range</th>
                        <th className="px-4 py-2 text-left font-normal text-black">Pricing Tier</th>
                        <th className="px-4 py-2 text-left font-normal text-black">Retail Price/SQ.M</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVariation && tierData.map((tier) => {
                        const discount = selectedVariation?.tierDiscount?.[tier.tierKey];

                        // Example price calculation (you can adapt this logic as needed)
                        const price = discount.tierAddOn + discount.tierMultiplyBy;
                        return (
                          <tr key={tier.tierKey} className="border-t text-black/50">
                            <td className="px-4 py-2 border-r">{tier.label}</td>
                            <td className="px-4 py-2 border-r">{tier.tierName}</td>
                            <td className="px-4 py-2">£{price.toFixed(2)} (inc. VAT)</td>
                          </tr>
                        );
                      })}
                      {/* <tr className="border-t text-black/50">
                        <td className="px-4 py-2 border-r">Under 30 sq.m</td>
                        <td className="px-4 py-2 border-r">Tier 5</td>
                        <td className="px-4 py-2">£100.00 (inc. VAT)</td>
                      </tr>
                      <tr className="border-t text-black/50">
                        <td className="px-4 py-2 border-r">Under 30 - 75 sq.m</td>
                        <td className="px-4 py-2 border-r">Tier 4</td>
                        <td className="px-4 py-2">£90.00 (inc. VAT)</td>
                      </tr>
                      <tr className="border-t text-black/50">
                        <td className="px-4 py-2 border-r">Under 75 - 153 sq.m</td>
                        <td className="px-4 py-2 border-r">Tier 3</td>
                        <td className="px-4 py-2">£75.00 (inc. VAT)</td>
                      </tr>
                      <tr className="border-t text-black/50">
                        <td className="px-4 py-2 border-r">Under 150 - 1500 sq.m</td>
                        <td className="px-4 py-2 border-r">Tier 2</td>
                        <td className="px-4 py-2">£70.00 (inc. VAT)</td>
                      </tr>
                      <tr className="border-t text-black/50">
                        <td className="px-4 py-2 border-r">Over 1500 sq.m</td>
                        <td className="px-4 py-2 border-r">Tier 1</td>
                        <td className="px-4 py-2">£65.00 (inc. VAT)</td>
                      </tr> */}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="my-6">
                <h3 className="font-normal mb-4">Create Order Here</h3>

                <FormControlLabel
                  control={
                    <Switch
                      checked={isClientOrder}
                      onChange={(e) => setIsClientOrder(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Create Order for Client"
                  className="mb-4"
                />

                {/* <div>
                  <ColorSelector />
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {product?.attributes?.map(attributeId => {
                  // Get ALL variations for this attributeId
                  const attributeVariations = product.attributeVariations.filter(
                    av => av.productAttribute === attributeId
                  );

                  if (attributeVariations.length === 0) return null;

                  // Use the first variation to get the label (like 'size' or 'color')
                  const label = attributeVariations[0].metaKey;

                  return (
                    <div key={attributeId} className="flex flex-col mb-4">
                      <label htmlFor={`attribute-${attributeId}`} className="text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <Select
                        id={`attribute-${attributeId}`}
                        value={selectedAttributes[attributeId] || ''}
                        onChange={(e) => handleVariationChange(attributeId, e.target.value)}
                        displayEmpty
                        sx={{
                          backgroundColor: '#f4f0ed',
                          borderRadius: '10px'
                        }}
                      >
                        <MenuItem value="" disabled>
                          Select {label}
                        </MenuItem>
                        {attributeVariations.map(variation => (
                          <MenuItem key={variation._id} value={variation._id}>
                            {variation.metaValue}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                  );
                })}




                  <div className="bg-bgLight rounded-md px-4 py-2 flex items-center">
                    <span className="text-sm text-center w-full">{pricingTier}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-700 mb-1">Quantity / SQ.M</label>
                  <input
                    id="quantity"
                    type="text"
                    value={quantity}
                    placeholder="Enter SQ.M"
                    className="w-full outline-none h-auto bg-bgLight px-3 py-4 rounded-sm text-sm text-black"
                    onChange={handleQuantityChange}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="tiles" className="text-sm font-medium text-gray-700 mb-1">No. Of Tiles</label>
                  <input
                    id="tiles"
                    type="text"
                    value={tiles}
                    className="w-full outline-none h-auto bg-bgLight px-3 py-4 rounded-sm text-sm text-black"
                    onChange={handleTilesChange}
                    placeholder="No. Of Tiles"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="pallets" className="text-sm font-medium text-gray-700 mb-1">No. Of Pallets</label>
                  <input
                    id="pallets"
                    type="text"
                    className="w-full outline-none h-auto bg-bgLight px-3 py-4 rounded-sm text-sm text-black"
                    value={pallets}
                    onChange={handlePalletsChange}
                    placeholder="No. Of Pallets"
                  />
                </div>
              </div>


                {error && (
                  <div className="text-red-500 mb-4">{error}</div>
                )}
      

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="flex-1 bg-red-800 hover:bg-red-900 text-white" 
                    onClick={handleAddToCart}
                  >
                    <i className="ri-shopping-cart-line me-2 text-lg"></i>
                    {isClientOrder ? 'Create Client Order' : 'Add To Cart'}
                  </Button>
                  <Button 
                    variant='outlined' 
                    className="flex-1 border border-red-800 text-red-800 hover:bg-red-50"
                  >
                    <i className="ri-heart-line me-2 text-lg"></i>
                    Add To Wishlist
                  </Button>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center w-1/2 text-red-800">
                    <i className="ri-box-3-line"></i>
                    <span className="text-darkGrey">Nationwide Delivery Included</span>
                  </div>

                  {/* <div className="flex items-center w-1/2 rounded-sm text-redText bg-redText/25 px-4 py-2">
                    <i className="ri-discount-percent-line me-1"></i>
                    Add 10.08 sq.m more to unlock 5% off
                  </div> */}
                  {calculatedValues?.sqm !== undefined && (
                    <div className="flex items-center w-1/2 rounded-sm text-redText bg-redText/25 px-4 py-2">
                      <i className="ri-discount-percent-line me-1"></i>
                      {getNextTierMessage(calculatedValues.sqm)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          <Divider className="mb-12" />




          {/* <h1 className="text-lg font-semibold text-gray-900 mb-5">Get the Best Deal for I travertini bianco cross cut</h1>


          <Grid2 container spacing={2} className="mb-12">
            <Grid2 size={{ xs: 12, md: 6 }}>
              <div className="bg-slate-50 rounded-2xl border border-red-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
                <div className="flex gap-4 items-center flex-col md:flex-row">
                  <div className="flex gap-4 items-center w-full">
                    <div className="flex-shrink-0">
                      <div className="w-35 h-35 rounded-lg overflow-hidden ">
                        <Image
                          src={"/images/pages/slider-img.jpg"}
                          alt=""
                          width={124}
                          height={124}
                          className="w-full h-full object-cover align-middle"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 ">
                      <h3 className="font-semibold  text-sm mb-1 leading-tight  text-red-800">Travertini Bianco Cross Cut</h3>
                      <p className="font-normal text-gray-600 text-sm mb-1">Store Name Here</p>

                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <i key={i} className="ri-star-fill fill-redText text-redText text-sm"></i>
                        ))}
                        <span className="text-sm font-normal text-gray-900 ml-1">3.2k Reviews</span>
                      </div>

                      <div className="text-sm font-semibold text-red-800 mb-3">£55.00 - £90.00/SQ.M</div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button variant="text" className="flex items-center gap-1 text-gray-700 hover:bg-red-800 hover:text-white transition-colors">
                      <span className="text-sm font-medium">Shop Now</span>
                      <i className="ri-arrow-right-s-line text-sm"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <div className="bg-slate-50 rounded-2xl border border-red-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
                <div className="flex gap-4 items-center flex-col md:flex-row">
                  <div className="flex gap-4 items-center w-full">
                  <div className="flex-shrink-0">
                    <div className="w-35 h-35 rounded-lg overflow-hidden ">
                      <Image
                        src={"/images/pages/slider-img.jpg"}
                        alt=""
                        width={124}
                        height={124}
                        className="w-full h-full object-cover align-middle"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 ">
                    <h3 className="font-semibold  text-sm mb-1 leading-tight  text-red-800">Rock Pattern Tiles</h3>
                    <p className="font-normal text-gray-600 text-sm mb-1">Store Name Here</p>

                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <i key={i} className="ri-star-fill fill-redText text-redText text-sm"></i>
                      ))}
                      <span className="text-sm font-normal text-gray-900 ml-1">3.2k Reviews</span>
                    </div>

                    <div className="text-sm font-semibold text-red-800 mb-3">£55.00 - £90.00/SQ.M</div>
                  </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button variant="text" className="flex items-center gap-1 text-gray-700 hover:bg-red-800 hover:text-white transition-colors">
                      <span className="text-sm font-medium">Shop Now</span>
                      <i className="ri-arrow-right-s-line text-sm"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </Grid2>
          </Grid2> */}

          <TabContext value={Tabvalue}>
            <TabList
              onChange={handleTab}
              aria-label="simple tabs example"
              TabIndicatorProps={{ style: { display: 'none' } }}
            >
              <Tab
                value="1"
                label="Additional Information"
                className={
                  `${Tabvalue === '1'
                    ? 'bg-red-800 hover:bg-black text-white [border-top-left-radius:10px] [border-top-right-radius:10px] [border-bottom-left-radius:0] [border-bottom-right-radius:0]'
                    : 'rounded-md'} px-4 py-2 flex items-center gap-2 capitalize font-montserrat text-15`
                }


                disableRipple
                disableFocusRipple
              />
              <Tab
                value="2"
                label="Technical Details"
                className={
                  `${Tabvalue === '2'
                    ? 'bg-red-800 hover:bg-black text-white [border-top-left-radius:10px] [border-top-right-radius:10px] [border-bottom-left-radius:0] [border-bottom-right-radius:0]'
                    : 'rounded-md'} px-4 py-2 flex items-center gap-2 capitalize font-montserrat text-15`
                }
                disableRipple
                disableFocusRipple
              />
              <Tab
                value="3"
                label="Reviews"
                className={
                  `${Tabvalue === '3'
                    ? 'bg-red-800 hover:bg-black text-white [border-top-left-radius:10px] [border-top-right-radius:10px] [border-bottom-left-radius:0] [border-bottom-right-radius:0]'
                    : 'rounded-md'} px-4 py-2 flex items-center gap-2 capitalize font-montserrat text-15`
                }
                disableRipple
                disableFocusRipple
              />
            </TabList>

            <TabPanel value='1' className="border [border-bottom-left-radius:10px] [border-bottom-right-radius:10px] p-4">

              {product?.description ?? ''}
              
              

            </TabPanel>
            <TabPanel value='2' className="border [border-bottom-left-radius:10px] [border-bottom-right-radius:10px] p-4">
              <div className="grid md:grid-cols-2 gap-8 ">
                <div>
                  <h3 className="font-medium mb-4 text-redText">Technical Specifications</h3>
                  <ul className="text-sm space-y-4 list-none p-0">
                    <li>
                      <span className="font-medium">SKU:</span> {product.sku}
                    </li>
                    <li>
                      <span className="font-medium">Name:</span> {product.name}
                    </li>
                    <li>
                      <span className="font-medium">Description:</span> {product.description}
                    </li>
                    <li>
                      <span className="font-medium">Stock Status:</span> {product.stockStatusLabel}
                    </li>
                    <li>
                      <span className="font-medium">Status:</span> {product.statusLabel}
                    </li>
                    <li>
                      <span className="font-medium">Min Price (B2B):</span> {product.minPriceB2B}
                    </li>
                    <li>
                      <span className="font-medium">Max Price (B2B):</span> {product.maxPriceB2B}
                    </li>
                    {/* <li>
                      <span className="font-medium">Min Price (B2C):</span> {product.minPriceB2C}
                    </li>
                    <li>
                      <span className="font-medium">Max Price (B2C):</span> {product.maxPriceB2C}
                    </li> */}

                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-4 text-redText">Product Variations</h3>
                  {product.productVariations.map((variation) => (
                    <div key={variation._id} className="mb-4 border p-2 rounded">
                      <p><span className="font-medium">Description:</span> {variation.description}</p>
                      <p><span className="font-medium">Stock Quantity:</span> {variation.stockQuantity}</p>
                      <p><span className="font-medium">Weight:</span> {variation.weight} kg</p>
                      <p><span className="font-medium">Regular Price (B2B):</span> {variation.regularPriceB2B}</p>
                      <p><span className="font-medium">Regular Price (B2C):</span> {variation.regularPriceB2C}</p>
                      <p><span className="font-medium">Sale Price:</span> {variation.salePrice}</p>
                      <p><span className="font-medium">Pallet Size:</span> {variation.palletSize}</p>
                      <p><span className="font-medium">Box Size:</span> {variation.boxSize}</p>
                      <p><span className="font-medium">Number of Tiles:</span> {variation.numberOfTiles}</p>
                      <p><span className="font-medium">Dimensions (L×W×H):</span> {variation.dimensions.length}×{variation.dimensions.width}×{variation.dimensions.height}</p>
                      {variation.variationImages.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium">Variation Image:</span>
                          <img
                            src={variation.variationImages[0].filePath}
                            alt="Variation"
                            className="mt-1 w-32 h-32 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <h3 className="font-medium mb-4 text-redText">Applications</h3>
                  <ul className="text-sm space-y-4 list-none p-0">
                    {product.categories.map((category) => (
                      <li key={category._id} >{category?.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabPanel>
            <TabPanel value='3' className="border [border-bottom-left-radius:10px] [border-bottom-right-radius:10px] p-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i key={i} className="ri-star-fill fill-redText text-redText"></i>
                  ))}
                </div>
                <span className="text-lg">4.8 out of 5 (126 reviews)</span>
              </div>

              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className={`ri-star-fill text-sm ${star <= 5 - (i % 2) ? "fill-redText text-redText" : "fill-gray-200 text-gray-200"}`}></i>
                        ))}
                      </div>
                      <span className="text-sm font-medium">John D.</span>
                      <span className="text-xs text-gray-500">Verified Purchase</span>
                    </div>
                    <p className="text-sm">
                      Beautiful tiles that transformed our bathroom. The quality is excellent and they look even better in
                      person than in the photos.
                    </p>
                  </div>
                ))}
              </div>
            </TabPanel>
          </TabContext>


          <div className="mt-12">
            <h2 className="text-2xl font-medium text-red-800 mb-6 text-center">More Products</h2>
            {/* <RelatedProductGrid products={product?.associatedProduct} /> */}
            {/* <RelatedProductGrid products={product?.associatedProducts || []} /> */}

          </div>
        </div>

      </main>

      {/* Custom Price Dialog */}
      <Dialog open={openPriceDialog} onClose={() => setOpenPriceDialog(false)}>
        <DialogTitle>Set Custom Price</DialogTitle>
        <DialogContent>
          <div className="mt-2 mb-4 text-sm text-gray-600">
            Price range: £{selectedVariation?.regularPriceB2B} - £{selectedVariation?.regularPriceB2C}
          </div>
          <TextField
            autoFocus
            margin="dense"
            label="Custom Price"
            type="number"
            fullWidth
            value={customPrice}
            onChange={(e) => {
              setCustomPrice(e.target.value)
              setPriceError("")
            }}
            error={!!priceError}
            helperText={priceError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPriceDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCustomPriceSubmit} color="primary">
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  )
}

