'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  IconButton
} from '@mui/material'
import { useFormContext, Controller, useWatch } from 'react-hook-form'
import Grid from '@mui/material/Grid2'
import Dropzone, { useDropzone } from 'react-dropzone'
import CustomAvatar from '@/@core/components/mui/Avatar'

// Helper to generate Cartesian product variations based on selected attribute values
function generateVariations(selectedAttributeValues, existingVariations = []) {
  const arrays = Object.values(selectedAttributeValues)
  if (arrays.length === 0 || arrays.some(arr => arr.length === 0)) {
    return []
  }

  const cartesian = arr => arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]])
  const combinations = cartesian(arrays)

  return combinations.map(combo => {
    const variation = {}
    Object.keys(selectedAttributeValues).forEach((attr, index) => {
      variation[attr] = combo[index]
    })

    // Try to find a matching existing variation to retain the id
    const matchedExisting = existingVariations.find(existing => {
      return Object.keys(variation).every(key => existing[key] === variation[key])
    })

    return {
      ...variation,
      _id: matchedExisting?._id || undefined, // Retain ID if available
      description: matchedExisting?.description || '',
      stockStatus: matchedExisting?.stockStatus || 'in_stock',
      stockQuantity: matchedExisting?.stockQuantity || 0,
      allowBackorders: matchedExisting?.allowBackorders || false,
      weight: matchedExisting?.weight || 0,
      dimensions: matchedExisting?.dimensions || { length: 0, width: 0, height: 0 },
      regularPrice: matchedExisting?.regularPrice || 0,
      salePrice: matchedExisting?.salePrice || 0,
      purchasedPrice: matchedExisting?.purchasedPrice || 0,
      customImageUrl: matchedExisting?.customImageUrl || ''
    }
  })
}

export default function ProductVariants({ productAttributes, defaultAttributeVariations, defaultProductVariations }) {

  console.log(defaultProductVariations,'defaultProductVariationsdefaultProductVariations')

  const hasAttributes = productAttributes && productAttributes.length > 0
  const [tabIndex, setTabIndex] = useState(0)
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({})
  const [allAttributes, setAllAttributes] = useState({})
  const { control, watch, reset, setValue, getValues, isSubmitted } = useFormContext()

  useEffect(() => {
    // Step 0: Guard clause — only run when all required data is available
    const isReady =
      Array.isArray(productAttributes) &&
      productAttributes.length > 0 &&
      Array.isArray(defaultAttributeVariations) &&
      defaultAttributeVariations.length > 0 &&
      Array.isArray(defaultProductVariations) &&
      defaultProductVariations.length > 0

    if (!isReady || !hasAttributes) return

    // Step 1: Build attribute selection map based on defaultAttributeVariations
    const attributeValueMap = {}
    const selectedAttributeNames = new Set()

    productAttributes.forEach(attribute => {
      const attributeName = attribute.name.toLowerCase()

      attribute.variations.forEach(variation => {
        const variationId = variation._id

        if (defaultAttributeVariations.includes(variationId)) {
          // Format value with measurement unit if available
          const formattedValue = variation.measurementUnit
            ? `${variation.metaValue} ${variation.measurementUnit.name}`
            : variation.metaValue

          if (!attributeValueMap[attributeName]) {
            attributeValueMap[attributeName] = []
          }

          if (!attributeValueMap[attributeName].includes(formattedValue)) {
            attributeValueMap[attributeName].push(formattedValue)
          }

          selectedAttributeNames.add(attributeName)
        }
      })
    })

    // Step 2: Update local UI state
    setSelectedAttributes(Array.from(selectedAttributeNames))
    setSelectedAttributeValues(attributeValueMap)

    // Step 3: Set form values using React Hook Form
    setValue('attributeVariations', defaultAttributeVariations, { shouldValidate: true })
    setValue('productVariations', defaultProductVariations, { shouldValidate: true })
  }, [hasAttributes, productAttributes, defaultAttributeVariations, defaultProductVariations, setValue])

  const initialProductVariationsRef = useRef([])

  // State to track removed variations for submission
  const [removedProductVariations, setRemovedProductVariations] = useState([])

  // Watch current variations and selected attributes
  const productVariations = useWatch({ control, name: 'productVariations' }) || []
  const watchedSelectedAttributeValues = useWatch({ control, name: 'selectedAttributeValues' }) || []

  // On first render, capture initial variations for comparison
  useEffect(() => {
    if (defaultProductVariations.length && initialProductVariationsRef.current.length === 0) {
      initialProductVariationsRef.current = [...defaultProductVariations]
    }
  }, [defaultProductVariations])

  // Detect removed variations and update selected attributes accordingly
  useEffect(() => {
    const currentVariationKeys = productVariations?.map(variation =>
      variation?.attributes
        ?.map(attr => attr.metaValue)
        .sort()
        .join('-')
    )

    const removed = initialProductVariationsRef?.current?.filter(initialVariation => {
      const key = initialVariation?.attributes
        ?.map(attr => attr.metaValue)
        .sort()
        .join('-')
      return !currentVariationKeys.includes(key)
    })


    if (removed.length) {
      const ids = removed.map(ele => ele?._id)
      setRemovedProductVariations(ids)

      // Remove attribute values associated with removed variations
      const removedValues = new Set(removed?.flatMap(variation => variation?.attributes?.map(attr => attr.metaValue)))

      const filteredAttributeValues = watchedSelectedAttributeValues?.filter(value => !removedValues.has(value))

      setValue('selectedAttributeValues', filteredAttributeValues)
    }
  }, [productVariations])

  useEffect(() => {
    if (productAttributes && productAttributes.length > 0) {
      const attributesMap = {}

      productAttributes.forEach(attribute => {
        const name = attribute.name.toLowerCase()
        const values = attribute.variations.map(variation =>
          variation.measurementUnit ? `${variation.metaValue} ${variation.measurementUnit.name}` : variation.metaValue
        )
        attributesMap[name] = values
      })

      setAllAttributes(attributesMap)
    }
  }, [productAttributes])

  // Get RHF methods from context (parent form)

  // Watch variations from form context
  const variations = watch('productVariations') || []

  // When selectedAttributes changes, initialize attribute values if not set
  useEffect(() => {
    const initSelectedValues = {}
    selectedAttributes.forEach(attr => {
      initSelectedValues[attr] = selectedAttributeValues[attr] || []
    })
    setSelectedAttributeValues(initSelectedValues)
  }, [selectedAttributes])

  // When selectedAttributeValues changes, generate new variations and update form
  useEffect(() => {
    const newVariations = generateVariations(selectedAttributeValues, defaultProductVariations)
    console.log(newVariations,'newVariations')
    setValue('productVariations', newVariations, { shouldValidate: true })
  }, [selectedAttributeValues, setValue])

  useEffect(() => {
    // Collect matched variation IDs based on selected attribute values
    const matchedVariationIds = []

    selectedAttributes.forEach(selectedAttributeName => {
      const lowerCaseName = selectedAttributeName.toLowerCase()

      // Find the corresponding attribute object from productAttributes
      const matchedAttribute = productAttributes.find(attr => attr.name.toLowerCase() === lowerCaseName)

      if (matchedAttribute) {
        const selectedValues = selectedAttributeValues[lowerCaseName] || []

        matchedAttribute.variations.forEach(variation => {
          const formattedValue = variation.measurementUnit
            ? `${variation.metaValue} ${variation.measurementUnit.name}`
            : variation.metaValue

          if (selectedValues.includes(formattedValue)) {
            matchedVariationIds.push(variation._id)
          }
        })
      }
    })

    // Update attributeVariations in form context with array of variation IDs
    setValue('attributeVariations', matchedVariationIds, { shouldValidate: true })
  }, [selectedAttributes, selectedAttributeValues, productAttributes, setValue])

  // Disable variations tab if no attributes or any attribute has no values selected
  const isVariationsDisabled =
    selectedAttributes.length === 0 || Object.values(selectedAttributeValues).some(vals => vals.length === 0)

  // Handle attribute selection change
  const handleAttributesChange = event => {
    setSelectedAttributes(event.target.value)
  }

  // Handle selected values for each attribute
  const handleAttributeValuesChange = (attributeName, values) => {
    setSelectedAttributeValues(prev => ({
      ...prev,
      [attributeName]: values
    }))
  }

  const [removedVariationIds, setRemovedVariationIds] = useState([])

  const handleRemoveVariation = removeIndex => {
    const currentVariations = getValues('productVariations')
    const variationToRemove = currentVariations[removeIndex]

    // Save removed ID only if it exists (edit mode)
    if (variationToRemove.id) {
      setRemovedVariationIds(prev => [...prev, variationToRemove.id])
    }

    const updatedVariations = currentVariations.filter((_, i) => i !== removeIndex)
    setValue('productVariations', updatedVariations)
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

              <FormControl sx={{ mb: 4, minWidth: 300 }} variant='outlined' margin='normal' error={!hasAttributes}>
                <InputLabel id='select-attributes-label'>Attributes</InputLabel>
                <Select
                  labelId='select-attributes-label'
                  multiple
                  value={selectedAttributes}
                  onChange={handleAttributesChange}
                  input={<OutlinedInput label='Attributes' />}
                  renderValue={selected => selected.join(', ')}
                >
                  {Object.keys(allAttributes).map(attributeName => (
                    <MenuItem key={attributeName} value={attributeName}>
                      <Checkbox checked={selectedAttributes.includes(attributeName)} />
                      <ListItemText primary={attributeName.charAt(0).toUpperCase() + attributeName.slice(1)} />
                    </MenuItem>
                  ))}
                </Select>

                {!hasAttributes && <FormHelperText>Please create the attribute to show here.</FormHelperText>}
              </FormControl>

              {selectedAttributes.length > 0 && (
                <>
                  <Typography variant='h6' gutterBottom>
                    Select Attribute Values
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedAttributes.map(attributeName => {
                      const valuesSelected = selectedAttributeValues[attributeName]?.length > 0
                      // Show error only if form has been submitted and no values selected
                      const showError = isSubmitted && !valuesSelected

                      return (
                        <Grid item xs={12} md={6} key={attributeName}>
                          <FormControl sx={{ mb: 3, minWidth: 300 }} fullWidth error={showError} required>
                            <InputLabel id={`${attributeName}-label`}>
                              {attributeName.charAt(0).toUpperCase() + attributeName.slice(1)}
                            </InputLabel>
                            <Select
                              fullWidth
                              labelId={`${attributeName}-label`}
                              multiple
                              value={selectedAttributeValues[attributeName] || []}
                              onChange={e => handleAttributeValuesChange(attributeName, e.target.value)}
                              input={<OutlinedInput label={attributeName} />}
                              renderValue={selected => selected.join(', ')}
                            >
                              {allAttributes[attributeName]?.map(value => (
                                <MenuItem key={value} value={value}>
                                  <Checkbox
                                    checked={selectedAttributeValues[attributeName]?.includes(value) || false}
                                  />
                                  <ListItemText primary={value} />
                                </MenuItem>
                              ))}
                            </Select>
                            {showError && (
                              <FormHelperText>Please select at least one value for {attributeName}.</FormHelperText>
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

              {variations.map((variation, index) => (
                <Box key={index} sx={{ mb: 4, border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                  <Box sx={{}}>
                    <IconButton onClick={() => handleRemoveVariation(index)}>
                      <i className='ri-delete-bin-line text-xl text-red-600' />
                    </IconButton>
                  </Box>
                  <Typography variant='subtitle1' gutterBottom>
                    {selectedAttributes
                      .map(attr => `${attr.charAt(0).toUpperCase() + attr.slice(1)}: ${variation[attr]}`)
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

                              const handleRemoveImage = removeIndex => {
                                const updated = value.filter((_, i) => i !== removeIndex)
                                onChange(updated)
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
                                      {value.map((file, i) => (
                                        <ListItem
                                          key={i}
                                          secondaryAction={
                                            <IconButton onClick={() => handleRemoveImage(i)}>
                                              <i className='ri-close-line text-xl' />
                                            </IconButton>
                                          }
                                        >
                                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <img
                                              src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                                              alt={`variation-image-${i}`}
                                              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                                            />
                                            <div>
                                              <Typography className='file-name font-medium' color='text.primary'>
                                                {file.name || `Image ${i + 1}`}
                                              </Typography>
                                              {file.size && (
                                                <Typography variant='body2'>
                                                  {file.size > 1000000
                                                    ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                                                    : `${(file.size / 1024).toFixed(1)} KB`}
                                                </Typography>
                                              )}
                                            </div>
                                          </div>
                                        </ListItem>
                                      ))}
                                    </List>
                                  )}
                                </Box>
                              )
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name={`productVariations.${index}.stockStatus`}
                        control={control}
                        defaultValue={variation.stockStatus}
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
                              inputProps={{ min: 0 }}
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
                        name={`productVariations.${index}.regularPrice`}
                        control={control}
                        defaultValue={variation.regularPrice}
                        rules={{ required: 'Regular Price is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Regular Price'
                              type='number'
                              inputProps={{ step: 0.01, min: 0 }}
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
                              inputProps={{ step: 0.01, min: 0 }}
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
                              inputProps={{ step: 0.01, min: 0 }}
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
                        name={`productVariations.${index}.allowBackorders`}
                        control={control}
                        defaultValue={variation.allowBackorders}
                        rules={{ required: 'Allow Backorders selection is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <Typography>Allow Backorders</Typography>
                            <Switch
                              {...field}
                              checked={field.value}
                              onChange={e => field.onChange(e.target.checked)}
                              sx={{ ml: 1 }}
                            />
                            {error && (
                              <Typography variant='caption' color='error' sx={{ ml: 2 }}>
                                {error.message}
                              </Typography>
                            )}
                          </>
                        )}
                      />
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
                              label='Weight (kg)'
                              type='number'
                              inputProps={{ step: 0.01, min: 0 }}
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
                              label='Length'
                              type='number'
                              inputProps={{ step: 0.01, min: 0 }}
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
                              label='Width'
                              type='number'
                              inputProps={{ step: 0.01, min: 0 }}
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
                              label='Height'
                              type='number'
                              inputProps={{ step: 0.01, min: 0 }}
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
                        name={`productVariations.${index}.NumberOfTiles`}
                        control={control}
                        defaultValue={variation.NumberOfTiles}
                        rules={{ required: 'Number of tiles per box is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Number of tiles per box'
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
                        name={`productVariations.${index}.BoxSize`}
                        control={control}
                        defaultValue={variation.BoxSize}
                        rules={{ required: 'Box sizes are required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Box sizes (sqm/kg)'
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
                        name={`productVariations.${index}.PalletSize`}
                        control={control}
                        defaultValue={variation.PalletSize}
                        rules={{ required: 'Pallet Size is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <TextField
                              {...field}
                              label='Pallet Size (sqm/kg)'
                              fullWidth
                              variant='outlined'
                              error={!!error}
                              helperText={error?.message}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 12 }}>
                      <Controller
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
                      />
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
