interface DeviceSize {
  name: string;
  width: number;
  height: number;
  category: 'mobile' | 'tablet' | 'laptop' | 'desktop';
  description?: string;
}

export const deviceSizes: DeviceSize[] = [
  // Mobile devices
  { name: 'iPhone SE', width: 375, height: 667, category: 'mobile', description: 'iPhone SE, iPhone 8' },
  { name: 'iPhone 12/13/14', width: 390, height: 844, category: 'mobile', description: 'Modern iPhones' },
  { name: 'iPhone 12/13/14 Pro Max', width: 428, height: 926, category: 'mobile', description: 'Larger iPhones' },
  { name: 'Android Small', width: 360, height: 640, category: 'mobile', description: 'Common Android width' },
  { name: 'Android Large', width: 412, height: 915, category: 'mobile', description: 'Larger Android devices' },

  // Tablets
  { name: 'iPad Mini', width: 768, height: 1024, category: 'tablet', description: 'iPad Mini, similar tablets' },
  { name: 'iPad', width: 820, height: 1180, category: 'tablet', description: 'Standard iPad' },
  { name: 'iPad Pro', width: 1024, height: 1366, category: 'tablet', description: 'iPad Pro 11"' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet', description: 'iPad Pro 12.9"' },

  // Laptops
  { name: 'Small Laptop', width: 1280, height: 800, category: 'laptop', description: '13" laptop' },
  { name: 'Medium Laptop', width: 1440, height: 900, category: 'laptop', description: '14-15" laptop' },
  { name: 'Large Laptop', width: 1680, height: 1050, category: 'laptop', description: '16" laptop' },

  // Desktops
  { name: 'HD Desktop', width: 1920, height: 1080, category: 'desktop', description: '1080p displays' },
  { name: '2K Desktop', width: 2560, height: 1440, category: 'desktop', description: '1440p displays' },
  { name: '4K Desktop', width: 3840, height: 2160, category: 'desktop', description: '4K displays' },
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