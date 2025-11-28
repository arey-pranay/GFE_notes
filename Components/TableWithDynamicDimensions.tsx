import { useState } from "react";

export default function App() {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
 
  return (
    <div>
      <input type="number" onChange={(e) => setRows(e.target.value)} />
      <input type="number" onChange={(e) => setCols(e.target.value)} />

      <table>
        <tbody>
          {Array.from({ length: rows }, () => 0).map((_, row) => (
            <tr key={row}>
              {Array.from({ length: cols }, () => 0).map((_, col) => (
                <td key={col}>
                 
                     {rows * col + (row + 1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
