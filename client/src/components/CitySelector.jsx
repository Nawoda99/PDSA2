import React from "react";

export default function CitySelector({ cityNames, selected, setSelected, home }) {
  function toggle(i) {
    if (i === home) return;
    if (selected.includes(i)) setSelected(selected.filter((x) => x !== i));
    else setSelected([...selected, i]);
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {cityNames.map((c, i) => (
        <button
          key={c}
          disabled={i === home}
          onClick={() => toggle(i)}
          className={`p-2 rounded border text-sm ${
            i === home
              ? "bg-yellow-200 border-yellow-300"
              : selected.includes(i)
              ? "bg-sky-600 text-white border-sky-700"
              : "bg-white hover:bg-slate-50"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
