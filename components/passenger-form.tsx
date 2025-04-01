"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PassengerFormProps {
  passengerNumber: number
}

export function PassengerForm({ passengerNumber }: PassengerFormProps) {
  const [passengerType, setPassengerType] = useState("adult")

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div>
        <RadioGroup
          defaultValue="adult"
          value={passengerType}
          onValueChange={setPassengerType}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="adult" id={`adult-${passengerNumber}`} />
            <Label htmlFor={`adult-${passengerNumber}`}>Adult (12+ years)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="child" id={`child-${passengerNumber}`} />
            <Label htmlFor={`child-${passengerNumber}`}>Child (2-11 years)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="infant" id={`infant-${passengerNumber}`} />
            <Label htmlFor={`infant-${passengerNumber}`}>Infant (0-2 years)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`first-name-${passengerNumber}`}>First Name</Label>
          <Input id={`first-name-${passengerNumber}`} placeholder="Enter first name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`last-name-${passengerNumber}`}>Last Name</Label>
          <Input id={`last-name-${passengerNumber}`} placeholder="Enter last name" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`dob-${passengerNumber}`}>Date of Birth</Label>
          <div className="grid grid-cols-3 gap-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <SelectItem key={month} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`gender-${passengerNumber}`}>Gender</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Travel Document</Label>
        <RadioGroup defaultValue="passport" className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="passport" id={`passport-${passengerNumber}`} />
            <Label htmlFor={`passport-${passengerNumber}`}>Passport</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="id-card" id={`id-card-${passengerNumber}`} />
            <Label htmlFor={`id-card-${passengerNumber}`}>ID Card</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`document-number-${passengerNumber}`}>Document Number</Label>
          <Input id={`document-number-${passengerNumber}`} placeholder="Enter document number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`nationality-${passengerNumber}`}>Nationality</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
              <SelectItem value="fr">France</SelectItem>
              <SelectItem value="de">Germany</SelectItem>
              <SelectItem value="jp">Japan</SelectItem>
              <SelectItem value="cn">China</SelectItem>
              <SelectItem value="in">India</SelectItem>
              <SelectItem value="br">Brazil</SelectItem>
              {/* Add more countries as needed */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`expiry-date-${passengerNumber}`}>Document Expiry Date</Label>
          <div className="grid grid-cols-3 gap-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <SelectItem key={month} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`issuing-country-${passengerNumber}`}>Issuing Country</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
              <SelectItem value="fr">France</SelectItem>
              <SelectItem value="de">Germany</SelectItem>
              <SelectItem value="jp">Japan</SelectItem>
              <SelectItem value="cn">China</SelectItem>
              <SelectItem value="in">India</SelectItem>
              <SelectItem value="br">Brazil</SelectItem>
              {/* Add more countries as needed */}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
