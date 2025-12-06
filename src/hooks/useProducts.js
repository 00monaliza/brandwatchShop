import { useMemo } from 'react';

export const useProducts = (products, filters, sortType) => {
  return useMemo(() => {
    let filtered = [...products];

    // Применение фильтров
    if (filters.brand.length > 0) {
      filtered = filtered.filter(p => filters.brand.includes(p.brand));
    }
    if (filters.diameter.length > 0) {
      filtered = filtered.filter(p => filters.diameter.includes(p.diameter.toString()));
    }
    if (filters.gender.length > 0) {
      filtered = filtered.filter(p => filters.gender.includes(p.gender));
    }
    if (filters.caseShape.length > 0) {
      filtered = filtered.filter(p => filters.caseShape.includes(p.caseShape));
    }
    if (filters.movement.length > 0) {
      filtered = filtered.filter(p => filters.movement.includes(p.movement));
    }
    if (filters.dialColor.length > 0) {
      filtered = filtered.filter(p => filters.dialColor.includes(p.dialColor));
    }
    if (filters.caseMaterial.length > 0) {
      filtered = filtered.filter(p => filters.caseMaterial.includes(p.caseMaterial));
    }
    if (filters.glass.length > 0) {
      filtered = filtered.filter(p => filters.glass.includes(p.glass));
    }
    if (filters.strapMaterial.length > 0) {
      filtered = filtered.filter(p => filters.strapMaterial.includes(p.strapMaterial));
    }
    if (filters.claspType.length > 0) {
      filtered = filtered.filter(p => filters.claspType.includes(p.claspType));
    }
    if (filters.waterResistance.length > 0) {
      filtered = filtered.filter(p => filters.waterResistance.includes(p.waterResistance));
    }

    // Применение сортировки
    const sorted = [...filtered];
    
    switch (sortType) {
      case 'priceLow':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => b.isNew - a.isNew);
        break;
      case 'maxDiscount':
        sorted.sort((a, b) => b.discount - a.discount);
        break;
      case 'popularity':
      default:
        // По умолчанию - по популярности (id)
        sorted.sort((a, b) => b.id - a.id);
        break;
    }

    return sorted;
  }, [products, filters, sortType]);
};
