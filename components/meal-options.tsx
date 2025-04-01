"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface MealOptionsProps {
  onChange?: (meals: { outbound: string; return: string }) => void
}

export function MealOptions({ onChange }: MealOptionsProps) {
  const [outboundMeal, setOutboundMeal] = useState("standard")
  const [returnMeal, setReturnMeal] = useState("standard")

  // Update parent component when values change
  useEffect(() => {
    if (onChange) {
      onChange({
        outbound: outboundMeal.charAt(0).toUpperCase() + outboundMeal.slice(1),
        return: returnMeal.charAt(0).toUpperCase() + returnMeal.slice(1),
      })
    }
  }, [outboundMeal, returnMeal, onChange])

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <h4 className="mb-2 text-sm font-medium">Outbound Flight Meal</h4>
        <RadioGroup defaultValue="standard" value={outboundMeal} onValueChange={setOutboundMeal}>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="standard" id="meal-standard-out" />
            <div>
              <Label htmlFor="meal-standard-out">Standard Meal</Label>
              <p className="text-sm text-muted-foreground">Included with your ticket</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="vegetarian" id="meal-vegetarian-out" />
            <div>
              <Label htmlFor="meal-vegetarian-out">Vegetarian</Label>
              <p className="text-sm text-muted-foreground">No additional cost</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="vegan" id="meal-vegan-out" />
            <div>
              <Label htmlFor="meal-vegan-out">Vegan</Label>
              <p className="text-sm text-muted-foreground">No additional cost</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="kosher" id="meal-kosher-out" />
            <div>
              <Label htmlFor="meal-kosher-out">Kosher</Label>
              <p className="text-sm text-muted-foreground">No additional cost</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="halal" id="meal-halal-out" />
            <div>
              <Label htmlFor="meal-halal-out">Halal</Label>
              <p className="text-sm text-muted-foreground">No additional cost</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="premium" id="meal-premium-out" />
            <div>
              <Label htmlFor="meal-premium-out">Premium Meal</Label>
              <p className="text-sm text-muted-foreground">Gourmet meal with premium ingredients ($15.99)</p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="rounded-md border p-4">
        <h4 className="mb-2 text-sm font-medium">Return Flight Meal</h4>
        <RadioGroup defaultValue="standard" value={returnMeal} onValueChange={setReturnMeal}>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="standard" id="meal-standard-return" />
            <div>
              <Label htmlFor="meal-standard-return">Standard Meal</Label>
              <p className="text-sm text-muted-foreground">Included with your ticket</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="vegetarian" id="meal-vegetarian-return" />
            <div>
              <Label htmlFor="meal-vegetarian-return">Vegetarian</Label>
              <p className="text-sm text-muted-foreground">No additional cost</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="vegan" id="meal-vegan-return" />
            <div>
              <Label htmlFor="meal-vegan-return">Vegan</Label>
              <p className="text-sm text-muted-foreground">No additional cost</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="kosher" id="meal-kosher-return" />
            <div>
              <Label htmlFor="meal-kosher-return">Kosher</Label>
              <p className="text-sm text-muted-foreground">No additional cost</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="halal" id="meal-halal-return" />
            <div>
              <Label htmlFor="meal-halal-return">Halal</Label>
              <p className="text-sm text-muted-foreground">No additional cost</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="premium" id="meal-premium-return" />
            <div>
              <Label htmlFor="meal-premium-return">Premium Meal</Label>
              <p className="text-sm text-muted-foreground">Gourmet meal with premium ingredients ($15.99)</p>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
