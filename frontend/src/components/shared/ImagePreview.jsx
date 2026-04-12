import Modal from "./Modal";

const ImagePreview = ({ image, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose}>

      <div className="relative">

        {/* IMAGE */}
        <img
          src={image}
          alt="preview"
          style={{
            width: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
            borderRadius: "10px",
          }}
        />

        {/* CLOSE BUTTON (ONLY INSIDE MODAL) */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ✕
        </button>

      </div>

    </Modal>
  );
};

export default ImagePreview;