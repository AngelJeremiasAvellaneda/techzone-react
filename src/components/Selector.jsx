// src/components/Selector.jsx
import React from "react";

export default function Selector({ nombre, valor, setValor, opciones = [] }) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1">{nombre}</label>
      <select
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="dark:bg-black w-full p-2 rounded bg-[var(--bg)] border border-gray-600 focus:outline-none focus:border-indigo-500"
      >
        <option value="all">Todos</option>
        {opciones.map((opcion, i) => (
          <option key={i} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    </div>
  );
}
