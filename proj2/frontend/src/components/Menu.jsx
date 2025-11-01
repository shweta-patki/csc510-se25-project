// src/components/MenuPopup.jsx
import React, { useState ,useEffect} from "react";

export default function Menu({ restaurant, menuItems, onClose, onConfirm }) {
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSelectItem = (itemName) => {
    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((i) => i !== itemName)
        : [...prev, itemName]
    );
  };

  const handleConfirm = () => {
    if (selectedItems.length > 0) {
      onConfirm(selectedItems);
      setSelectedItems([]);
    }
    onClose();
  };

  return (
    <div className="menu-popup">
      <div className="menu-popup-content">
        <h4>Select items from {restaurant}</h4>

        <ul className="menu-list">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`menu-item ${
                selectedItems.includes(item.name) ? "selected" : ""
              }`}
              onClick={() => handleSelectItem(item.name)}
            >
              {item.name} - ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>

        <div className="menu-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}
