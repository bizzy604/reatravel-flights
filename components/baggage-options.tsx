"use client"
import { useState, useEffect } from "react"
import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface BaggageOptionsProps {
  onChange?: (baggage: { included: string; additional: string }) => void
}

export function BaggageOptions({ onChange }: BaggageOptionsProps) {
  const [checkedBags, setCheckedBags] = useState(1)
  const [specialEquipment, setSpecialEquipment] = useState("none")

  // Update parent component when values change
  useEffect(() => {
    if (onChange) {
      const included = "1 personal item, 1 carry-on bag, 1 checked bag"
      let additional = `${checkedBags} additional checked bag${checkedBags !== 1 ? "s" : ""}`

      if (specialEquipment !== "none") {
        additional += `, ${specialEquipment} equipment`
      }

      onChange({
        included,
        additional: checkedBags > 0 || specialEquipment !== "none" ? additional : "None",
      })
    }
  }, [checkedBags, specialEquipment, onChange])

  const incrementBags = () => {
    if (checkedBags < 5) {
      setCheckedBags(checkedBags + 1)
    }
  }

  const decrementBags = () => {
    if (checkedBags > 0) {
      setCheckedBags(checkedBags - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4">
        <h4 className="mb-2 text-sm font-medium">Included in Your Fare</h4>
        <div className="space-y-2 text-sm">
          <p>• 1 personal item (must fit under the seat)</p>
          <p>• 1 carry-on bag (max 8 kg)</p>
          <p>• 1 checked bag (max 23 kg)</p>
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h4 className="mb-4 text-sm font-medium">Additional Checked Baggage</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Checked Bags</p>
            <p className="text-sm text-muted-foreground">$35.00 per bag (max 23 kg each)</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={decrementBags}
              disabled={checkedBags === 0}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Decrease</span>
            </Button>
            <span className="w-8 text-center">{checkedBags}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={incrementBags}
              disabled={checkedBags === 5}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Increase</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm">
          <p className="font-medium">Total: ${(checkedBags * 35).toFixed(2)}</p>
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h4 className="mb-4 text-sm font-medium">Special Equipment</h4>
        <RadioGroup defaultValue="none" value={specialEquipment} onValueChange={setSpecialEquipment}>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="none" id="special-none" />
            <div>
              <Label htmlFor="special-none">None</Label>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="sports" id="special-sports" />
            <div>
              <Label htmlFor="special-sports">Sports Equipment</Label>
              <p className="text-sm text-muted-foreground">Skis, golf clubs, bicycles, etc. ($50.00)</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="musical" id="special-musical" />
            <div>
              <Label htmlFor="special-musical">Musical Instrument</Label>
              <p className="text-sm text-muted-foreground">Guitar, violin, etc. ($35.00)</p>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
