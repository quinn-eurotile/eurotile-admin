"use client"

import { useState } from "react"
/* import { Button } from "@mui/material/button"
import { Checkbox } from "@mui/material/checkbox"
import { Slider } from "@mui/material/slider" */
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import { FormControlLabel, FormGroup, Slider } from "@mui/material"
import CustomCheckboxLabel from "./cstm-checkbox"
/* import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@mui/material/sheet" */

const FilterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="border-b pb-6 mb-6">
      <h4
        className="font-medium mb-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <i className={`ri-${isOpen ? "arrow-up-s-line" : "arrow-down-s-line"} h-4 w-4 transition-transform`}></i>
      </h4>
      <div className={`${isOpen ? "block" : "hidden"}`}>{children}</div>
    </div>
  )
}


export default function FilterSidebar({ isMobile = false, isOpen = false, onClose }) {
  const filterContent = (
    <>
      <div className="relative mb-6">
        <input type="text" placeholder="Search"   className="w-full border-0 border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black" />
        <i className="ri-search-line text-xl absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"></i>
      </div>

      <FilterSection title="Home Space">
        <FormGroup row>
          <div className="space-y-3">
            <div className="flex items-center gap-2">

             <CustomCheckboxLabel id="space-1" label="Bathroom" name="basic-checked" />

            </div>
            <div className="flex items-center gap-2">
             <CustomCheckboxLabel id="space-1" label="Kitchen" name="basic-checked" />
            </div>
            <div className="flex items-center gap-2">
              <CustomCheckboxLabel id="space-1" label="Living room" name="basic-checked" />
              </div>
            <div className="flex items-center gap-2">
              <CustomCheckboxLabel id="space-1" label="Outdoor" name="basic-checked" />
              </div>
            <div className="flex items-center gap-2">
              <CustomCheckboxLabel id="space-1" label="Pool" name="basic-checked" />
              </div>
          </div>
        </FormGroup>
      </FilterSection>

      <FilterSection title="Filter By Color">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CustomCheckboxLabel id="space-1" label="Red" name="basic-checked" />
            <span className="text-xs text-gray-400 ml-auto">(5)</span>
          </div>
          <div className="flex items-center gap-2">
            <CustomCheckboxLabel id="space-1" label="Green" name="basic-checked" />
            <span className="text-xs text-gray-400 ml-auto">(5)</span>
          </div>
          <div className="flex items-center gap-2">
            <CustomCheckboxLabel id="space-1" label="Blue" name="basic-checked" />
            <span className="text-xs text-gray-400 ml-auto">(5)</span>
          </div>
        </div>
      </FilterSection>


      <FilterSection title="Filter By Price">
        <div className="px-0">

          <div className="flex items-center justify-between mt-4 mb-4 text-sm">
            <span>£10</span>
            <span>£5,780</span>
          </div>
          <Slider defaultValue={[20, 37]} valueLabelDisplay='auto' aria-labelledby='range-slider' sx={{color: '#991b1b',   }}/>
        </div>
      </FilterSection>

      <div className="flex gap-2">
        <Button variant='contained' size="" className="bg-red-800 hover:bg-black capitalize border-0 text-white px-4 py-2 rounded-md flex items-center gap-2 font-montserrat">Apply Filter</Button>
         <Button variant='outlined' color='secondary' size="" onClick={onClose} className="border-gray-400 text-black capitalize font-montserrat">
        Clear Filter
      </Button>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{filterContent}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="w-full md:w-64 shrink-0">
      <h3 className="text-xl text-redText font-medium mb-4">Filters</h3>
      {filterContent}
    </div>
  )
}
