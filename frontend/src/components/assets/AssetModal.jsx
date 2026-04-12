import Modal from "../shared/Modal";
import AssetForm from "./AssetForm";

const AssetModal = ({
  isOpen = false,
  onClose,
  selectedAsset = null,
  onSuccess,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <AssetForm
        asset={selectedAsset}
        onSuccess={onSuccess}
        onClose={onClose}
      />
    </Modal>
  );
};

export default AssetModal;