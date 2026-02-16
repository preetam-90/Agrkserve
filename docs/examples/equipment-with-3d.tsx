/**
 * Equipment Detail Page with 3D Integration Example
 */

import { LazyThreeScene } from '@/components/three/LazyThreeScene';
import { useDeviceCapability } from '@/lib/animations/device-capability';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';

interface DemoEquipment {
  name: string;
  model3dUrl?: string | null;
  images: string[];
  description: string;
}

export default function EquipmentDetailPage({ equipment }: { equipment: DemoEquipment }) {
  const deviceInfo = useDeviceCapability();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold">{equipment.name}</h1>

      {/* 3D Model Viewer with automatic fallback */}
      {equipment.model3dUrl ? (
        <LazyThreeScene
          componentPath="@/components/three/Equipment3DModel"
          componentProps={{
            modelUrl: equipment.model3dUrl,
            onLoad: () => console.log('3D model loaded'),
          }}
          className="my-8 h-[600px] w-full rounded-lg"
          notSupportedFallback={
            <ProductImageGallery images={equipment.images} productName={equipment.name} />
          }
        />
      ) : (
        <ProductImageGallery images={equipment.images} productName={equipment.name} />
      )}

      {/* Device capability info (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 rounded-lg bg-black/50 p-4 text-xs text-white">
          <p>Device: {deviceInfo.capability}</p>
          <p>3D Enabled: {deviceInfo.capability !== 'low' ? 'Yes' : 'No'}</p>
          <p>Mobile: {deviceInfo.isMobile ? 'Yes' : 'No'}</p>
        </div>
      )}

      {/* Rest of equipment details */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Specifications</h2>
        <p>{equipment.description}</p>
      </div>
    </div>
  );
}
