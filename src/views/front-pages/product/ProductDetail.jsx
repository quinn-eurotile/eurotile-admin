"use client";

import Image from "next/image";
import Link from "next/link";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import { useEffect, useState, useRef } from "react";
import { Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, Grid2, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Tooltip } from "@mui/material";
import Tab from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import Typography from '@mui/material/Typography';
import ColorSelector from "./ColorSelector";
import RelatedProductGrid from "./related-product";
import { addCart, getProductDetails } from "@/app/server/actions";
import { useParams, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux-store/slices/cart";

import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { calculateNewVariantTierValue, calculateTierValue, convertSlugToName } from "@/components/common/helper";
import CircularLoader from "@/components/common/CircularLoader";
import axios from "axios";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// OUTSIDE the component
const calculateImageSize = async (variation, backendDomain) => {
  if (!variation || !variation.variationImages || variation.variationImages.length === 0) {
    return null;
  }
  let totalSize = 0;
  for (const img of variation.variationImages) {
    const url = `${backendDomain}${img.filePath}`;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const size = response.headers.get('content-length');
      if (size) totalSize += parseInt(size, 10);
    } catch (err) {
      // ignore errors for size
    }
  }
  return (totalSize / (1024 * 1024)).toFixed(1);
};

function ProductImageZoom({ src, alt }) {
  const sourceRef = useRef(null);
  const targetRef = useRef(null);
  const containerRef = useRef(null);

  const [opacity, setOpacity] = useState(0);
  const [offset, setOffset] = useState({ left: 0, top: 0 });

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  const handleMouseMove = (e) => {
    const targetRect = targetRef.current.getBoundingClientRect();
    const sourceRect = sourceRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const xRatio = (targetRect.width - containerRect.width) / sourceRect.width;
    const yRatio = (targetRect.height - containerRect.height) / sourceRect.height;

    const left = Math.max(Math.min(e.pageX - sourceRect.left, sourceRect.width), 0);
    const top = Math.max(Math.min(e.pageY - sourceRect.top, sourceRect.height), 0);

    setOffset({
      left: left * -xRatio,
      top: top * -yRatio
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square overflow-hidden rounded-md border border-primary"
      style={{ width: "100%", height: "100%", cursor: "zoom-in" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Main image */}
      <img
        ref={sourceRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        draggable={false}
      />
      {/* Zoomed image */}
      <img
        ref={targetRef}
        src={src}
        alt={alt}
        style={{
          position: "absolute",
          left: offset.left,
          top: offset.top,
          width: "200%",
          height: "200%",
          opacity: opacity,
          pointerEvents: "none",
          transition: "opacity 0.2s"
        }}
        draggable={false}
      />
    </div>
  );
}

export default function ProductDetailPage() {

  const router = useRouter();
  const { lang: locale, id: productId } = useParams();
  const searchParams = useSearchParams();
  const [vid, setVid] = useState(searchParams.get('vid'));
  const [product, setProduct] = useState(null);
  const { data: session, status } = useSession();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState();
  const [tiles, setTiles] = useState();
  const [pallets, setPallets] = useState();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFinish, setSelectedFinish] = useState("");
  const [pricingTier, setPricingTier] = useState("Tier 5");
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [error, setError] = useState('');
  const [calculatedValues, setCalculatedValues] = useState({
    sqm: 1,
    tiles: 0,
    pallets: 0
  });
  const [value, setValue] = useState('1');
  const [Tabvalue, setTabValue] = useState('1');
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cartReducer);
  const [isClientOrder, setIsClientOrder] = useState(false);
  const [openPriceDialog, setOpenPriceDialog] = useState(false);
  const [customPrice, setCustomPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [selectedVariations, setSelectedVariations] = useState([]);

  const [openSampleDialog, setOpenSampleDialog] = useState(false);
  const [selectedSamples, setSelectedSamples] = useState({
    small: false,
    large: false,
    full: false
  });

  const [quantityError, setQuantityError] = useState('');
  const [tilesError, setTilesError] = useState('');
  const [palletsError, setPalletsError] = useState('');

  const [zipSizeMB, setZipSizeMB] = useState(null);

  const fetchProductDetails = async () => {
    try {
      const response = await getProductDetails(productId);
      console.log(response, 'responseresponseresponseresponse')
      if (response?.success && response?.data) {
        setProduct(response.data);

        // If vid is not present, select first option for each attribute variation
        if (!vid && response.data.attributes) {
          const initialSelections = {};
          response.data.attributes.forEach(attributeId => {
            const variations = response.data.attributeVariations.filter(
              av => av.productAttribute === attributeId
            );
            if (variations.length > 0) {
              initialSelections[attributeId] = variations[0]._id;
            }
          });
          setSelectedAttributes(initialSelections);
        }

        // If vid is present, find and set the selected variation
        if (vid) {
          const variation = response.data.productVariations.find(v => v._id === vid);
          if (variation) {
            setSelectedVariation(variation);
            // Set selected attributes based on the variation
            const initialSelections = {};
            variation.attributeVariations.forEach(attrVarId => {
              const attrVar = response.data.attributeVariations.find(av => av._id === attrVarId);
              if (attrVar) {
                initialSelections[attrVar.productAttribute] = attrVarId;
              }
            });
            setSelectedAttributes(initialSelections);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId, vid]);

  // Remove the automatic selection of first variation if vid is present
  useEffect(() => {
    if (product?.productVariations?.length > 0 && !vid) {
      setSelectedVariation(product.productVariations[0]);
    }
  }, [product, vid]);

  useEffect(() => {
    // Update vid when URL changes
    setVid(searchParams.get('vid'));
  }, [searchParams]);

  useEffect(() => {
    calculateImageSize(selectedVariation, process.env.NEXT_PUBLIC_BACKEND_DOMAIN)
      .then(size => setZipSizeMB(size));
  }, [selectedVariation]);

  const handleVariationChange = (attributeId, variationId) => {
    // Step 1: Update the selectedAttributes with the selected variationId
    const newAttributes = { ...selectedAttributes, [attributeId]: variationId };
    setSelectedAttributes(newAttributes);

    // Step 2: Find the matching variation
    const matchingVariation = product?.productVariations?.find(variation => {
      // Check if all selected attributes match the variation's attribute variations
      return variation.attributeVariations.every(attrVarId => {
        // Find the attribute variation in the product's attribute variations
        const attrVar = product.attributeVariations.find(av => av._id === attrVarId);
        if (!attrVar) return false;

        // Check if this attribute variation is selected
        return newAttributes[attrVar.productAttribute] === attrVarId;
      });
    });

    if (matchingVariation) {
      setSelectedVariation(matchingVariation);
      setCurrentImageIndex(0);
      if (matchingVariation.regularPriceB2B) {
        updatePricingTier(quantity);
      }
      if (calculatedValues.sqm > 0) {
        calculateValues('sqm', calculatedValues.sqm);
      }
      // Update the URL search params with the selected variation id
      const params = new URLSearchParams(window.location.search);
      params.set('vid', matchingVariation._id);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    } else {
      setSelectedVariation(null);
    }
  };

  // Update pricing tier based on quantity
  const updatePricingTier = (qty) => {
    if (!selectedVariation) return;

    const numQty = Number.parseFloat(qty) || 0;

    if (numQty >= 1300) {
      setPricingTier("Tier 1");
    } else if (numQty >= 153) {
      setPricingTier("Tier 2");
    } else if (numQty >= 51) {
      setPricingTier("Tier 3");
    } else if (numQty >= 30) {
      setPricingTier("Tier 4");
    } else {
      setPricingTier("Tier 5");
    }
  };

  // Update product images to use variation images
  const productImages = selectedVariation?.variationImages?.length
    ? selectedVariation.variationImages.map(img => img.filePath)
    : product?.productFeaturedImage?.filePath
      ? [product.productFeaturedImage.filePath]
      : ["/placeholder.svg"];

  // console.log('selectedVariation', selectedVariation);
  // console.log('productImages', productImages);
  // Update product images to use variation images
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  const handleTab = (event, newValue) => {
    setTabValue(newValue);
  };
  // Update price display
  const displayPrice = selectedVariation ? {
    minPrice: selectedVariation.regularPriceB2B,
    maxPrice: selectedVariation.regularPriceB2C
  } : {
    minPrice: product?.minPriceB2B,
    maxPrice: product?.maxPriceB2B
  };

  if (!product) {
    return <CircularLoader />;
  }
  // Map of tiers to human-friendly names and quantity ranges
  const tierData = [
    {
      label: 'Over 1300 sq.m',
      tierKey: 'tierFirst',
      tierName: 'Tier 1',
    },
    {
      label: '153 - 1300 sq.m',
      tierKey: 'tierSecond',
      tierName: 'Tier 2',
    },
    {
      label: '51 - 153 sq.m',
      tierKey: 'tierThird',
      tierName: 'Tier 3',
    },
    {
      label: '30 - 51 sq.m',
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

    // Get values from the selected variation
    const sqmPerTile = parseFloat(selectedVariation.sqmPerTile) || 1;
    const tilesPerBox = parseFloat(selectedVariation.numberOfTiles) || 1;

    let newValues = { ...calculatedValues };

    switch (type) {
      case 'sqm':
        // Calculate number of tiles needed to cover the square meters
        const tiles = Math.ceil(parseFloat(value) / sqmPerTile);
        // Calculate number of boxes needed
        const boxes = Math.ceil(tiles / tilesPerBox);

        newValues = {
          sqm: parseFloat(value) || 0,
          tiles: tiles,
          pallets: boxes // We're using pallets field to store boxes count
        };
        break;

      case 'tiles':
        // Calculate square meters from tiles
        const sqmFromTiles = parseFloat(value) * sqmPerTile;
        // Calculate number of boxes needed
        const boxesFromTiles = Math.ceil(parseFloat(value) / tilesPerBox);

        newValues = {
          sqm: sqmFromTiles,
          tiles: parseFloat(value) || 0,
          pallets: boxesFromTiles // We're using pallets field to store boxes count
        };
        break;

      case 'pallets': // This case is for boxes input
        // Calculate number of tiles from boxes
        const tilesFromBoxes = parseFloat(value) * tilesPerBox;
        // Calculate square meters from tiles
        const sqmFromBoxes = tilesFromBoxes * sqmPerTile;

        newValues = {
          sqm: sqmFromBoxes,
          tiles: tilesFromBoxes,
          pallets: parseFloat(value) || 0 // We're using pallets field to store boxes count
        };
        break;
    }

    // Calculate the tier discount
    const sqm = newValues.sqm;
    let pricingTier;
    let pricePerSqm;

    if (sqm >= 1300) {
      pricingTier = 'tierFirst';
    } else if (sqm >= 153) {
      pricingTier = 'tierSecond';
    } else if (sqm >= 51) {
      pricingTier = 'tierThird';
    } else if (sqm >= 30) {
      pricingTier = 'tierFourth';
    } else {
      pricingTier = 'tierFifth';
    }

    const tierData = selectedVariation.tierDiscount[pricingTier];
    if (tierData) {
      const { tierAddOn, tierMultiplyBy } = tierData;
      // Calculate price per sqm for this tier
      pricePerSqm = calculateTierValue(
        selectedVariation.purchasedPrice,
        1.17,
        tierAddOn,
        tierMultiplyBy
      );
    } else {
      // If no tier data, use regular price
      pricePerSqm = selectedVariation.regularPriceB2C;
    }

    newValues.tier = pricingTier;
    newValues.pricePerSqm = pricePerSqm;
    newValues.calculatedPrice = pricePerSqm * sqm;

    setCalculatedValues(newValues);
    updatePricingTier(newValues.sqm);

    return newValues;
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);

    if (!value || value <= 0) {
      setQuantityError('Quantity (SQ.M) is required');
    } else {
      setQuantityError('');
      const values = calculateValues('sqm', value);
      if (values) {
        setTiles(values.tiles.toString());
        setPallets(values.pallets.toString());
      }
    }
  };

  const handleTilesChange = (e) => {
    const value = e.target.value;
    setTiles(value);

    if (!value || value <= 0) {
      setTilesError('Number of Tiles is required');
    } else {
      setTilesError('');
      const values = calculateValues('tiles', value);
      if (values) {
        setQuantity(values.sqm.toString());
        setPallets(values.pallets.toString());
      }
    }
  };

  const handlePalletsChange = (e) => {
    const value = e.target.value;
    setPallets(value);

    if (!value || value <= 0) {
      setPalletsError('Boxes is required');
    } else {
      setPalletsError('');
      const values = calculateValues('pallets', value);
      if (values) {
        setQuantity(values.sqm.toString());
        setTiles(values.tiles.toString());
      }
    }
  };

  const handleAddVariation = () => {
    if (!selectedVariation) {
      setError('Please select product variation');
      return;
    }

    if (!calculatedValues.sqm) {
      setError('Please enter quantity');
      return;
    }

    // Check if number of boxes exceeds stock quantity
    if (calculatedValues.pallets > selectedVariation.stockQuantity) {
      setError(`Not enough stock available. Only ${selectedVariation.stockQuantity} boxes in stock.`);
      return;
    }

    // Create new variation entry
    const newVariation = {
      variation: selectedVariation,
      quantity: calculatedValues.sqm,
      numberOfTiles: calculatedValues.tiles,
      numberOfPallets: calculatedValues.pallets,
      attributes: selectedAttributes,
      price: calculatedValues.pricePerSqm,
      totalPrice: calculatedValues.calculatedPrice
    };

    setSelectedVariations([...selectedVariations, newVariation]);

    // Reset form
    // setQuantity("1");
    // setTiles("10");
    // setPallets("1");
    setSelectedAttributes({});
    setCalculatedValues({
      sqm: 0,
      tiles: 0,
      pallets: 0
    });
    setError('');
  };

  const handleRemoveVariation = (index) => {
    const newVariations = [...selectedVariations];
    newVariations.splice(index, 1);
    setSelectedVariations(newVariations);
  };

  const handleAddToCart = async () => {
    // Skip quantity validation if it's a sample order
    if (!openSampleDialog) {
      // Validate quantity first
      if (!quantity || quantity <= 0) {
        setQuantityError('Please enter a valid quantity');
        return;
      }

      if (selectedVariations.length === 0 && !selectedVariation) {
        setError('Please select at least one variation');
        return;
      }

      // If there are no saved variations but current selection exists
      if (selectedVariations.length === 0 && selectedVariation) {
        if (!calculatedValues.sqm) {
          setQuantityError('Please enter a valid quantity');
          return;
        }

        // Check if number of boxes exceeds stock quantity
        if (calculatedValues.pallets > selectedVariation.stockQuantity) {
          setError(`Not enough stock available. Only ${selectedVariation.stockQuantity} boxes in stock.`);
          return;
        }
      }
    }

    // If client order is enabled, show price dialog
    if (isClientOrder) {
      setCustomPrice(calculatedValues.pricePerSqm.toString());
      setPriceError("");
      setOpenPriceDialog(true);
      return;
    }

    try {
      // Prepare cart items
      let cartItems = [];

      if (!openSampleDialog) {
        // Add saved variations
        selectedVariations.forEach(variation => {
          cartItems.push({
            productId: product._id,
            variationId: variation.variation._id,
            quantity: variation.quantity,
            numberOfTiles: variation.numberOfTiles,
            numberOfPallets: variation.numberOfPallets,
            attributes: variation.attributes,
            price: variation.price,
            isSample: false,
            sampleAttributes: null
          });
        });

        // Add current selection if exists
        if (selectedVariation && calculatedValues.sqm) {
          cartItems.push({
            productId: product._id,
            variationId: selectedVariation._id,
            quantity: calculatedValues.sqm,
            numberOfTiles: calculatedValues.tiles,
            numberOfPallets: calculatedValues.pallets,
            attributes: selectedAttributes,
            price: calculatedValues.pricePerSqm,
            isSample: false,
            sampleAttributes: null
          });
        }
      }

      // Add selected samples if any
      const selectedTypes = Object.entries(selectedSamples)
        .filter(([_, isSelected]) => isSelected)
        .map(([type]) => type);

      selectedTypes.forEach(type => {
        const sampleInfo = sampleData[type];
        const samplePrice = type === 'small' && sampleInfo.freePerMonth ? 0 : sampleInfo.price;

        cartItems.push({
          productId: product._id,
          variationId: selectedVariation?._id,
          quantity: 1,
          numberOfTiles: 0,
          numberOfPallets: 0,
          attributes: {
            size: type === 'small' ? '15x15cm' : type === 'large' ? '60x60cm' : 'Full Size',
            type: type
          },
          price: samplePrice,
          isSample: true,
          sampleAttributes: {
            size: type === 'small' ? '15x15cm' : type === 'large' ? '60x60cm' : 'Full Size',
            type: type,
            price: samplePrice
          }
        });
      });

      const response = await addCart({
        items: cartItems,
        userId: session?.user?.id
      });

      if (response.success) {
        dispatch(addToCart(response.data));
        toast.success('Products added to cart successfully');
        router.push('/' + locale + '/checkout');
        setSelectedVariations([]); // Clear selections after successful add
        setSelectedSamples({ // Clear sample selections
          small: false,
          large: false,
          full: false
        });
        setOpenSampleDialog(false);
      } else {
        setError(response.message || 'Failed to add items to cart');
      }
    } catch (err) {
      setError('Error adding items to cart');
      console.error(err);
    }
  };
  const convertSlugToName = (slug) => {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };
  // const cart = useSelector(state => state.cartReducer);
  // // console.log('Current Cart:', cart);
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

  const handleSampleChange = (type) => {
    setSelectedSamples(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Parse sample data from product
  const sampleData = product?.samples ?
    (typeof product.samples === 'string' ? JSON.parse(product.samples) : product.samples)
    : null;

  const selected = selectedVariation || {};

  // Helper to download all images for the selected variant as a zip
  const handleDownloadImages = async () => {
    if (!selectedVariation || !selectedVariation.variationImages || selectedVariation.variationImages.length === 0) {
      toast.error('No images found for this variant.');
      return;
    }
    const zip = new JSZip();
    let totalSize = 0;
    for (const img of selectedVariation.variationImages) {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${img.filePath}`;
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        totalSize += blob.size;
        zip.file(img.fileName || 'image.jpg', blob);
      } catch (err) {
        toast.error('Failed to fetch image: ' + (img.fileName || 'image'));
      }
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setZipSizeMB((zipBlob.size / (1024 * 1024)).toFixed(1));
    saveAs(zipBlob, `${product?.name || 'images'}-variant.zip`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}


      <main>


        <div className="container mx-auto px-4 py-8 mt-5">
          <div className="grid md:grid-cols-2 gap-8 mb-5">
            {/* Product Images */}
            <div>
              <div className="mb-4 relative p-4 bg-bgLight rounded-md">
                <ProductImageZoom
                  src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${productImages[currentImageIndex]}` || "/placeholder.svg"}
                  alt={product?.name || "Product image"}
                />
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full w-[30px] h-[30px] cursor-pointer"
                  onClick={prevImage}
                >
                  <i className="ri-arrow-left-s-line text-lg"></i>
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full w-[30px] h-[30px] cursor-pointer"
                  onClick={nextImage}
                >
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

              <div className="bg-errorLighter border-b-2 flex items-center justify-between mt-10 px-3 rounded">
                <h4 className="font-normal uppercase">high resolution image pack</h4>
                <p className="text-sm text-red-800 my-4 flex items-center gap-2">
                  <button type="button" onClick={handleDownloadImages} className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900">
                    Download Images{zipSizeMB ? ` (${zipSizeMB} MB)` : ''}
                  </button>
                </p>
              </div>

              {product?.productVariations.length > 1 && (

                <div className="mt-10">
                  <h3 className="text-lg font-medium text-black-800 mb-5">
                    Other Colors Available In <strong> {product?.categories?.map(cat => cat.name).join(', ')} Collection </strong>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product?.productVariations
                      ?.filter(variation => variation._id !== vid) // Use _id instead of id
                      ?.map((variation, i) => {
                        if (!variation.variationImages?.[0]) return null;
                        // Find the color attribute variation for this variation
                        const colorAttrVar = variation.attributeVariationsDetail?.find(
                          av => av.metaKey?.toLowerCase() === 'color'
                        );
                        return (
                          <div key={variation._id} className="flex flex-col items-center">
                            <div
                              className={`border cursor-pointer rounded-md ${currentImageIndex === i ? "ring-2 ring-red-800" : ""}`}
                              onClick={() => {
                                router.push(`/${locale}/products/${product?._id}?vid=${variation._id}`);
                                setVid(variation._id);
                              }}
                            >
                              <div className="relative w-[80px] h-[80px]">
                                <Image
                                  width={80}
                                  height={80}
                                  src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${variation.variationImages[0].filePath}` || "/placeholder.svg"}
                                  alt={`Variation ${i + 1}`}
                                  className="object-cover rounded-md w-full h-full"
                                />
                              </div>
                            </div>
                            {colorAttrVar && (
                              <div className="text-xs text-center mt-2 font-medium text-gray-700">
                                {colorAttrVar.metaValue}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}



            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-medium text-red-800">{product.name || ""}</h1>
              <p className="text-sm text-gray-600">
                From:{" "}
                <Link
                  href={{
                    pathname: `/${locale}/products`,
                    query: { supplier: product?.supplier?._id }
                  }}
                  className="underline hover:text-primary cursor-pointer"
                >
                  {product?.supplier?.companyName || ''}
                </Link>
              </p>

              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <i key={i} className="ri-star-fill fill-redText text-redText text-lg"></i>
                ))}
                <span className="text-sm text-gray-600 ml-1">3.5k Reviews</span>
              </div>

              {/* <div className="mt-3 mb-4">
                <p className="text-md text-redText mb-3">£{displayPrice?.minPrice} - £{displayPrice?.maxPrice}/SQ.M</p>
                <p className="flex items-center gap-2 text-sm">
                  <span>Current Stock:</span>
                  <span className="text-green-600 font-medium"> {selectedVariation?.stockQuantity || ''} Boxes</span>
                </p>
              </div> */}

              <p className="text-sm text-gray-600 my-4">
                {product?.shortDescription || ''}
              </p>



              <Dialog open={openSampleDialog} onClose={() => setOpenSampleDialog(false)}>
                <DialogTitle id='form-dialog-title'>Need A Sample?</DialogTitle>
                <DialogContent>
                  <DialogContentText className='mbe-5'>
                    Choose your sample size and we'll deliver it to you
                  </DialogContentText>

                  <FormControl className='flex-wrap flex-row'>
                    <RadioGroup row defaultValue='checked' name='basic-radio' aria-label='basic-radio' className="gap-4">
                      {sampleData?.small && (
                        <FormControlLabel
                          className="w-full items-start"
                          sx={{
                            '& .MuiButtonBase-root': {
                              paddingTop: 0,
                            }
                          }}
                          label={<span>
                            15x15cm Sample
                            <span className="block text-gray-400" style={{ fontSize: '12px' }}>
                              {sampleData.small.freePerMonth
                                ? '(2 free samples every month)'
                                : `(Price: £${sampleData.small.price})`}
                            </span>
                          </span>}
                          control={
                            <Checkbox
                              checked={selectedSamples.small}
                              onChange={() => handleSampleChange('small')}
                              name='small-sample'
                            />
                          }
                        />
                      )}

                      {sampleData?.large && (
                        <FormControlLabel
                          className="w-full items-start"
                          sx={{
                            '& .MuiButtonBase-root': {
                              paddingTop: 0,
                            }
                          }}
                          label={<span>
                            Large Sample (60x60cm)
                            <span className="block text-gray-400" style={{ fontSize: '12px' }}>
                              (Price: £{sampleData.large.price})
                            </span>
                          </span>}
                          control={
                            <Checkbox
                              checked={selectedSamples.large}
                              onChange={() => handleSampleChange('large')}
                              name='large-sample'
                            />
                          }
                        />
                      )}

                      {sampleData?.full && (
                        <FormControlLabel
                          className="w-full items-start"
                          sx={{
                            '& .MuiButtonBase-root': {
                              paddingTop: 0,
                            }
                          }}
                          label={<span>
                            Full-Size Sample
                            <span className="block text-gray-400" style={{ fontSize: '12px' }}>
                              (Price: £{sampleData.full.price})
                            </span>
                          </span>}
                          control={
                            <Checkbox
                              checked={selectedSamples.full}
                              onChange={() => handleSampleChange('full')}
                              name='full-sample'
                            />
                          }
                        />
                      )}
                    </RadioGroup>
                  </FormControl>

                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenSampleDialog(false)} variant='outlined'>
                    Cancel
                  </Button>
                  <Button onClick={handleAddToCart} variant='contained'>
                    Order Sample
                  </Button>
                </DialogActions>
              </Dialog>

              <div className="my-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-normal">Pricing Tiers (inc. Shipping & Duties) </h2>
                  {product.allowSample &&
                    <p className="text-sm text-red-800 my-4">
                      <a href="#" className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900" onClick={() => setOpenSampleDialog(true)}>Need A Sample?</a>
                    </p>
                  }
                </div>
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
                        const isActive = calculatedValues.tier === tier.tierKey;
                        return (
                          <tr
                            key={tier.tierKey}
                            className={`border-t text-black/50 ${isActive ? 'bg-red-100 text-red-800 font-semibold' : ''}`}
                          >
                            <td className="px-4 py-2 border-r">{tier.label}</td>
                            <td className="px-4 py-2 border-r">{tier.tierName}</td>
                            <td className="px-4 py-2">£{calculateTierValue(
                              selectedVariation?.purchasedPrice,
                              1.17,
                              selectedVariation?.tierDiscount?.[tier.tierKey]?.tierAddOn,
                              selectedVariation?.tierDiscount?.[tier.tierKey]?.tierMultiplyBy
                            ).toFixed(2)} (inc. VAT)</td>
                          </tr>
                        );
                      })}

                    </tbody>
                  </table>
                </div>
              </div>

              <div className="my-6">
                <h2 className="font-normal mb-4">Create Your Order Here</h2>

                {/* <FormControlLabel
                  control={
                    <Switch
                      checked={isClientOrder}
                      onChange={(e) => setIsClientOrder(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Create Order for Client"
                  className="mb-4"
                /> */}

                {/* <div>
                  <ColorSelector />
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {product?.attributes?.map(attributeId => {
                    // Get ALL variations for this attributeId
                    const attributeVariations = product.attributeVariations.filter(
                      av => av.productAttribute === attributeId
                    );

                    console.log('attributeVariations', attributeVariations)


                    if (attributeVariations.length === 0) return null;

                    // Use the first variation to get the label (like 'size' or 'color')
                    // const label = attributeVariations[0].metaKey;

                    const label = convertSlugToName(attributeVariations[0].metaKey);

                    return (
                      <div key={attributeId} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {'Tile ' + label}
                        </label>
                        <FormControl fullWidth>
                          <Select
                            size="small"
                            className="rounded-md"
                            value={selectedAttributes[attributeId] || ''}
                            onChange={(e) => handleVariationChange(attributeId, e.target.value)}
                            displayEmpty
                            sx={{
                              height: 38,
                              backgroundColor: '#f4f0ed',
                              borderRadius: '10px',
                              '.MuiOutlinedInput-root': {
                                height: 38,
                              },
                              '.MuiSelect-select': {
                                height: 38,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 12px',
                              },
                            }}
                          >
                            <MenuItem value="" disabled>
                              Choose Tile {label}
                            </MenuItem>
                            {attributeVariations.map((variation) => (
                              <MenuItem
                                key={variation._id}
                                value={variation._id}
                                sx={{
                                  '&.Mui-selected': {
                                    backgroundColor: 'rgba(185, 28, 28, 0.08)',
                                  },
                                  '&.Mui-selected:hover': {
                                    backgroundColor: 'rgba(185, 28, 28, 0.12)',
                                  },
                                }}
                              >
                                {variation.metaValue}
                                {variation.productMeasurementUnit &&
                                  ` ${variation.productMeasurementUnit.symbol}`}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    );
                  })}



                  {/* <div className="bg-bgLight rounded-md px-4 py-2 flex items-center mb-4 border border-light !rounded-[10px]
!rounded-[10px]">
                    <span className="text-sm text-center w-full">{pricingTier}</span>
                  </div> */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (SQ.M)</label>
                    <input
                      size="small"
                      type="number"
                      value={quantity}
                      placeholder="Enter Quantity in SQ.M"
                      className={`w-full outline-none h-[38px] bg-bgLight px-3 py-4 rounded-md text-sm text-black border ${quantityError ? 'border-red-500' : 'border-[#ccc]'} `}
                      onChange={handleQuantityChange}
                      min="1"
                      step="0.01"
                      required
                    />
                    {quantityError && (
                      <p className="text-red-500 text-sm mt-1">{quantityError}</p>
                    )}
                  </div>

                  <div className="rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tiles</label>
                    <input
                      type="number"
                      value={tiles}
                      className={`w-full outline-none h-[38px] bg-bgLight px-3 py-4 rounded-md text-sm text-black border ${tilesError ? 'border-red-500' : 'border-[#ccc]'} `}
                      placeholder="Enter Number of Tiles"
                      onChange={handleTilesChange}
                      min="1"
                      step="1"
                      required
                    />
                    {tilesError && (
                      <p className="text-red-500 text-sm mt-1">{tilesError}</p>
                    )}
                  </div>

                  <div className="rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Boxes</label>
                    <input
                      type="number"
                      className={`w-full outline-none h-[38px] bg-bgLight px-3 py-4 rounded-md text-sm text-black border ${palletsError ? 'border-red-500' : 'border-[#ccc]'} `}
                      value={pallets}
                      placeholder="Enter Number of Boxes"
                      onChange={handlePalletsChange}
                      min="1"
                      step="1"
                      required
                    />
                    {palletsError && (
                      <p className="text-red-500 text-sm mt-1">{palletsError}</p>
                    )}
                  </div>
                </div>

                {calculatedValues.sqm > 0 && (
                  <div className="mb-6 p-4 bg-bgLight rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Price per SQ.M:</p>
                        <p className="text-lg font-medium text-red-800">£{calculatedValues.pricePerSqm?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Price:</p>
                        <p className="text-lg font-medium text-red-800">£{calculatedValues.calculatedPrice?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-red-500 mb-4">{error}</div>
                )}


                {/* Add Selected Variations List */}
                {selectedVariations.length > 0 && (
                  <div className="my-6">
                    <h3 className="font-normal mb-4">Selected Variations</h3>
                    <div className="space-y-4">
                      {selectedVariations.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-bgLight p-4 rounded-md">
                          <div>
                            <p className="font-medium">{item.variation.description || 'Variation'}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity} SQ.M</p>
                            <p className="text-sm text-gray-600">Tiles: {item.numberOfTiles}</p>
                            <p className="text-sm text-gray-600">Pallets: {item.numberOfPallets}</p>
                            <p className="text-sm text-red-800">£{item.price}/SQ.M</p>
                          </div>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemoveVariation(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="flex-1 bg-red-800 hover:bg-red-900 text-white"
                    onClick={handleAddVariation}
                    disabled={
                      !quantity || quantity <= 0 || !!quantityError || !!tilesError || !!palletsError
                    }
                  >
                    <i className="ri-add-line me-2 text-lg"></i>
                    Add Variation
                  </Button>
                  <Button
                    className="flex-1 bg-red-800 hover:bg-red-900 text-white"
                    onClick={handleAddToCart}
                    disabled={
                      !quantity || quantity <= 0 || !!quantityError || !!tilesError || !!palletsError
                    }
                  >
                    <i className="ri-shopping-cart-line me-2 text-lg"></i>
                    Add To Cart
                  </Button>
                  {/* <Button
                    variant='outlined'
                    className="flex-1 border border-red-800 text-red-800 hover:bg-red-50"
                  >
                    <i className="ri-heart-line me-2 text-lg"></i>
                    Add To Wishlist
                  </Button> */}
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center w-1/2 text-red-800">
                    <i className="ri-truck-line me-2"></i>
                    <span className="text-darkGrey">Nationwide Delivery Included</span>
                    <Tooltip title="Express 3-5 days delivery options available subject to availability.">
                      <IconButton>
                        <i class="ri-information-line"></i>
                      </IconButton>
                    </Tooltip>
                  </div>

                  {/* <div className="flex items-center w-1/2 rounded-md text-redText bg-redText/25 px-4 py-2">
                    <i className="ri-discount-percent-line me-1"></i>
                    Add 10.08 sq.m more to unlock 5% off
                  </div> */}
                  {calculatedValues?.sqm !== undefined && (
                    <div className="flex items-center w-1/2 rounded-md text-redText bg-redText/25 px-4 py-2">
                      <i className="ri-discount-percent-line me-1"></i>
                      {getNextTierMessage(calculatedValues.sqm)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          <Divider className="mb-12" />

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
                    ? 'bg-red-800 hover:bg-black text-white [border-top-left-radius:5px] [border-top-right-radius:5px] [border-bottom-left-radius:0] [border-bottom-right-radius:0]'
                    : 'rounded-md'} px-4 py-2 flex items-center gap-2 capitalize font-montserrat text-15`
                }


                disableRipple
                disableFocusRipple
              />
              <Tab
                value="2"
                label="Product Details"
                className={
                  `${Tabvalue === '2'
                    ? 'bg-red-800 hover:bg-black text-white [border-top-left-radius:5px] [border-top-right-radius:5px] [border-bottom-left-radius:0] [border-bottom-right-radius:0]'
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
                    ? 'bg-red-800 hover:bg-black text-white [border-top-left-radius:5px] [border-top-right-radius:5px] [border-bottom-left-radius:0] [border-bottom-right-radius:0]'
                    : 'rounded-md'} px-4 py-2 flex items-center gap-2 capitalize font-montserrat text-15`
                }
                disableRipple
                disableFocusRipple
              />
            </TabList>

            <TabPanel value='1' className="border [border-bottom-left-radius:10px] [border-bottom-right-radius:10px] p-10">

              {product?.description ?? ''}

            </TabPanel>
            <TabPanel value='2' className="border [border-bottom-left-radius:10px] [border-bottom-right-radius:10px] p-10">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Product Details */}
                <div>
                  <h3 className="font-medium mb-4 text-redText">Product Details</h3>
                  <ul className="text-sm space-y-2 list-none p-0">
                    <li><span className="font-medium">Name:</span> {product.name || 'N/A'}</li>
                    <li><span className="font-medium">SKU:</span> {product.sku || 'N/A'}</li>
                    <li>
                      <span className="font-medium">Collection:</span>
                      {product.categories && product.categories.length > 0
                        ? product.categories.map(cat => cat.name).join(', ')
                        : 'N/A'}
                    </li>
                    <li><span className="font-medium">Factory:</span> {product?.supplier?.companyName || 'N/A'}</li>
                    {/* <li><span className="font-medium">Origin:</span> {product?.origin || 'N/A'}</li>
                    <li><span className="font-medium">Style:</span> {product?.style || 'N/A'}</li> */}
                  </ul>
                </div>
                {/* Technical Details */}
                <div>
                  <h3 className="font-medium mb-4 text-redText">Technical Details</h3>
                  <ul className="text-sm space-y-2 list-none p-0">
                    {selected?.attributeVariationsDetail?.length > 0 && selected?.attributeVariationsDetail?.map((variation) => (
                      <li><span className="font-medium">{convertSlugToName(variation.metaKey)}:</span> {variation.metaValue || 'N/A'} {variation.productMeasurementUnit?.symbol}</li>

                    ))}
                    {selected?.attributeVariationsDetail?.length === 0 && (
                      <li><span className="font-medium">No Technical Details Available</span></li>
                    )}
                  </ul>
                </div>
                {/* Packaging Details */}
                <div>
                  <h3 className="font-medium mb-4 text-redText">Packaging Details</h3>
                  <ul className="text-sm space-y-2 list-none p-0">
                    <li><span className="font-medium">Box Size (sq.m):</span> {selected.boxSize || 'N/A'}</li>
                    <li><span className="font-medium">SQ.M per Tile:</span> {selected.sqmPerTile || 'N/A'}</li>
                    <li><span className="font-medium">Tiles per Box:</span> {selected.numberOfTiles || 'N/A'}</li>
                    <li><span className="font-medium">Box Weight (KG):</span> {selected.boxWeight || 'N/A'}</li>
                    <li><span className="font-medium">Pallet Size (sq.m):</span> {selected.palletSize || 'N/A'}</li>
                    <li><span className="font-medium">Pallet Weight (KG):</span> {selected.palletWeight || 'N/A'}</li>
                    <li><span className="font-medium">Boxes Per Pallet:</span> {selected.boxesPerPallet || 'N/A'}</li>
                  </ul>
                </div>
              </div>
            </TabPanel>
            <TabPanel value='3' className="border [border-bottom-left-radius:10px] [border-bottom-right-radius:10px] p-10">
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
            <Tooltip
              title={
                "Tiles from the same supplier qualify for combined pricing tiers —\nbundle more to unlock bigger savings."
              }
              arrow
            >
              <h2 className="text-2xl font-medium text-red-800 mb-6 text-center">
                Add more from{" "}
                <Link
                  href={{
                    pathname: `/${locale}/products`,
                    query: { supplier: product?.supplier?._id },
                  }}
                  className="underline hover:text-primary cursor-pointer"
                >
                  {product?.supplier?.companyName || ""}
                </Link>{" "}
                for better discounts
              </h2>
            </Tooltip>

            <RelatedProductGrid products={product?.associatedProducts || []} />
          </div>

        </div>

      </main >

      {/* Custom Price Dialog */}
      < Dialog open={openPriceDialog} onClose={() => setOpenPriceDialog(false)
      }>
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
              setCustomPrice(e.target.value);
              setPriceError("");
            }}
            error={!!priceError}
            helperText={priceError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPriceDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddToCart} color="primary">
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog >

    </div >
  );
}

