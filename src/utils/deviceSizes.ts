export interface DeviceSize {
  name: string;
  width: number;
  height: number;
  category: 'mobile' | 'tablet' | 'laptop' | 'desktop';
  description?: string;
}

export const deviceSizes: DeviceSize[] = [
  // Mobile devices
  { name: 'iPhone SE', width: 375, height: 667, category: 'mobile', description: 'Smaller Apple form factor' },
  { name: 'iPhone 12/13/14', width: 390, height: 844, category: 'mobile', description: 'Standard size iPhones' },
  { name: 'iPhone 12/13/14 Pro Max', width: 428, height: 926, category: 'mobile', description: 'Plus/Max variants' },
  { name: 'Android Small', width: 360, height: 640, category: 'mobile', description: 'Google Pixel, Samsung Galaxy S base models' },
  { name: 'Android Large', width: 412, height: 915, category: 'mobile', description: 'Samsung Galaxy Ultra, Google Pixel XL' },

  // Tablets
  { name: 'iPad Mini', width: 768, height: 1024, category: 'tablet', description: '7.9-8.3 inch tablets' },
  { name: 'iPad', width: 820, height: 1180, category: 'tablet', description: '10.2-10.9 inch range' },
  { name: 'iPad Pro', width: 1024, height: 1366, category: 'tablet', description: '11 inch pro tablets' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet', description: 'Largest tablets, landscape orientation' },

  // Laptops
  { name: 'Small Laptop', width: 1280, height: 800, category: 'laptop', description: 'MacBook Air, ultrabooks' },
  { name: 'Medium Laptop', width: 1440, height: 900, category: 'laptop', description: 'Most popular laptop size' },
  { name: 'Large Laptop', width: 1680, height: 1050, category: 'laptop', description: 'MacBook Pro 16", gaming laptops' },

  // Desktops
  { name: 'HD Desktop', width: 1920, height: 1080, category: 'desktop', description: 'Full HD monitors' },
  { name: '2K Desktop', width: 2560, height: 1440, category: 'desktop', description: 'QHD desktop monitors' },
  { name: '4K Desktop', width: 3840, height: 2160, category: 'desktop', description: 'Ultra HD large displays' },
];

export const getDeviceSizeByCategory = (category: DeviceSize['category']) => {
  return deviceSizes.filter(size => size.category === category);
};

export const getCurrentSizeCategory = (width: number): DeviceSize['category'] | null => {
  if (width <= 428) return 'mobile';
  if (width <= 1024) return 'tablet';
  if (width <= 1680) return 'laptop';
  return 'desktop';
};