/** @format */

import { useEffect, useState } from "react";

export default function useDebounce(value: any, timeout = 500) {
  let [finalValue, setFinal] = useState<any>(value);
  useEffect(() => {
    let handle = () => {
      setFinal(value);
    };
    let setTime = setTimeout(handle, timeout);
    return () => clearTimeout(setTime);
  }, [value, timeout]);
  return finalValue;
}
