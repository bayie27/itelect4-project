import { useState } from "react";

export function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = (): void => setValue((prev) => !prev);
  return [value, toggle];
}
