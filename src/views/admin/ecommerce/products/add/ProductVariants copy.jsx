'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Typography,
  TextField,
  Switch,
  Card,
  CardHeader,
  CardContent,
  FormHelperText,
  Button,
  List,
  ListItem,
  IconButton,
  Divider,
  InputAdornment
} from '@mui/material'
import { useFormContext, Controller, useWatch } from 'react-hook-form'
import Grid from '@mui/material/Grid2'
import { useDropzone } from 'react-dropzone'
import CustomAvatar from '@/@core/components/mui/Avatar'
import Image from 'next/image'
import { calculateTierValue } from '@/components/common/helper'

export default function ProductVariants({
  productAttributes,
  defaultAttribute,
  defaultAttributeVariations,
  defaultProductVariations
}) {
  const hasAttributes = productAttributes && productAttributes.length > 0
  const [tabIndex, setTabIndex] = useState(0)
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({})
  const [allAttributes, setAllAttributes] = useState({})
  const { control, watch, reset, setValue, getValues, isSubmitted } = useFormContext()
  const [removedImageIds, setRemovedImageIds] = useState([])

  useEffect(() => {
    const isReady =
      Array.isArray(productAttributes) &&
      productAttributes.length > 0 &&
      Array.isArray(defaultAttribute) &&
      defaultAttribute.length > 0 &&
      Array.isArray(defaultAttributeVariations) &&
      defaultAttributeVariations.length > 0

    if (!isReady) return

    // Step 1: Select attribute IDs directly from defaultAttribute
    const attributeIds = [...defaultAttribute]

    // Step 2: Build attributeId -> [variationIds] mapping from defaultAttributeVariations
    const attributeValueMap = {}

    attributeIds.forEach(attributeId => {
      const attribute = productAttributes.find(attr => attr._id === attributeId)

      if (attribute) {
        const matchedVariationIds = attribute.variations
          .filter(variation => defaultAttributeVariations.includes(variation._id))
          .map(variation => variation._id)

        if (matchedVariationIds.length > 0) {
          attributeValueMap[attributeId] = matchedVariationIds
        }
      }
    })

    // Step 3: Update local state
    setSelectedAttributes(attributeIds)
    setSelectedAttributeValues(attributeValueMap)

    // Step 4: Set form values
    setValue('attributes', attributeIds, { shouldValidate: true })
    setValue('attributeVariations', defaultAttributeVariations, { shouldValidate: true })
    setValue('productVariations', defaultProductVariations, { shouldValidate: true })
  }, [productAttributes, defaultAttribute, defaultAttributeVariations, defaultProductVariations, setValue])

  const initialProductVariationsRef = useRef([])

  // State to track removed variations for submission
  const [removedProductVariations, setRemovedProductVariations] = useState([])

  function generateVariations(selectedAttributeValues, existingVariations = []) {
    const arrays = Object.values(selectedAttributeValues)
    if (arrays.length === 0 || arrays.some(arr => arr.length === 0)) {
      return []
    }

    const cartesian = arr => arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]])
    const combinations = cartesian(arrays)
    const newVariations = combinations.map(combo => {
      const variationAttributes = {}
      const formattedAttributes = []

      Object.keys(selectedAttributeValues).forEach((attr, index) => {
        const formattedValue = combo[index]
        variationAttributes[attr] = formattedValue
        formattedAttributes.push(formattedValue)
      })

      // Try to find a matching existing variation
      const matchedExisting = existingVariations.find(existing => {
        const existingAttributes = existing.attributes || []
        const existingFormatted = existingAttributes
          .map(attr => {
            return attr.measurementUnit ? `${attr.metaValue} ${attr.measurementUnit.name}` : attr.metaValue
          })
          .sort()

        return formattedAttributes.slice().sort().join(',') === existingFormatted.join(',')
      })

      console.log(variationAttributes, matchedExisting, 'variationAttributes')

      return {
        ...variationAttributes,
        _id: matchedExisting?._id || undefined,
        description: matchedExisting?.description || '',
        stockStatus: matchedExisting?.stockStatus || 'in_stock',
        stockQuantity: matchedExisting?.stockQuantity,
        allowBackorders: matchedExisting?.allowBackorders || false,
        weight: matchedExisting?.weight,
        dimensions: matchedExisting?.dimensions || { length: 0, width: 0, height: 0 },
        regularPriceB2B: matchedExisting?.regularPriceB2B,
        regularPriceB2C: matchedExisting?.regularPriceB2C,
        salePrice: matchedExisting?.salePrice,
        purchasedPrice: matchedExisting?.purchasedPrice,
        numberOfTiles: matchedExisting?.numberOfTiles,
        boxSize: matchedExisting?.boxSize,
        palletSize: matchedExisting?.palletSize,
        tierDiscount: matchedExisting?.tierDiscount,
        status: matchedExisting?.status,
        attributes: matchedExisting?.attributes || []
      }
    })

    // Combine existing variations that are still valid with new variations
    const existingFormattedKeys = new Set(
      newVariations.map(variation =>
        selectedAttributes
          .map(attr => variation[attr])
          .sort()
          .join(',')
      )
    )

    const preservedVariations = existingVariations.filter(existing => {
      const existingAttributes = existing.attributes || []
      const existingFormatted = existingAttributes
        .map(attr => {
          return attr.measurementUnit ? `${attr.metaValue} ${attr.measurementUnit.name}` : attr.metaValue
        })
        .sort()
        .join(',')

      return existingFormattedKeys.has(existingFormatted)
    })

    // Merge preserved and new variations, avoiding duplicates
    const mergedVariations = [...preservedVariations]

    newVariations.forEach(newVar => {
      const isDuplicate = mergedVariations.some(existingVar => {
        return selectedAttributes.every(attr => existingVar[attr] === newVar[attr])
      })

      if (!isDuplicate) {
        mergedVariations.push(newVar)
      }
    })

    return mergedVariations
  }

  // On first render, capture initial variations for comparison
  useEffect(() => {
    if (defaultProductVariations.length && initialProductVariationsRef.current.length === 0) {
      initialProductVariationsRef.current = [...defaultProductVariations]
    }
  }, [defaultProductVariations])

  // 1. Update setAllAttributes to use attribute ID and value IDs:
  useEffect(() => {
    if (productAttributes && productAttributes.length > 0) {
      // Initialize an empty object to store transformed attributes
      const indexedAttributes = {}

      // Loop through productAttributes with index to use as key
      productAttributes.forEach((attribute, index) => {
        // Map attribute variations to array of { id, label }
        const values = attribute.variations.map(variation => {
          const unitName = variation.measurementUnit?.name || ''
          const label = unitName ? `${variation.metaValue} ${unitName}` : variation.metaValue

          return {
            id: variation._id, // Variation ID
            label // Label string to display
          }
        })

        // Assign transformed attribute to indexedAttributes with numeric index key
        indexedAttributes[index] = {
          _id: attribute._id, // Original attribute ID stored in _id
          name: attribute.name, // Attribute name for display
          values // Array of variation objects with id and label
        }
      })

      // Update the state with transformed attributes object
      setAllAttributes(indexedAttributes)
    }
  }, [productAttributes])

  // Watch variations from form context
  const variations = watch('productVariations') || []

  // When selectedAttributeValues changes, generate new variations and update form
  const isEmptyArray = arr => !Array.isArray(arr) || arr.length === 0
  const hasMountedRef = useRef(false)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    if (isEmptyArray(defaultAttributeVariations) && isEmptyArray(defaultProductVariations)) {
      const newVariations = generateVariations(selectedAttributeValues, defaultProductVariations)
      setValue('productVariations', newVariations, { shouldValidate: true })
    }
  }, [selectedAttributeValues, setValue])

  useEffect(() => {
    setValue('variationsImagesToRemove', removedImageIds)
  }, [removedImageIds])

  useEffect(() => {
    // Collect matched variation IDs based on selected attribute IDs and variation IDs
    const matchedVariationIds = []

    selectedAttributes.forEach(attributeId => {
      const matchedAttribute = productAttributes.find(attr => attr._id === attributeId)

      if (matchedAttribute) {
        const selectedVariationIds = selectedAttributeValues[attributeId] || []

        matchedAttribute.variations.forEach(variation => {
          if (selectedVariationIds.includes(variation._id)) {
            matchedVariationIds.push(variation._id)
          }
        })
      }
    })

    // Update attributeVariations in the form with variation IDs
    setValue('attributeVariations', matchedVariationIds, { shouldValidate: true })
  }, [selectedAttributes, selectedAttributeValues, productAttributes, setValue])

  // Disable variations tab if no attributes or any attribute has no values selected
  const isVariationsDisabled =
    selectedAttributes.length === 0 || Object.values(selectedAttributeValues).some(vals => vals.length === 0)

  const isAttributeExist = watch('attributes')
  console.log(defaultAttribute, 'isAttributeExistisAttributeExist')

  const handleAttributesChange = event => {
    const newSelectedAttributes = event.target.value // New selected array
    const previousSelectedAttributes = selectedAttributes // Previous selected array

    const removedAttributes = previousSelectedAttributes.filter(id => !newSelectedAttributes.includes(id))

    // Check if any of the removed attributes exist in defaultAttribute
    const isExist = removedAttributes.some(attrId => defaultAttribute.includes(attrId))

    if (isExist) {
      alert('This attribute is already used in existing variations. Please remove the related variants first.')
      return // Prevent update
    }

    // Safe to update
    setValue('attributes', newSelectedAttributes, { shouldValidate: true })
    setSelectedAttributes(newSelectedAttributes)
  }

  const handleAttributeValuesChange = (attributeId, values) => {
    setSelectedAttributeValues(prev => ({
      ...prev,
      [attributeId]: values
    }))
  }

  const handleRemoveVariation = removeIndex => {
    const currentVariations = getValues('productVariations')
    const variationToRemove = currentVariations[removeIndex]
    if (variationToRemove?._id) {
      // Update local state
      setRemovedProductVariations(prev => {
        const updated = prev.includes(variationToRemove._id) ? prev : [...prev, variationToRemove._id]
        // Sync with form state
        setValue('variationsToRemove', updated, { shouldValidate: true })
        return updated
      })
    }
    // Remove the variation from the form state
    const updatedVariations = currentVariations.filter((_, i) => i !== removeIndex)
    setValue('productVariations', updatedVariations, { shouldValidate: true })
  }

  return (
    <Card>
      <CardHeader
        title='Product Data'
        action={
          <Typography color='primary.main' className='font-medium'>
            Set Product Attribute and Variations
          </Typography>
        }
        sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
          <Tabs
            orientation='vertical'
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            sx={{ borderRight: 1, borderColor: 'divider', minWidth: 180 }}
          >
            <Tab label='Attributes' />
            <Tab label='Variations' disabled={isVariationsDisabled} />
          </Tabs>

          {tabIndex === 0 && (
            <Box sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant='h6' gutterBottom>
                Choose Attributes to Combine
              </Typography>

              <FormControl
                sx={{ mb: 4, minWidth: 300 }}
                variant='outlined'
                margin='normal'
                required
                error={!hasAttributes}
              >
                <InputLabel id='select-attributes-label'>Attributes</InputLabel>
                <Select
                  labelId='select-attributes-label'
                  multiple
                  value={selectedAttributes}
                  onChange={handleAttributesChange}
                  input={<OutlinedInput label='Attributes' />}
                  renderValue={selected => {
                    // For each selected attribute ID, find its corresponding name in allAttributes
                    const names = selected
                      .map(attrId => {
                        // Find attribute by matching _id
                        const attrEntry = Object.values(allAttributes).find(attr => attr._id === attrId)
                        return attrEntry ? attrEntry.name : null
                      })
                      .filter(Boolean)

                    return names.join(', ')
                  }}
                >
                  {Object.keys(allAttributes).map(indexKey => {
                    const attribute = allAttributes[indexKey]
                    return (
                      <MenuItem key={attribute._id} value={attribute._id}>
                        <Checkbox checked={selectedAttributes.includes(attribute._id)} />
                        <ListItemText primary={attribute.name} />
                      </MenuItem>
                    )
                  })}
                </Select>

                {!hasAttributes && <FormHelperText>Please create the attribute to show here.</FormHelperText>}
              </FormControl>

              {selectedAttributes.length > 0 && (
                <>
                  <Typography variant='h6' gutterBottom>
                    Select Attribute Values
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedAttributes.map(attributeId => {
                      const attribute = Object.values(allAttributes).find(attr => attr._id === attributeId)
                      if (!attribute) return null

                      const valuesSelected = selectedAttributeValues?.length > 0
                      const showError = isSubmitted && !valuesSelected

                      return (
                        <Grid item xs={12} md={6} key={attributeId}>
                          <FormControl sx={{ mb: 3, minWidth: 300 }} fullWidth error={showError} required>
                            <InputLabel id={`${attributeId}-label`}>{attribute.name}</InputLabel>
                            <Select
                              fullWidth
                              labelId={`${attributeId}-label`}
                              multiple
                              value={selectedAttributeValues[attributeId] || []}
                              onChange={e => handleAttributeValuesChange(attributeId, e.target.value)}
                              input={<OutlinedInput label={attribute.name} />}
                              renderValue={selected => {
                                // Map selected value ids to their labels for display
                                return selected
                                  .map(valueId => {
                                    const foundValue = attribute.values.find(v => v.id === valueId)
                                    return foundValue ? foundValue.label : ''
                                  })
                                  .filter(Boolean)
                                  .join(', ')
                              }}
                            >
                              {attribute.values.map(value => (
                                <MenuItem key={value.id} value={value.id}>
                                  <Checkbox
                                    checked={selectedAttributeValues[attributeId]?.includes(value.id) || false}
                                  />
                                  <ListItemText primary={value.label} />
                                </MenuItem>
                              ))}
                            </Select>
                            {showError && (
                              <FormHelperText>Please select at least one value for {attribute.name}.</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                      )
                    })}
                  </Grid>
                </>
              )}
            </Box>
          )}

          {tabIndex === 1 && (
            <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', maxHeight: 600 }}>
              <Typography variant='h6' gutterBottom>
                Manage Variations
              </Typography>

              {/* Debug information */}
              {variations.length === 0 && defaultProductVariations.length > 0 && (
                <Box sx={{ mb: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography color='error'>No variations loaded. Using default variations directly.</Typography>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => setValue('productVariations', defaultProductVariations)}
                    sx={{ mt: 2 }}
                  >
                    Load Default Variations
                  </Button>
                </Box>
              )}

              {variations.map((variation, index) => (
                <Box key={index} sx={{ mb: 4, border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                  <Box sx={{}}>
                    <IconButton onClick={() => handleRemoveVariation(index)}>
                      <i className='ri-delete-bin-line text-xl text-red-600' />
                    </IconButton>
                  </Box>
                  <Typography variant='subtitle1' gutterBottom>
                    {selectedAttributes
                      .map(attrId => {
                        const attribute = Object.values(allAttributes).find(attr => attr._id === attrId)
                        const attributeName = attribute ? attribute.name : attrId

                        const variationId = variation[attrId]
                        const variationLabel =
                          attribute?.values?.find(val => val.id === variationId)?.label || variationId

                        return `${attributeName.charAt(0).toUpperCase() + attributeName.slice(1)}: ${variationLabel}`
                      })
                      .join(', ')}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Card style={{ marginBottom: '20px' }}>
                        <CardHeader
                          title='Variation Image'
                          sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
                        />
                        <CardContent>
                          <Controller
                            name={`productVariations.${index}.variationImages`}
                            control={control}
                            defaultValue={[]} // Array of images
                            render={({ field: { value = [], onChange } }) => {
                              const onDrop = acceptedFiles => {
                                if (acceptedFiles?.length > 0) {
                                  // Append newly selected images to the current list
                                  onChange([...value, ...acceptedFiles])
                                }
                              }

                              const { getRootProps, getInputProps } = useDropzone({
                                onDrop,
                                multiple: true,
                                accept: { 'image/*': [] }
                              })

                              // const handleRemoveImage = removeIndex => {
                              //   const updated = value.filter((_, i) => i !== removeIndex)
                              //   onChange(updated)
                              // }
                              const handleRemoveImage = removeIndex => {
                                const removedImage = value[removeIndex]

                                // If the removed image is from backend (has an id), add its id to removedImageIds array
                                if (removedImage && !(removedImage instanceof File) && removedImage.id) {
                                  setRemovedImageIds(prevIds => [...prevIds, removedImage.id])
                                }

                                // Remove the image from current list
                                const updatedImages = value.filter((_, i) => i !== removeIndex)
                                onChange(updatedImages)
                              }

                              return (
                                <Box>
                                  <div {...getRootProps({ className: 'dropzone' })}>
                                    <input {...getInputProps()} />
                                    <div className='flex items-center flex-col gap-2 text-center'>
                                      <CustomAvatar variant='rounded' skin='light' color='secondary'>
                                        <i className='ri-upload-2-line' />
                                      </CustomAvatar>
                                      <Typography variant='h4'>Drag and Drop Images</Typography>
                                      <Typography color='text.disabled'>or</Typography>
                                      <Button variant='outlined' size='small'>
                                        Browse Images
                                      </Button>
                                    </div>
                                  </div>

                                  {value.length > 0 && (
                                    <List>
                                      {value.map((file, index) => {
                                        const isLocalFile = file instanceof File

                                        const imageUrl = isLocalFile
                                          ? URL.createObjectURL(file)
                                          : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${file.filePath}`

                                        const fileName = isLocalFile ? file.name : file.fileName
                                        const fileSize = isLocalFile ? file.size : null

                                        return (
                                          <ListItem
                                            key={index}
                                            secondaryAction={
                                              <IconButton onClick={() => handleRemoveImage(index)}>
                                                <i className='ri-close-line text-xl' />
                                              </IconButton>
                                            }
                                          >
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                              <div style={{ position: 'relative', width: 60, height: 60 }}>
                                                <Image
                                                  src={imageUrl}
                                                  alt={`variation-image-${index}`}
                                                  fill
                                                  style={{ objectFit: 'cover', borderRadius: 4 }}
                                                />
                                              </div>
                                              <div>
                                                <Typography className='file-name font-medium' color='text.primary'>
                                                  {fileName || `Image ${index + 1}`}
                                                </Typography>
                                                {fileSize && (
                                                  <Typography variant='body2'>
                                                    {fileSize > 1000000
                                                      ? `${(fileSize / 1024 / 1024).toFixed(1)} MB`
                                                      : `${(fileSize / 1024).toFixed(1)} KB`}
                                                  </Typography>
                                                )}
                                              </div>
                                            </div>
                                          </ListItem>
                                        )
                                      })}
                                    </List>
                                  )}
                                </Box>
                              )
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
                      <Typography variant='h5' mb={2}>
                        Price Management
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.regularPriceB2B`}
                        control={control}
                        defaultValue={variation.regularPriceB2B}
                        rules={{ required: 'Regular Price is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Regular Price (B2B)'
                              type='number'
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                              InputProps={{
                                startAdornment: <InputAdornment position='start'>€</InputAdornment>,
                                inputProps: {
                                  step: 1,
                                  min: 1
                                }
                              }}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.regularPriceB2C`}
                        control={control}
                        defaultValue={variation.regularPriceB2C}
                        rules={{ required: 'Regular Price is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Regular Price (B2C)'
                              type='number'
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                              InputProps={{
                                startAdornment: <InputAdornment position='start'>€</InputAdornment>,
                                inputProps: {
                                  step: 1,
                                  min: 1
                                }
                              }}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.salePrice`}
                        control={control}
                        defaultValue={variation.salePrice}
                        rules={{ required: 'Sale Price is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Sale Price'
                              type='number'
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                              InputProps={{
                                startAdornment: <InputAdornment position='start'>€</InputAdornment>,
                                inputProps: {
                                  step: 1,
                                  min: 1
                                }
                              }}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.purchasedPrice`}
                        control={control}
                        defaultValue={variation.purchasedPrice}
                        rules={{ required: 'Purchased Price is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Purchased Price'
                              type='number'
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                              InputProps={{
                                startAdornment: <InputAdornment position='start'>€</InputAdornment>,
                                inputProps: {
                                  step: 1,
                                  min: 1
                                }
                              }}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
                      <Typography variant='h5' mb={2}>
                        Stock Management
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name={`productVariations.${index}.stockStatus`}
                        control={control}
                        defaultValue={variation.stockStatus ?? 'in_stock'}
                        rules={{ required: 'Stock status is required' }} // Required validation rule
                        render={({ field, fieldState: { error } }) => (
                          <FormControl fullWidth error={!!error}>
                            <InputLabel id={`stock-status-label-${index}`}>Stock Status</InputLabel>
                            <Select {...field} labelId={`stock-status-label-${index}`} label='Stock Status'>
                              <MenuItem value='in_stock'>In Stock</MenuItem>
                              <MenuItem value='out_of_stock'>Out of Stock</MenuItem>
                              <MenuItem value='on_backorder'>On Backorder</MenuItem>
                            </Select>
                            {error && (
                              <Typography variant='caption' color='error' mt={0.5}>
                                {error.message}
                              </Typography>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name={`productVariations.${index}.stockQuantity`}
                        control={control}
                        defaultValue={variation.stockQuantity}
                        rules={{ required: 'Stock Quantity is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Stock Quantity'
                              type='number'
                              inputProps={{ min: 1 }}
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Controller
                        name={`productVariations.${index}.status`}
                        control={control}
                        defaultValue={variation?.status ?? false}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <Typography>Status</Typography>
                            <Switch
                              {...field}
                              checked={Boolean(field.value)}
                              onChange={e => field.onChange(e.target.checked)}
                              sx={{ ml: 1 }}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
                      <Typography variant='h5' mb={2}>
                        Units Management
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.weight`}
                        control={control}
                        defaultValue={variation.weight}
                        rules={{ required: 'Weight is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Tile Weight (kg)'
                              type='number'
                              inputProps={{ step: 1, min: 1 }}
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    {/* Dimensions */}

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.dimensions.length`}
                        control={control}
                        defaultValue={variation.dimensions.length}
                        rules={{ required: 'Length is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Tile Length (cm)'
                              type='number'
                              inputProps={{ step: 1, min: 1 }}
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.dimensions.width`}
                        control={control}
                        defaultValue={variation.dimensions.width}
                        rules={{ required: 'Width is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Tile Width (cm)'
                              type='number'
                              inputProps={{ step: 1, min: 1 }}
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.dimensions.height`}
                        control={control}
                        defaultValue={variation.dimensions.height}
                        rules={{ required: 'Height is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Tile Height (cm)'
                              type='number'
                              inputProps={{ step: 1, min: 1 }}
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.numberOfTiles`}
                        control={control}
                        defaultValue={variation.numberOfTiles}
                        rules={{ required: 'Number of tiles per box is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Number of tiles per box'
                              type='number'
                              inputProps={{ step: 1, min: 1 }}
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.boxSize`}
                        control={control}
                        defaultValue={variation.boxSize}
                        rules={{ required: 'Box sizes are required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Box sizes (sqm/kg)'
                              type='number'
                              inputProps={{ step: 1, min: 1 }}
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.palletSize`}
                        control={control}
                        defaultValue={variation.palletSize}
                        rules={{ required: 'Pallet Size is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Pallet Size (sqm/kg)'
                              fullWidth
                              type='number'
                              inputProps={{ step: 1, min: 1 }}
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Divider style={{ marginTop: '20px', marginBottom: '20px' }} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Grid container spacing={2} mb={3}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant='h6'>Tier 5 - Price (inc.VAT) - Under 30 sq.m</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`productVariations.${index}.tierDiscount.tierFirst.tierAddOn`}
                            control={control}
                            defaultValue={variation.tierDiscount?.tierFirst?.tierAddOn}
                            rules={{ required: 'Tier Add On is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <TextField
                                  {...field}
                                  label='Tier Add On'
                                  fullWidth
                                  type='number'
                                  inputProps={{ step: 1, min: 1 }}
                                  variant='outlined'
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              </>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`productVariations.${index}.tierDiscount.tierFirst.tierMultiplyBy`}
                            control={control}
                            defaultValue={variation?.tierDiscount?.tierFirst?.tierMultiplyBy}
                            rules={{ required: 'Tier Multiply By is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <TextField
                                  {...field}
                                  label='Tier Multiply By'
                                  fullWidth
                                  type='number'
                                  inputProps={{ step: 1, min: 1 }}
                                  variant='outlined'
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              </>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            disabled
                            id='outlined-disabled'
                            label='Tier Price'
                            value={calculateTierValue(
                              variation?.purchasedPrice,
                              1.17,
                              variation.tierDiscount?.tierFirst?.tierAddOn,
                              variation.tierDiscount?.tierFirst?.tierMultiplyBy
                            )}
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} mb={3}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant='h6'>Tier 4 - Price (inc.VAT) - 30 - 51 sq.m</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`productVariations.${index}.tierDiscount.tierSecond.tierAddOn`}
                            control={control}
                            defaultValue={variation.tierAddOn}
                            rules={{ required: 'Tier Add On is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <TextField
                                  {...field}
                                  label='Tier Add On'
                                  fullWidth
                                  type='number'
                                  inputProps={{ step: 1, min: 1 }}
                                  variant='outlined'
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              </>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`productVariations.${index}.tierDiscount.tierSecond.tierMultiplyBy`}
                            control={control}
                            defaultValue={variation.tierMultiplyBy}
                            rules={{ required: 'Tier Multiply By is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <TextField
                                  {...field}
                                  label='Tier Multiply By'
                                  fullWidth
                                  type='number'
                                  inputProps={{ step: 1, min: 1 }}
                                  variant='outlined'
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              </>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            disabled
                            id='outlined-disabled'
                            label='Tier Price'
                            value={calculateTierValue(
                              variation?.purchasedPrice,
                              1.17,
                              variation.tierDiscount?.tierSecond?.tierAddOn,
                              variation.tierDiscount?.tierSecond?.tierMultiplyBy
                            )}
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} mb={3}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant='h6'>Tier 3 - Price (inc.VAT) - 51 - 153 sq.m</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`productVariations.${index}.tierDiscount.tierThird.tierAddOn`}
                            control={control}
                            defaultValue={variation.tierAddOn}
                            rules={{ required: 'Tier Add On is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <TextField
                                  {...field}
                                  label='Tier Add On'
                                  fullWidth
                                  type='number'
                                  inputProps={{ step: 1, min: 1 }}
                                  variant='outlined'
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              </>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`productVariations.${index}.tierDiscount.tierThird.tierMultiplyBy`}
                            control={control}
                            defaultValue={variation.tierMultiplyBy}
                            rules={{ required: 'Tier Multiply By is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <TextField
                                  {...field}
                                  label='Tier Multiply By'
                                  fullWidth
                                  type='number'
                                  inputProps={{ step: 1, min: 1 }}
                                  variant='outlined'
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              </>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            disabled
                            id='outlined-disabled'
                            label='Tier Price'
                            value={calculateTierValue(
                              variation?.purchasedPrice,
                              1.17,
                              variation.tierDiscount?.tierThird?.tierAddOn,
                              variation.tierDiscount?.tierThird?.tierMultiplyBy
                            )}
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} mb={3}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant='h6'>Tier 2 - Price (inc. VAT) - 153 - 1300 sq.m</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`productVariations.${index}.tierDiscount.tierFourth.tierAddOn`}
                            control={control}
                            defaultValue={variation.tierAddOn}
                            rules={{ required: 'Tier Add On is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <TextField
                                  {...field}
                                  label='Tier Add On'
                                  fullWidth
                                  type='number'
                                  inputProps={{ step: 1, min: 1 }}
                                  variant='outlined'
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              </>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`productVariations.${index}.tierDiscount.tierFourth.tierMultiplyBy`}
                            control={control}
                            defaultValue={variation.tierMultiplyBy}
                            rules={{ required: 'Tier Multiply By is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <TextField
                                  {...field}
                                  label='Tier Multiply By'
                                  fullWidth
                                  type='number'
                                  inputProps={{ step: 1, min: 1 }}
                                  variant='outlined'
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              </>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            disabled
                            id='outlined-disabled'
                            label='Tier Price'
                            value={calculateTierValue(
                              variation?.purchasedPrice,
                              1.17,
                              variation.tierDiscount?.tierFourth?.tierAddOn,
                              variation.tierDiscount?.tierFourth?.tierMultiplyBy
                            )}
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} mb={3}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant='h6'>Tier 1 - Price (inc.VAT) - Over 1300 sq.m</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`productVariations.${index}.tierDiscount.tierFifth.tierAddOn`}
                            control={control}
                            defaultValue={variation.tierAddOn}
                            rules={{ required: 'Tier Add On is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <TextField
                                  {...field}
                                  label='Tier Add On'
                                  fullWidth
                                  type='number'
                                  inputProps={{ step: 1, min: 1 }}
                                  variant='outlined'
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              </>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Controller
                            name={`productVariations.${index}.tierDiscount.tierFifth.tierMultiplyBy`}
                            control={control}
                            defaultValue={variation.tierMultiplyBy}
                            rules={{ required: 'Tier Multiply By is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <TextField
                                  {...field}
                                  label='Tier Multiply By'
                                  fullWidth
                                  type='number'
                                  inputProps={{ step: 1, min: 1 }}
                                  variant='outlined'
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              </>
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            disabled
                            id='outlined-disabled'
                            label='Tier Price'
                            value={calculateTierValue(
                              variation?.purchasedPrice,
                              1.17,
                              variation.tierDiscount?.tierFifth?.tierAddOn,
                              variation.tierDiscount?.tierFifth?.tierMultiplyBy
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, md: 12 }}>
                      {/* <Controller
                        name={`productVariations.${index}.customImageUrl`}
                        control={control}
                        defaultValue={variation.customImageUrl}
                        rules={{ required: 'Custom Image URL is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Custom Image URL'
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      /> */}
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name={`productVariations.${index}.description`}
                        control={control}
                        defaultValue={variation.description}
                        rules={{ required: 'Description is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Description'
                              multiline
                              rows={2}
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    {/* <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.image`}
                        control={control}
                        defaultValue={variation.image}
                        render={({ field }) => <TextField {...field} label='Image' fullWidth variant='outlined' />}
                      />
                    </Grid> */}

                    {/* <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.shippingClass`}
                        control={control}
                        defaultValue={variation.shippingClass}
                        render={({ field }) => (
                          <TextField {...field} label='Shipping Class' fullWidth variant='outlined' />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.taxClass`}
                        control={control}
                        defaultValue={variation.taxClass}
                        render={({ field }) => <TextField {...field} label='Tax Class' fullWidth variant='outlined' />}
                      />
                    </Grid> */}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
