import { useState, useEffect } from 'react';
import { propertyApi } from '@/api/propertyApi';
import { propertyCategoryApi } from '@/api/propertyCategoryApi';
import type { Property } from '@/types/property.types';
import type { PropertyCategory } from '@/types/propertyCategory.types';
import type { BookingProperty } from '@/types/booking.types';

export function useStep3Properties(properties: BookingProperty[], setProperties: (p: BookingProperty[]) => void) {
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [propertiesRes, categoriesRes] = await Promise.all([
          propertyApi.getAllProperties({ is_available: true, include_images: true }),
          propertyCategoryApi.getAllPropertyCategories({ is_active: true }),
        ]);
        if (propertiesRes.success) setAvailableProperties(propertiesRes.data);
        if (categoriesRes.success) setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProperties = selectedCategory === 'all'
    ? availableProperties : availableProperties.filter(p => String(p.category_id) === selectedCategory);

  const handleAddProperty = (property: Property) => {
    const exists = properties.find(p => p.property_id === property.id);
    if (exists) {
      handleUpdateQuantity(properties.indexOf(exists), exists.quantity + 1);
      return;
    }
    setProperties([...properties, {
      property_id: property.id, property_name: property.name,
      property_category: property.category?.name || 'Uncategorized',
      quantity: 1, price: property.price, subtotal: property.price,
    }]);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updated = [...properties];
    updated[index].quantity = newQuantity;
    updated[index].subtotal = String(Number(updated[index].price) * newQuantity);
    setProperties(updated);
  };

  const handleRemoveProperty = (index: number) => setProperties(properties.filter((_, i) => i !== index));

  const getPrimaryImage = (property: Property) => {
    const primaryImg = property.images?.find(img => img.is_primary);
    return primaryImg?.url || property.images?.[0]?.url || '';
  };

  const calculateTotal = () => properties.reduce((sum, prop) => sum + Number(prop.subtotal), 0);

  return {
    availableProperties, categories, isLoading,
    selectedCategory, setSelectedCategory,
    filteredProperties,
    handleAddProperty, handleUpdateQuantity, handleRemoveProperty,
    getPrimaryImage, calculateTotal,
  };
}