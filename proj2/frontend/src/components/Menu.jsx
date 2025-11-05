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
    // Only confirm when at least one item is selected. If so, generate a PIN,
    // pass it to the parent and show it to the joining user.
    if (selectedItems.length > 0) {
      const generatedPin = String(Math.floor(1000 + Math.random() * 9000));
      onConfirm(selectedItems, generatedPin);
      setSelectedItems([]);
      // Show the PIN to the user so they can give it to the runner.
      alert(`Your 4-digit PIN is ${generatedPin}. Give this to the runner when they arrive.`);
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
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleConfirm}>
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
