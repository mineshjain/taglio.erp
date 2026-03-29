import React, { useEffect, useState, useMemo } from "react";
import { Input, Combobox } from "./ui";
import { LOCATIONS, CountryName } from "@/constants/locations";
import { useApp } from "@/AppContext";

interface AddressFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({ formData, setFormData }) => {
  const { customLocations, addCustomLocation } = useApp();
  const [countries] = useState(Object.keys(LOCATIONS));

  const states = useMemo(() => {
    if (!formData.country) return [];
    const defaultStates = Object.keys(LOCATIONS[formData.country as CountryName] || {});
    const customStates = Object.keys(customLocations[formData.country] || {});
    return Array.from(new Set([...defaultStates, ...customStates])).sort();
  }, [formData.country, customLocations]);

  const cities = useMemo(() => {
    if (!formData.country || !formData.state) return [];
    const defaultCities = LOCATIONS[formData.country as CountryName]?.[formData.state] || [];
    const customCities = customLocations[formData.country]?.[formData.state] || [];
    return Array.from(new Set([...defaultCities, ...customCities])).sort();
  }, [formData.country, formData.state, customLocations]);

  // Update mailing address whenever any part changes
  useEffect(() => {
    const parts = [
      formData.street,
      formData.city,
      formData.state,
      formData.country,
      formData.pincode ? `PIN: ${formData.pincode}` : ""
    ].filter(Boolean);
    
    const mailingAddress = parts.join(", ");
    if (mailingAddress !== formData.address) {
      setFormData({ ...formData, address: mailingAddress });
    }
  }, [formData.street, formData.city, formData.state, formData.country, formData.pincode]);

  const handleCityChange = (val: string) => {
    setFormData({ ...formData, city: val });
    if (formData.country && formData.state && val) {
      // If it's a new city, add it to custom locations
      const isDefault = LOCATIONS[formData.country as CountryName]?.[formData.state]?.includes(val);
      const isCustom = customLocations[formData.country]?.[formData.state]?.includes(val);
      if (!isDefault && !isCustom) {
        addCustomLocation(formData.country, formData.state, val);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Input
        label="Street / Address Details"
        required
        placeholder="e.g. House No, Street Name, Landmark"
        value={formData.street || ""}
        onChange={e => setFormData({ ...formData, street: e.target.value })}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Combobox
          label="Country"
          required
          options={countries.map(c => ({ label: c, value: c }))}
          value={formData.country || ""}
          onChange={val => setFormData({ ...formData, country: val, state: "", city: "" })}
          placeholder="Select Country"
        />
        <Combobox
          label="State / Province"
          required
          disabled={!formData.country}
          options={states.map(s => ({ label: s, value: s }))}
          value={formData.state || ""}
          onChange={val => setFormData({ ...formData, state: val, city: "" })}
          placeholder="Select State"
          allowCustom
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Combobox
          label="City"
          required
          disabled={!formData.state}
          options={cities.map(c => ({ label: c, value: c }))}
          value={formData.city || ""}
          onChange={handleCityChange}
          placeholder="Select City"
          allowCustom
        />
        <Input
          label="Pincode / Zip Code"
          required
          value={formData.pincode || ""}
          onChange={e => setFormData({ ...formData, pincode: e.target.value })}
        />
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated Mailing Address</p>
        <p className="text-sm font-bold text-slate-700">{formData.address || "Fill details to generate address..."}</p>
      </div>
    </div>
  );
};
