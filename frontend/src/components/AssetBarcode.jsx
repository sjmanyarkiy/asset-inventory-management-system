export default function AssetBarcode({ asset }) {
  const [barcode, setBarcode] = useState(null);

  useEffect(() => {
    const fetchBarcode = async () => {
      const res = await axios.get(`/api/assets/${asset.id}/barcode`);
      setBarcode(res.data.barcode_svg); // base64
    };
    fetchBarcode();
  }, [asset.id]);

  return (
    <div className="barcode-container">
      <img src={`data:image/svg+xml;base64,${barcode}`} alt="Barcode" />
      <p className="barcode-text">{asset.asset_code}</p>
    </div>
  );
}