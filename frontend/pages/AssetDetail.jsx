import AssetBarcode from '../components/AssetBarcode';

export default function AssetDetailPage() {
  return (
    <>
      <h1>{asset.asset_name}</h1>
      <AssetBarcode asset={asset} />  {/* Add here */}
      {/* rest of page */}
    </>
  );
}